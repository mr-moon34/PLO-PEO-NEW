import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiTrash2, FiSearch, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const FinalResultRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch records from the API
  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/final-result/`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch records');
      setRecords(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // View record details
  const handleView = (id) => {
    navigate(`/final-result/${id}`);
  };

  // Delete a record
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/final-result/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      setRecords(records.filter(r => r._id !== id)); // Remove the deleted record from the list
    } catch (err) {
      alert('Error deleting record: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter records based on the search term
  const filteredRecords = records.filter(rec => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (rec.batch && rec.batch.toLowerCase().includes(searchLower)) ||
      (rec.fileNames && rec.fileNames.join(', ').toLowerCase().includes(searchLower)) ||
      (rec.createdAt && new Date(rec.createdAt).toLocaleString().toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-0">
      {/* Header Section */}
      <div className="bg-white p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Final Result Analysis Records</h1>
            <p className="text-gray-500 mt-1">
              {records.length} {records.length === 1 ? 'record' : 'records'} found
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

      {/* Main Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 font-semibold p-4 bg-red-50 rounded-lg">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Names</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? 'No matching records found' : 'No records available'}
                    </td>
                  </tr>
                ) : (
                  [...filteredRecords]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort records by date (newest first)
                    .map(rec => (
                      <tr key={rec._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {rec.students && rec.students.length > 0
                              ? rec.students[0].batch.slice(0, 2) // Show batch abbreviation
                              : rec.batch.slice(0, 2)} 
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{new Date(rec.createdAt).toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {rec.fileNames && rec.fileNames.map((name, idx) => (
                              <span key={idx} title={name}>
                                {name.length > 20 ? name.slice(0, 20) + '...' : name}
                                {idx < rec.fileNames.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-4">
                            {/* View Button */}
                            <button
                              onClick={() => handleView(rec._id)}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            >
                              <FiEye className="mr-1" />
                              <span>View</span>
                              <FiChevronRight className="ml-1" />
                            </button>
                            {/* Delete Button (only for admin) */}
                            {user?.isAdmin && (
                              <button
                                onClick={() => handleDelete(rec._id)}
                                disabled={deletingId === rec._id}
                                className={`flex items-center ${deletingId === rec._id ? 'text-gray-400' : 'text-red-600 hover:text-red-900'}`}
                              >
                                <FiTrash2 className="mr-1" />
                                <span>{deletingId === rec._id ? 'Deleting...' : 'Delete'}</span>
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
      </div>
    </div>
  );
};

export default FinalResultRecordsPage;
