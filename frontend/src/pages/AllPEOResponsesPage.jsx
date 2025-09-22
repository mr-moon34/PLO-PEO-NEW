import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Label, ResponsiveContainer } from 'recharts';
import { useAuth } from '../AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FiEye, FiTrash2, FiSearch, FiChevronRight, FiDownload } from 'react-icons/fi';

const AllPEOResponsesPage = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewed, setViewed] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { token, user } = useAuth();
  const [showPdfArea, setShowPdfArea] = useState(false);
  const pdfAreaRef = useRef();
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAnalyses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/peo`);
      setAnalyses(res.data);
    } catch (err) {
      setError('Error fetching records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/peo/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalyses(analyses.filter(a => a._id !== id));
      if (viewed && viewed._id === id) setViewed(null);
    } catch (err) {
      alert('Error deleting record');
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (analysis) => {
    setViewed(analysis);
  };

  const handleDownloadPDF = async () => {
    setShowPdfArea(true);
    setTimeout(async () => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const canvas = await html2canvas(pdfAreaRef.current, { 
        backgroundColor: "#fff", 
        scale: 2 
      });
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
      pdf.save(`${viewed.batch} PEO Responses.pdf`);
      setShowPdfArea(false);
    }, 100);
  };

  const filteredAnalyses = analyses.filter(analysis => {
    const searchLower = searchTerm.toLowerCase();
    return (
      analysis.batch.toLowerCase().includes(searchLower) ||
      new Date(analysis.createdAt).toLocaleString().toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-0">
      {/* Header Section - only show when not viewing detail */}
      {!viewed && (
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">PEO Assessment Records</h1>
              <p className="text-gray-500 mt-1">
                {analyses.length} {analyses.length === 1 ? 'record' : 'records'} available
              </p>
            </div>
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search records..."
                className="pl-10 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 font-semibold p-4 bg-red-50 rounded-lg">{error}</div>
        ) : (
          <>
            {/* Viewed Analysis Section (Detail View) */}
            {viewed ? (
              <div className="mt-4">
                <button
                  onClick={() => setViewed(null)}
                  className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Back to List
                </button>
                <div className="border-t pt-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                      PEO Analysis Result (Batch: {viewed.batch})
                    </h2>
                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <FiDownload className="mr-2" />
                      Download PDF
                    </button>
                  </div>
                  {/* PDF Content (hidden until download) */}
                  <div ref={pdfAreaRef} className="p-6" style={{ backgroundColor: 'white' }}>
                    {/* Header with Batch Info */}
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">PEO Analysis Result</h2>
                      <div className="mt-2 text-lg text-gray-600">Batch: {viewed.batch}</div>
                      <div className="text-sm text-gray-500">
                        Created At: {new Date(viewed.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {/* Results Table */}
                    <div className="mb-8">
                      <table className="min-w-full border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left">PEOs</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Alumni Survey (%)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Employer Survey (%)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left bg-green-100">Average</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[1,2,3,4].map(i => (
                            <tr key={i}>
                              <td className="border border-gray-300 px-4 py-2">PEO {i}</td>
                              <td className="border border-gray-300 px-4 py-2">{viewed.alumniPercentages[`peo${i}`]}</td>
                              <td className="border border-gray-300 px-4 py-2">{viewed.employerPercentages[`peo${i}`]}</td>
                              <td className="border border-gray-300 px-4 py-2 bg-green-50 font-semibold">
                                {viewed.averages[`peo${i}`]}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Chart */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-center mb-4">PEO Attainment of Graduating Batch</h3>
                      <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { peo: 'PEO 1', attainment: viewed.averages.peo1 },
                              { peo: 'PEO 2', attainment: viewed.averages.peo2 },
                              { peo: 'PEO 3', attainment: viewed.averages.peo3 },
                              { peo: 'PEO 4', attainment: viewed.averages.peo4 }
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
                            <Bar dataKey="attainment" fill="#003366" barSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Records Table (List View)
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAnalyses.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                          {searchTerm ? 'No matching records found' : 'No records available'}
                        </td>
                      </tr>
                    ) : (
                      filteredAnalyses.map(a => (
                        <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{a.batch}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(a.createdAt).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-4">
                              <button
                                onClick={() => handleView(a)}
                                className="text-indigo-600 hover:text-indigo-900 flex items-center"
                              >
                                <FiEye className="mr-1" />
                                <span>View</span>
                              </button>
                              {user?.isAdmin && (
                                <button
                                  onClick={() => handleDelete(a._id)}
                                  disabled={deletingId === a._id}
                                  className={`flex items-center ${deletingId === a._id ? 'text-gray-400' : 'text-red-600 hover:text-red-900'}`}
                                >
                                  <FiTrash2 className="mr-1" />
                                  <span>{deletingId === a._id ? 'Deleting...' : 'Delete'}</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllPEOResponsesPage;