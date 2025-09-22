import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiFileText, FiArrowRight } from 'react-icons/fi';
import FileUpload from '../components/FileUpload';

const UploadPage = () => {
  const navigate = useNavigate();

  const handleUploadSuccess = (assessment) => {
    navigate(`/results/${assessment._id}`);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-0 m-0">
      <div className="w-full max-w-4xl px-0 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-white p-3 rounded-full shadow-md mb-4">
            <FiUploadCloud className="text-indigo-600 text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Assessment Data</h1>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            Upload your Excel file to process PLO/PEO assessment results
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
            <div className="flex items-center">
              <FiFileText className="text-2xl mr-3" />
              <h2 className="text-xl font-semibold">File Requirements</h2>
            </div>
            <ul className="mt-3 text-blue-100 space-y-1 text-sm">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Excel (.xlsx, .xls) format only</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>File size should not exceed 5MB</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Ensure data follows the required template</span>
              </li>
            </ul>
          </div>

          {/* Upload Component */}
          <div className="p-6">
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-500">
              <FiArrowRight className="mr-2" />
              <span>Results will be available immediately after processing</span>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default UploadPage;
