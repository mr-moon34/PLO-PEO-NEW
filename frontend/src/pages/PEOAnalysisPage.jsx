import React, { useState, useRef } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Label, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PEOAnalysisPage = () => {
  const [alumniFile, setAlumniFile] = useState(null);
  const [employerFile, setEmployerFile] = useState(null);
  const [batch, setBatch] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const tableRef = useRef();
  const chartRef = useRef();

  const handleFileChange = (e, setFile) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    if (!alumniFile || !employerFile || !batch) {
      setError('Please provide all fields.');
      setIsLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append('alumniFile', alumniFile);
    formData.append('employerFile', employerFile);
    formData.append('batch', batch);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/peo/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    // Table ko image me convert karo
    const tableCanvas = await html2canvas(tableRef.current);
    const tableImgData = tableCanvas.toDataURL('image/png');
    pdf.addImage(tableImgData, 'PNG', 10, 10, 190, 40); // adjust height as needed

    // Chart ko image me convert karo
    const chartCanvas = await html2canvas(chartRef.current);
    const chartImgData = chartCanvas.toDataURL('image/png');
    pdf.addImage(chartImgData, 'PNG', 10, 60, 190, 80); // adjust y and height as needed

    pdf.save('peo-analysis.pdf');
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">PEO Analysis</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block font-semibold mb-1">Graduating Batch</label>
          <input
            type="text"
            value={batch}
            onChange={e => setBatch(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="e.g. 20SW"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Alumni Survey File</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={e => handleFileChange(e, setAlumniFile)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Employer Survey File</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={e => handleFileChange(e, setEmployerFile)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        {error && <div className="text-red-600 font-semibold">{error}</div>}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-700 text-white px-6 py-2 rounded font-bold hover:bg-blue-800 transition"
        >
          {isLoading ? 'Processing...' : 'Upload & Calculate'}
        </button>
      </form>
      {result && (
        <>
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-2">Program Educational Objectives (PEOs) Analysis</h3>
            <div className="mb-2 font-semibold">Graduating Batch: <span className="text-blue-700">{result.batch}</span></div>
            <div className="overflow-x-auto">
              <table className="min-w-full border" ref={tableRef}>
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-3 py-2">PEOs</th>
                    <th className="border px-3 py-2">PEO Indirect Assessment (Alumni Survey %)</th>
                    <th className="border px-3 py-2">PEO Indirect Assessment (Employer Survey %)</th>
                    <th className="border px-3 py-2 bg-green-100">Average (A & B)</th>
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3,4].map(i => (
                    <tr key={i}>
                      <td className="border px-3 py-2">PEO {i}</td>
                      <td className="border px-3 py-2">{result.alumniPercentages[`peo${i}`]}</td>
                      <td className="border px-3 py-2">{result.employerPercentages[`peo${i}`]}</td>
                      <td className="border px-3 py-2 bg-green-50 font-semibold">{result.averages[`peo${i}`]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Bar Chart for PEO Attainment */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">PEO Attainment of Graduating Batch</h3>
            <ResponsiveContainer width="100%" height={350} ref={chartRef}>
              <BarChart
                data={[
                  { peo: 'PEO 1', attainment: result.averages.peo1 },
                  { peo: 'PEO 2', attainment: result.averages.peo2 },
                  { peo: 'PEO 3', attainment: result.averages.peo3 },
                  { peo: 'PEO 4', attainment: result.averages.peo4 },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="peo">
                  <Label value="PEOs" offset={-10} position="insideBottom" />
                </XAxis>
                <YAxis domain={[0, 110]}>
                  <Label value="Percentage of achievement" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip />
                <Bar dataKey="attainment" fill="#003366" barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download All as PDF
          </button>
        </>
      )}
    </div>
  );
};

export default PEOAnalysisPage; 