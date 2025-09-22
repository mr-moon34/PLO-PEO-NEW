import React from 'react';

const ResultsTable = ({ assessment }) => {
  if (!assessment) {
    return <div>Loading...</div>;
  }

  console.log("Rendering with indirectResults:", assessment.indirectResults); // Debug log

  // No need to convert Map here since backend already sends a plain object
  const indirectResults = assessment.indirectResults;

  // Create an array of PLOs with all required values
  const plos = Array.from({ length: 12 }, (_, i) => {
    const ploKey = `plo${i + 1}`;
    const ploLabel = `PLO ${i + 1}`;
    
    // Get the indirect percentage from the indirectResults
    const indirectPercentage = indirectResults[ploLabel]?.percentage || 0;
    
    return (
      <tr key={ploKey}>
        <td className="px-1 md:px-4 py-2">{ploLabel}</td>
        <td className="px-1 md:px-4 py-2">{indirectPercentage}%</td> {/* Display the indirect percentage */}
        <td className="px-1 md:px-4 py-2">{assessment.directData[ploKey] ?? ""}</td>
        <td className="px-1 md:px-4 py-2">{assessment.cohortIndirect[ploKey] ?? ""}</td>
        <td className="px-1 md:px-4 py-2">{assessment.cohortDirect[ploKey] ?? ""}</td>
        <td className="px-1 md:px-4 py-2">{assessment.cumulative[ploKey] ?? ""}</td>
      </tr>
    );
  });

  // CSV download handler
  const handleDownloadCSV = () => {
    // Table headers
    const headers = ['PLOs', 'Indirect (%)', 'Direct (%)', 'Cohort Indirect', 'Cohort Direct', 'Cumulative'];
    // Table rows
    const rows = plos.map(row =>
      [row.props.children[0], row.props.children[1], row.props.children[2], row.props.children[3], row.props.children[4], row.props.children[5]]
    );
    // CSV string
    const csvContent =
      [headers, ...rows]
        .map(e => e.join(','))
        .join('\n');

    // Download logic
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plo-responses.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">PLO Analysis Results</h2>
      
      <div className="overflow-x-auto">
      
        <table className="min-w-full bg-white border border-gray-200 text-xs md:text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-2 px-1 md:px-4 text-left border">PLOs</th>
              <th className="py-2 px-1 md:px-4 text-left border">Indirect (%)</th>
              <th className="py-2 px-1 md:px-4 text-left border">Direct (%)</th>
              <th className="py-2 px-1 md:px-4 text-left border">Cohort Indirect</th>
              <th className="py-2 px-1 md:px-4 text-left border">Cohort Direct</th>
              <th className="py-2 px-1 md:px-4 text-left border">Cumulative</th>
            </tr>
          </thead>
          <tbody>
            {plos}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;