import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ResultsTable from '../components/ResultsTable';
import ResultsChart from '../components/ResultsChart';
import { FiDownload } from 'react-icons/fi';

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showPdfArea, setShowPdfArea] = useState(false);

  const pdfAreaRef = useRef(); // Reference to the section that needs to be captured for PDF

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setIsLoading(true);
        const url = id
          ? `${import.meta.env.VITE_API_BASE_URL}/api/upload/${id}`
          : `${import.meta.env.VITE_API_BASE_URL}/api/upload`;

        const response = await axios.get(url);

        if (id) {
          setAssessment(response.data);
        } else {
          if (response.data.length > 0) {
            navigate(`/results/${response.data[0]._id}`);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching assessment");
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessment();
  }, [id, navigate]);

  const handleSaveAssessment = async () => {
    setIsSaving(true);
    setSaveStatus("");
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/upload/save`, {
        program: assessment.program,
        batch: assessment.batch,
        yearOfGraduation: assessment.yearOfGraduation,
        indirectResults: assessment.indirectResults,
        directData: assessment.directData,
        cohortIndirect: assessment.cohortIndirect,
        cohortDirect: assessment.cohortDirect,
        cumulative: assessment.cumulative,
      });
      setSaveStatus("Assessment saved successfully!");
      setIsSaved(true);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setSaveStatus("Assessment for this program, batch, and year already exists.");
        setIsSaved(true);
      } else {
        setSaveStatus("Error saving assessment. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    setShowPdfArea(true);
    setTimeout(async () => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const options = {
        backgroundColor: "#fff",
        scale: 2,
        useCORS: true,
        logging: true,
        allowTaint: true
      };

      try {
        // Create a PDF with only the visible content (assessment details, table, and chart)
        const canvas = await html2canvas(pdfAreaRef.current, options);
        const imgData = canvas.toDataURL('image/png');
        
        // Calculate aspect ratio to maintain proportions
        const imgWidth = 190; // mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add image to PDF
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        
        // Add new page if content is too long
        if (imgHeight > 250) { // Rough estimate for page break
          pdf.addPage();
          // You might need to split the content here for multi-page PDFs
        }

        // Generate the file name using batch
        const fileName = `${assessment.batch} PLO Responses.pdf`;

        // Save the PDF with the generated file name
        pdf.save(fileName);
      } catch (err) {
        console.error("Error generating PDF:", err);
        alert("Error generating PDF. Please try again.");
      } finally {
        setShowPdfArea(false);
      }
    }, 500); // Increased timeout to ensure all content renders
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6  ">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Back to Upload
        </button>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="bg-white p-6 ">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">No Assessment Found</h2>
        <p className="mb-4">Please upload files to generate an assessment.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Go to Upload Page
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Download All as PDF button styled like PEO detail */}
      <div className="flex justify-end items-center mb-4">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FiDownload className="mr-2" />
          Download PDF
        </button>
      </div>
      <div className="bg-white p-6  ">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Assessment Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Program</h3>
            <p className="text-lg">{assessment.program}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Batch/Section</h3>
            <p className="text-lg">{assessment.batch}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Year of Graduation</h3>
            <p className="text-lg">{assessment.yearOfGraduation}</p>
          </div>
        </div>

        {saveStatus && (
          <div className="mt-3 text-blue-700 font-semibold">{saveStatus}</div>
        )}
      </div>

      {/* Hidden PDF area - must include all PLOs */}
      {showPdfArea && (
        <div
          ref={pdfAreaRef}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            width: '800px',
            background: '#fff',
            padding: '20px',
          }}
        >
          <h2 className="text-xl font-bold mb-2">Program: {assessment.program}</h2>
          <div className="mb-4">
            <p>Batch/Section: {assessment.batch}</p>
            <p>Year of Graduation: {assessment.yearOfGraduation}</p>
          </div>
          
          <ResultsTable assessment={assessment} showAllPLOs={true} />
          
          <div style={{ width: '100%', height: '400px' }}>
            <ResultsChart assessment={assessment} showAllPLOs={true} />
          </div>
        </div>
      )}

      {/* Visible content */}
      <div className="bg-white p-6  ">
        <ResultsTable assessment={assessment} showAllPLOs={true} />
      </div>

      <div className="bg-white p-6  ">
        <div style={{ width: '100%', height: '400px' }}>
          <ResultsChart assessment={assessment} showAllPLOs={true} />
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
