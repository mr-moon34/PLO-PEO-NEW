import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { FiEye, FiTrash2, FiChevronRight, FiSearch } from 'react-icons/fi';

const DataTable = ({ assessments, onDelete }) => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredAssessments = assessments.filter(assessment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      assessment.program.toLowerCase().includes(searchLower) ||
      assessment.batch.toLowerCase().includes(searchLower) ||
      assessment.yearOfGraduation.toString().includes(searchLower)
    );
  });

  const handleRowClick = (id) => {
    navigate(`/results/${id}`);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/upload/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (onDelete) onDelete(id);
    } catch (err) {
      alert('Error deleting assessment.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with Search */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Assessment Records</h2>
            <p className="text-gray-500 mt-1">
              {assessments.length} {assessments.length === 1 ? 'record' : 'records'} found
            </p>
          </div>
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search assessments..."
              className="pl-10 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Program
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Batch
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Graduation Year
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Added
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAssessments.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  {searchTerm ? 'No matching records found' : 'No assessments available'}
                </td>
              </tr>
            ) : (
              filteredAssessments.map((assessment) => (
                <tr 
                  key={assessment._id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(assessment._id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{assessment.program}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{assessment.batch}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{assessment.yearOfGraduation}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(assessment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(assessment._id);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <span>View</span>
                        <FiChevronRight className="ml-1" />
                      </button>
                      {user?.isAdmin && (
                        <button
                          onClick={(e) => handleDelete(assessment._id, e)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <FiTrash2 className="mr-1" />
                          <span>Delete</span>
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

      {/* Pagination/Footer (optional) */}
      {filteredAssessments.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredAssessments.length}</span> of{' '}
              <span className="font-medium">{assessments.length}</span> results
            </div>
            {/* Pagination buttons would go here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;