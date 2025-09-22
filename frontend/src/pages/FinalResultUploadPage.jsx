import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getSessionId() {
  let sessionId = localStorage.getItem('finalResultSessionId');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2) + Date.now();
    localStorage.setItem('finalResultSessionId', sessionId);
  }
  return sessionId;
}

const FinalResultUploadPage = () => {
  const [failureFile, setFailureFile] = useState(null);
  const [nonPLOFile, setNonPLOFile] = useState(null);
  const [failureUploaded, setFailureUploaded] = useState(false);
  const [nonPLOUploaded, setNonPLOUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const sessionId = getSessionId();

  const handleUpload = async (type) => {
    setError('');
    setLoading(true);
    const file = type === 'failure' ? failureFile : nonPLOFile;
    if (!file) {
      setError('Please select a file to upload.');
      setLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);
    try {
      const endpoint =
        type === 'failure'
          ? `${API_BASE_URL}/api/final-result/upload-failure`
          : `${API_BASE_URL}/api/final-result/upload-nonplo`;
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = {};
      }
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      if (type === 'failure') setFailureUploaded(true);
      if (type === 'nonPLO') setNonPLOUploaded(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/final-result/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = {};
      }
      if (!res.ok) throw new Error(data.message || 'Calculation failed');
      if (!data.id) {
        setError('No result ID returned from server. Please try again.');
        setLoading(false);
        return;
      }
      localStorage.removeItem('finalResultSessionId');
      navigate(`/final-result/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-6">Final Result Analysis - Upload Files</h2>
      <div className="mb-4">
        <label className="block font-medium mb-2">Failure File (Excel):</label>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={e => setFailureFile(e.target.files[0])}
          disabled={failureUploaded}
          className="w-full border p-2 rounded"
        />
        <button
          className="ml-3 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          onClick={() => handleUpload('failure')}
          disabled={loading || failureUploaded}
        >
          {failureUploaded ? 'Uploaded' : 'Upload'}
        </button>
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-2">Non-PLO File (Excel):</label>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={e => setNonPLOFile(e.target.files[0])}
          disabled={nonPLOUploaded}
          className="w-full border p-2 rounded"
        />
        <button
          className="ml-3 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          onClick={() => handleUpload('nonPLO')}
          disabled={loading || nonPLOUploaded}
        >
          {nonPLOUploaded ? 'Uploaded' : 'Upload'}
        </button>
      </div>
      <div className="mb-6">
        <button
          className="px-6 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          onClick={handleCalculate}
          disabled={!failureUploaded || !nonPLOUploaded || loading}
        >
          Calculate & Save
        </button>
      </div>
      {error && <div className="text-red-600 font-medium mb-2">{error}</div>}
    </div>
  );
};

export default FinalResultUploadPage;
