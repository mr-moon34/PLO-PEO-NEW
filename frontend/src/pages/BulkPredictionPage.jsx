// BulkPredictionPage.jsx
import React, { useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const BulkPredictionPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);

  // Load saved rows on first mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bulk_predictions_rows');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setRows(parsed);
      }
      else {
        const s2 = sessionStorage.getItem('bulk_predictions_rows');
        if (s2) {
          const parsed2 = JSON.parse(s2);
          if (Array.isArray(parsed2)) setRows(parsed2);
        }
      }
    } catch {}
  }, []);

  // Persist rows whenever they change
  useEffect(() => {
    try {
      if (!rows || rows.length === 0) return; // avoid overwriting saved data with empty state on refresh
      const payload = JSON.stringify(rows);
      localStorage.setItem('bulk_predictions_rows', payload);
      sessionStorage.setItem('bulk_predictions_rows', payload);
    } catch {}
  }, [rows]);

  const onUpload = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) { setError('Please select an Excel file (.xlsx/.xls)'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/api/ml/predict-bulk`, { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setRows(data.results || []);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!rows.length) return;
    const header = ['Registration No.', 'Name', ...Array.from({ length: 12 }, (_, i) => `SE PLO ${String(i+1).padStart(2,'0')}`)];
    const lines = [header.join(',')];
    rows.forEach((r) => {
      const vals = (r.predictedPLOs || []).map((v) => Number(v).toFixed(2));
      while (vals.length < 12) vals.push('0.00');
      const row = [r.regNo || '', r.name || '', ...vals]
        .map((v) => (String(v).includes(',') ? `"${String(v).replace(/"/g,'""')}"` : String(v)))
        .join(',');
      lines.push(row);
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'predictions.csv');
  };

  const downloadStyledExcel = async () => {
    if (!rows.length) return;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Predictions');

    ws.columns = [
      { header: 'Registration No.', key: 'reg', width: 18 },
      { header: 'Name', key: 'name', width: 24 },
      ...Array.from({ length: 12 }, (_, i) => ({ header: `SE PLO ${String(i+1).padStart(2,'0')}`, key: `p${i+1}`, width: 12 }))
    ];

    const title = ws.addRow(['Student wise Program Outcome (PLO) Attainment']);
    title.font = { bold: true, size: 14 };
    ws.mergeCells(1, 1, 1, 14);
    ws.addRow(['Program : Bachelor of Software Engineering']);
    ws.mergeCells(2, 1, 2, 14);
    ws.addRow(['Program Batch : 20SW      Faculty : Faculty of Electrical Electronic & Computer Engineering']);
    ws.mergeCells(3, 1, 3, 14);
    ws.addRow([]);

    const headerRow = ws.addRow(ws.columns.map(c => c.header));
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' } };
    });

    rows.forEach((r) => {
      const vals = (r.predictedPLOs || []).map((v) => Number(v).toFixed(2));
      while (vals.length < 12) vals.push('0.00');
      const row = ws.addRow([r.regNo || '', r.name || '', ...vals]);
      row.eachCell((cell, col) => {
        cell.alignment = { vertical: 'middle', horizontal: col <= 2 ? 'left' : 'right' };
        if (col > 2) {
          const num = Number(cell.value);
          if (num >= 85) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8FFF1' } };
          else if (num < 60) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF1F2' } };
        }
      });
    });

    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'predictions_styled.xlsx');
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Bulk Predictions (Excel)</h1>
      <p className="text-sm text-gray-600 mb-4">Upload an Excel file with columns like Registration No., Name, and PLO1..PLO12 (or SE PLO 01..12). We’ll predict 8th semester PLOs.</p>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border">{error}</div>}

      <form onSubmit={onUpload} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button type="submit" disabled={loading} className={`px-4 py-2 rounded text-white w-full sm:w-auto ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
          {loading ? 'Uploading…' : 'Upload & Predict'}
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={downloadCSV} className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700">Download CSV</button>
          <button type="button" onClick={downloadStyledExcel} className="px-3 py-2 rounded bg-purple-600 text-white hover:bg-purple-700">Download Styled Excel</button>
          <button
            type="button"
            onClick={() => { setRows([]); localStorage.removeItem('bulk_predictions_rows'); sessionStorage.removeItem('bulk_predictions_rows'); }}
            className="px-3 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
          >
            Clear Saved
          </button>
        </div>
      </form>

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 border-b">Reg No.</th>
                <th className="px-3 py-2 border-b">Name</th>
                {Array.from({ length: 12 }).map((_, i) => (
                  <th key={i} className="px-3 py-2 border-b">Pred PLO{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx} className={idx % 2 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 border-b font-medium text-gray-800">{r.regNo}</td>
                  <td className="px-3 py-2 border-b text-gray-700">{r.name}</td>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <td key={i} className="px-3 py-2 border-b text-right">{Number(r.predictedPLOs?.[i] ?? 0).toFixed(2)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BulkPredictionPage;
