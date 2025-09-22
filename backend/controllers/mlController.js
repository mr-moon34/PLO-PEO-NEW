// controllers/mlController.js
export const predictScores = async (req, res) => {
  try {
    const modelUrl = process.env.MODEL_URL || 'http://127.0.0.1:8000/invocations';
    const { inputs } = req.body || {};

    if (!Array.isArray(inputs) || inputs.length === 0 || !Array.isArray(inputs[0])) {
      return res.status(400).json({ message: 'Invalid payload: expected { inputs: [[gender, semester, PLO1..PLO12]] }' });
    }

    const sanitized = inputs.map((row) => {
      const arr = Array.isArray(row) ? row.slice(0, 14) : [];
      while (arr.length < 14) arr.push(0);
      return arr.map((v, idx) => {
        if (idx === 0) return (v === -1 || v === 0 || v === 1) ? v : 0;
        if (idx === 1) {
          const s = Number(v);
          if (!Number.isFinite(s)) return 1;
          return Math.min(7, Math.max(1, Math.round(s)));
        }
        const n = Number(v);
        if (!Number.isFinite(n)) return 0;
        return Math.min(100, Math.max(0, n));
      });
    });

    if (typeof fetch !== 'function') {
      return res.status(500).json({ message: 'Server fetch() unavailable. Please use Node 18+ or add a fetch polyfill.' });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const response = await fetch(modelUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: sanitized }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch {}
    if (!response.ok) {
      return res.status(response.status || 502).json({ message: 'Model server error', details: data });
    }

    return res.json(data);
  } catch (err) {
    console.error('[ML] Prediction error:', err);
    return res.status(500).json({ message: 'Prediction failed', error: err.message });
  }
};

// Bulk predictions from uploaded Excel
import XLSX from 'xlsx';

export const predictBulkFromExcel = async (req, res) => {
  try {
    const modelUrl = process.env.MODEL_URL || 'http://127.0.0.1:8000/invocations';
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Use field name "file".' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    const norm = (v) => String(v).toLowerCase().replace(/[^a-z0-9]/g, '');
    const headerRowIdx = matrix.findIndex((row) => {
      if (!Array.isArray(row)) return false;
      const joined = row.map(norm);
      const hasReg = joined.some((c) => c.includes('registrationno'));
      const hasName = joined.some((c) => c === 'name');
      const hasPlo = joined.some((c) => c.startsWith('seplo') || c.startsWith('plo'));
      return hasReg && hasName && hasPlo;
    });

    if (headerRowIdx === -1) {
      return res.status(400).json({ message: 'Could not detect header row. Ensure columns: Registration No., Name, SE PLO 01..12 or PLO1..12' });
    }

    const rangeStart = headerRowIdx;
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', range: rangeStart });

    const normalizeKey = (k) => String(k).toLowerCase().replace(/\s+/g, '').replace(/\./g, '');
    const inputs = [];
    const indexToStudent = [];

    rows.forEach((row, idx) => {
      const entries = Object.entries(row);
      const normalized = {};
      for (const [k, v] of entries) normalized[normalizeKey(k)] = v;

      const regNo = normalized['registrationno'] || normalized['regno'] || normalized['registration'] || normalized['rollno'] || '';
      const name = normalized['name'] || '';

      const plos = [];
      for (let i = 1; i <= 12; i++) {
        const k1 = `seplo${String(i).padStart(2, '0')}`;
        const k2 = `seplo${i}`;
        const k3 = `plo${String(i).padStart(2, '0')}`;
        const k4 = `plo${i}`;
        const raw = normalized[k1] ?? normalized[k2] ?? normalized[k3] ?? normalized[k4] ?? 0;
        const n = Number(raw);
        plos.push(Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0);
      }

      const gender = -1;
      const semester = 6;
      const rowInput = [gender, semester, ...plos];
      inputs.push(rowInput);
      indexToStudent.push({ idx, regNo, name });
    });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const resp = await fetch(modelUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const text = await resp.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch {}
    if (!resp.ok) {
      return res.status(resp.status || 502).json({ message: 'Model server error', details: data });
    }

    const predictions = Array.isArray(data.predictions) ? data.predictions : [];
    const merged = predictions.map((pred, i) => {
      const pred8 = Array.isArray(pred) ? pred.map((v) => Number(v)) : [];
      const orig = inputs[i].slice(2, 14); // original PLO1..12 from row input
      const sem5 = [], sem6 = [], sem7 = [];
      for (let p = 0; p < 12; p++) {
        const o = Number(orig[p] ?? 0);
        const e8 = Number(pred8[p] ?? o);
        const step = (e8 - o) / 4; // interpolate 5,6,7 towards 8
        const s5 = Math.max(0, Math.min(100, o + step));
        const s6 = Math.max(0, Math.min(100, o + 2 * step));
        const s7 = Math.max(0, Math.min(100, o + 3 * step));
        sem5.push(Number(s5));
        sem6.push(Number(s6));
        sem7.push(Number(s7));
      }
      return {
        regNo: indexToStudent[i]?.regNo || '',
        name: indexToStudent[i]?.name || '',
        originalPLOs: orig,
        bySemester: {
          sem5,
          sem6,
          sem7,
          sem8: pred8,
        },
        predictedPLOs: pred8,
      };
    });

    return res.json({ count: merged.length, results: merged });
  } catch (err) {
    console.error('[ML] Bulk prediction error:', err);
    return res.status(500).json({ message: 'Bulk prediction failed', error: err.message });
  }
};
