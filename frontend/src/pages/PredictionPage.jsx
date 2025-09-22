import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const initialPLOs = Array.from({ length: 12 }, () => '');

const PredictionPage = () => {
  const [gender, setGender] = useState('0');
  const [semester, setSemester] = useState('6');
  const [plos, setPlos] = useState(initialPLOs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [predictions, setPredictions] = useState(null);

  const handlePloChange = (index, value) => {
    const next = [...plos];
    next[index] = value;
    setPlos(next);
  };

  const toNumberOrZero = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setPredictions(null);
    try {
      const row = [
        Number(gender),
        Number(semester),
        ...plos.map((v) => Math.max(0, Math.min(100, toNumberOrZero(v))))
      ];

      const res = await fetch(`${API_BASE}/api/ml/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: [row] })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Prediction failed');
      setPredictions(Array.isArray(data.predictions) ? data.predictions[0] : null);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Predict 8th Semester PLOs</h1>
      <p className="text-sm text-gray-600 mb-6">Enter Gender, Semester (1–7), and available PLO1–PLO12 scores (0–100). Leave blank for missing; blanks are treated as 0.</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select className="w-full border rounded px-3 py-2" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="0">Male (0)</option>
              <option value="1">Female (1)</option>
              <option value="-1">Not specified (-1)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select className="w-full border rounded px-3 py-2" value={semester} onChange={(e) => setSemester(e.target.value)}>
              {[1,2,3,4,5,6,7].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">PLO Scores (0–100)</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {plos.map((val, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-xs text-gray-600 mb-1">PLO{idx + 1}</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="border rounded px-3 py-2"
                  value={val}
                  onChange={(e) => handlePloChange(idx, e.target.value)}
                  placeholder="e.g., 75.5"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {loading ? 'Predicting…' : 'Predict'}
        </button>
      </form>

      {predictions && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Predicted 8th Semester PLOs</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded">
              <thead className="bg-gray-50">
                <tr>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <th key={i} className="px-3 py-2 text-left text-xs font-medium text-gray-600 border-b">PLO{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {predictions.map((v, i) => (
                    <td key={i} className="px-3 py-2 border-b text-sm text-gray-800">{Number(v).toFixed(2)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Chart */}
          <div className="mt-6 bg-white p-4 rounded border">
            <Bar
              data={{
                labels: Array.from({ length: 12 }, (_, i) => `PLO ${i + 1}`),
                datasets: [
                  {
                    label: 'Predicted PLO',
                    data: predictions.map((v) => Number(v).toFixed(2)),
                    backgroundColor: 'rgba(99, 102, 241, 0.6)'
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Predicted 8th Semester PLOs' }
                },
                scales: { y: { beginAtZero: true, max: 100 } }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionPage;


