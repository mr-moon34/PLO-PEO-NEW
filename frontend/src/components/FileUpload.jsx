import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [step, setStep] = useState(1);
  const [indirectFile, setIndirectFile] = useState(null);
  const [directFile, setDirectFile] = useState(null);
  const [indirectResults, setIndirectResults] = useState(null);
  const [directResults, setDirectResults] = useState(null);
  const [finalAssessment, setFinalAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e, setFile) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleIndirectUpload = async (e) => {
    e.preventDefault();
    
    if (!indirectFile) {
      setError("Please upload a file");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("indirectFile", indirectFile);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/upload/indirect`, 
        formData, 
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setIndirectResults(response.data.results);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Error uploading file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectFileUpload = async (e) => {
    e.preventDefault();
    if (!directFile) {
      setError("Please upload a file");
      return;
    }
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("directFile", directFile);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/upload/direct`, 
        formData, 
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setDirectResults(response.data.results.formattedDirectResults);
    } catch (err) {
      setError(err.response?.data?.message || "Error uploading file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCombine = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("directFile", directFile);
    formData.append("indirectResults", JSON.stringify(indirectResults.indirectResults));
    formData.append("program", indirectResults.program);
    formData.append("batch", indirectResults.batch);
    formData.append("yearOfGraduation", indirectResults.yearOfGraduation);

    console.log("Sending indirectResults:", indirectResults.indirectResults); // Debug log

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/upload/direct`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const finalAssessment = response.data.assessment;
      console.log("Received finalAssessment:", finalAssessment); // Debug log
      setFinalAssessment(finalAssessment);
    } catch (err) {
      setError(err.response?.data?.message || "Error combining results");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">
        {step === 1 ? "Step 1: Upload Indirect Assessment" : "Step 2: Upload Direct Assessment"}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleIndirectUpload}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="indirectFile">
              PLO Indirect Assessment File (Graduating Survey)
            </label>
            <input
              type="file"
              id="indirectFile"
              accept=".xlsx,.xls"
              onChange={(e) => handleFileChange(e, setIndirectFile)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isLoading ? "Processing..." : "Upload & Calculate"}
          </button>
        </form>
      ) : (
        <>
          {indirectResults && (
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-bold mb-2">Indirect Assessment Results</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-2 text-left">PLO</th>
                      <th className="px-2 py-2 text-left">Count ≥ 4</th>
                      <th className="px-2 py-2 text-left">Total Responses</th>
                      <th className="px-2 py-2 text-left">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(indirectResults.indirectResults).map(([plo, data]) => (
                      <tr key={plo}>
                        <td className="px-2 py-2">{plo}</td>
                        <td className="px-2 py-2">{data.countCertain}</td>
                        <td className="px-2 py-2">{data.totalResponses}</td>
                        <td className="px-2 py-2">{data.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <form onSubmit={handleDirectFileUpload}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="directFile">
                PLO Direct Assessment File (Student Performance)
              </label>
              <input
                type="file"
                id="directFile"
                accept=".xlsx,.xls"
                onChange={(e) => handleFileChange(e, setDirectFile)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Processing..." : "Upload & Calculate"}
            </button>
          </form>

          {directResults && (
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-bold mb-2">Direct Assessment Results</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-2 text-left">PLO</th>
                      <th className="px-2 py-2 text-left">PLO Direct Assessment (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {directResults.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-2">{row.plo}</td>
                        <td className="px-2 py-2">{row.percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {indirectResults && directResults && (
            <button
              onClick={handleCombine}
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Processing..." : "Combine & Submit"}
            </button>
          )}

          {finalAssessment && (
            <CombinedResultsTable assessment={finalAssessment} />
          )}
        </>
      )}
    </div>
  );
};

const CombinedResultsTable = ({ assessment }) => {
  if (!assessment) return null;

  console.log("Rendering with indirectResults:", assessment.indirectResults); // Debug log

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded">
      <h3 className="font-bold mb-2">PLO Analysis Results</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs md:text-sm">
          <thead>
            <tr>
              <th className="px-1 md:px-2 py-2 text-left">PLO</th>
              <th className="px-1 md:px-2 py-2 text-left">Indirect (%)</th>
              <th className="px-1 md:px-2 py-2 text-left">Direct (%)</th>
              <th className="px-1 md:px-2 py-2 text-left">Cohort Indirect</th>
              <th className="px-1 md:px-2 py-2 text-left">Cohort Direct</th>
              <th className="px-1 md:px-2 py-2 text-left">Cumulative</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 12 }, (_, i) => {
              const ploKey = `plo${i + 1}`;
              const ploLabel = `PLO ${i + 1}`;
              return (
                <tr key={ploKey}>
                  <td className="px-1 md:px-2 py-2">{ploLabel}</td>
                  <td className="px-1 md:px-2 py-2">{assessment.indirectResults[ploLabel]?.percentage ?? ""}</td>
                  <td className="px-1 md:px-2 py-2">{assessment.directData[ploKey] ?? ""}</td>
                  <td className="px-1 md:px-2 py-2">{assessment.cohortIndirect[ploKey] ?? ""}</td>
                  <td className="px-1 md:px-2 py-2">{assessment.cohortDirect[ploKey] ?? ""}</td>
                  <td className="px-1 md:px-2 py-2">{assessment.cumulative[ploKey] ?? ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileUpload;