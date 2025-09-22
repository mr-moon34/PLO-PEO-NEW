import React, { useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ResultsChart = ({ assessment }) => {
  const chartRef = useRef(null);

  // Check if the assessment data is available
  if (!assessment || !assessment.indirectResults || !assessment.directData) {
    return <div>Loading...</div>; // Display loading state if data is not available
  }

  const ploNames = Array.from({ length: 12 }, (_, i) => `PLO ${i + 1}`);

  // No need to convert Map here since backend already sends a plain object
  const indirectResults = assessment.indirectResults;

  // Calculate data for the chart
  const plos = ploNames.map((ploLabel, index) => {
    const ploKey = `plo${index + 1}`;
    
    // Get the indirect percentage from indirectResults
    const indirectPercentage = parseFloat(indirectResults[ploLabel]?.percentage) || 0;
    
    // Get the direct percentage from directData
    const directPercentage = parseFloat(assessment.directData[ploKey]) || 0;

    // Calculate Cohort Indirect, Cohort Direct, and Cumulative values
    const cohortIndirect = (indirectPercentage * 0.2).toFixed(2);
    const cohortDirect = (directPercentage * 0.8).toFixed(2);
    const cumulative = (parseFloat(cohortIndirect) + parseFloat(cohortDirect)).toFixed(2);

    return {
      indirect: cohortIndirect,
      direct: cohortDirect,
      cumulative: cumulative,
    };
  });

  const data = {
    labels: ploNames,
    datasets: [
      {
        label: 'A: Cohort Indirect (20%)',
        data: plos.map(plo => plo.indirect),
        backgroundColor: 'rgba(54, 162, 235, 0.6)', // Blue color
      },
      {
        label: 'B: Cohort Direct (80%)',
        data: plos.map(plo => plo.direct),
        backgroundColor: 'rgba(255, 99, 132, 0.6)', // Red color
      },
      {
        label: 'Cumulative (A + B)',
        data: plos.map(plo => plo.cumulative),
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // Green color
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'PLO Assessment Results',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}%`; // Display percentage in tooltip
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100, // Ensure the Y axis shows percentage from 0 to 100
        title: {
          display: true,
          text: 'Percentage (%)',
        }
      },
      x: {
        title: {
          display: true,
          text: 'Program Learning Outcomes (PLOs)',
        }
      }
    },
  };

  // Chart download handler
  const handleDownloadChart = () => {
    const chart = chartRef.current;
    if (chart) {
      const url = chart.toBase64Image();
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plo-chart.png';
      link.click();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Visual Representation</h2>
     
      <div className="h-96">
        <Bar ref={chartRef} data={data} options={options} />
      </div>
    </div>
  );
};

export default ResultsChart;