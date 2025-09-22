import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAlertCircle, FiSearch, FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../assets/logo.png';

const PLO_COLUMNS = [
  'sePLO01', 'sePLO02', 'sePLO03', 'sePLO04', 'sePLO05', 'sePLO06',
  'sePLO07', 'sePLO08', 'sePLO09', 'sePLO10', 'sePLO11', 'sePLO12'
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Header = ({ batch, department, batchYear, formattedDate }) => (
  <div className="mb-6">
    <div className="flex flex-col items-center border-b border-gray-200 pb-4">
      <img src={logo} alt="Logo" className="h-16 mb-2" />
      <h1 className="text-xl font-bold text-gray-900 tracking-tight">
        MEHRAN UNIVERSITY OF ENGINEERING & TECHNOLOGY
      </h1>
    </div>
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-2 flex justify-between items-center">
      <span className="text-xs font-semibold">FEM-001101/OSP-006</span>
      <span className="text-xs font-semibold">{formattedDate}</span>
    </div>
    <div className="flex items-center gap-4 mt-2">
      {['INFO.ONLY', 'ROUTINE', 'URGENT', 'IMMEDIATE'].map((label, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="w-4 h-4 border-2 border-indigo-600 rounded-sm"></div>
          <span className="text-xs text-indigo-600 font-medium">{label}</span>
        </div>
      ))}
    </div>
    <div className="bg-gray-100 p-3 mt-2 rounded-lg border-l-4 border-indigo-600">
      <div className="text-xs">
        <p><span className="font-semibold text-indigo-600">NO. & Date:</span> MUET/<span className="font-bold text-gray-900">{department}</span>/- {formattedDate}</p>
        <p><span className="font-semibold text-indigo-600">From:</span> Convener OBE committee, <span className="font-bold text-gray-900">{department}</span></p>
        <p><span className="font-semibold text-indigo-600">To:</span> Class Advisor of <span className="font-bold text-gray-900">{batchYear}</span></p>
        <p><span className="font-semibold text-indigo-600">Sub:</span> Improvement required for the non-achievement of students of <span className="font-bold text-gray-900">{batchYear}</span> in the PLOs</p>
      </div>
      <p className="text-xs italic text-gray-500 mt-2">C.C. to: 01. Chairman</p>
    </div>
    <div className="text-xs text-gray-600 mt-2">
      <p>According to the OBE system, the students are required to achieve 50% KPI of the set PLO's in the subjects specified in the degree program.</p>
      <p className="mt-1">The following students have less than 50% achievement in the respective PLOs, therefore they are required to improve those PLOs in the summer semester or subjects of upcoming semesters.</p>
    </div>
    <div className="bg-indigo-600 text-white text-center py-2 mt-2 rounded-lg">
      <h3 className="text-sm font-bold">Final Result Analysis - Batch: {batchYear}</h3>
    </div>
  </div>
);

const TableSection = ({ title, students, emptyNote, searchTerm, forPDF = false }) => {
  const filtered = students.filter(s => {
    const search = searchTerm.toLowerCase();
    return (
      (s.batch && s.batch.toLowerCase().includes(search)) ||
      (s.name && s.name.toLowerCase().includes(search))
    );
  });

  if (forPDF) {
    return (
      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '10px', color: '#333' }}>{title}</div>
        {filtered.length === 0 ? (
          <div style={{ color: '#9CA3AF', fontSize: '9px' }}>{emptyNote}</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '6px' }}>
            <thead>
              <tr style={{ backgroundColor: '#1E3A8A', color: '#fff' }}>
                <th style={{ padding: '6px', border: '1px solid #E5E7EB', textAlign: 'left', fontSize: '9px' }}>Batch</th>
                <th style={{ padding: '6px', border: '1px solid #E5E7EB', textAlign: 'left', fontSize: '9px' }}>Name</th>
                {PLO_COLUMNS.map((_, idx) => (
                  <th 
                    key={idx} 
                    style={{ padding: '6px', border: '1px solid #E5E7EB', textAlign: 'center', fontSize: '9px' }}
                  >
                    {String(idx+1).padStart(2, '0')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#F3F4F6' : '#ffffff' }}>
                  <td style={{ padding: '6px', border: '1px solid #E5E7EB', fontSize: '8px' }}>{student.batch || ''}</td>
                  <td style={{ padding: '6px', border: '1px solid #E5E7EB', maxWidth: '100px', fontSize: '8px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {student.name}
                  </td>
                  {PLO_COLUMNS.map(col => (
                    <td
                      key={col}
                      style={{
                        padding: '6px',
                        border: '1px solid #E5E7EB',
                        textAlign: 'center',
                        fontSize: '8px',
                        backgroundColor: student[col] !== undefined && student[col] < 50 ? '#FEE2E2' : 'transparent',
                        color: student[col] !== undefined && student[col] < 50 ? '#DC2626' : 'inherit',
                        fontWeight: student[col] !== undefined && student[col] < 50 ? 'bold' : 'normal'
                      }}
                    >
                      {student[col] !== undefined ? student[col] : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="text-sm font-bold text-gray-700 mb-1">{title}</div>
      <div className="bg-white rounded-lg border border-gray-200 p-1 overflow-x-auto animate-fade-in-up">
        {filtered.length === 0 ? (
          <div className="text-gray-400 text-xs flex items-center gap-2 p-2"><FiAlertCircle />{emptyNote}</div>
        ) : (
          <table className="min-w-full text-xs text-gray-800 border border-gray-200">
            <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
              <tr>
                <th className="px-1 py-1 font-semibold border-b border-gray-200">Batch</th>
                <th className="px-1 py-1 font-semibold border-b border-gray-200">Name</th>
                {PLO_COLUMNS.map((col, idx) => (
                  <th
                    key={col}
                    className="px-1 py-1 font-semibold border-b border-gray-200 text-center"
                    title="Student's score in this PLO"
                  >
                    {String(idx+1).padStart(2, '0')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-1 py-0.5">{student.batch || ''}</td>
                  <td className="px-1 py-0.5 truncate max-w-[80px]">{student.name}</td>
                  {PLO_COLUMNS.map(col => (
                    <td
                      key={col}
                      className={`px-1 py-0.5 text-center ${student[col] !== undefined && student[col] < 50 ? 'bg-red-100 text-red-600 font-bold' : ''}`}
                    >
                      {student[col] !== undefined ? student[col] : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const getBase64ImageFromUrl = async (imageUrl) => {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const FinalResultDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/final-result/${id}`);
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Failed to fetch data');
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDownloadPDF = async () => {
    setDownloading(true);

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    const batch = data?.batch || '';
    let department = '';
    const match = batch.match(/[A-Za-z]+/g);
    if (match && match.length > 0) {
      department = match[0].toUpperCase();
    }
    const batchYear = batch.length >= 4 ? batch.slice(0, 4) : batch;

    const logoBase64 = await getBase64ImageFromUrl(logo);

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // --- Minimal Modern Header ---

    // 1. Logo (small, centered)
    doc.addImage(logoBase64, 'PNG', 140, 12, 20, 20);

    // 2. University Name
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('MEHRAN UNIVERSITY OF ENGINEERING & TECHNOLOGY', 148, 38, { align: 'center' });
    
    // 3. Info Row (simple, no background)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('FEM-001101/OSP-006', 15, 52);
    doc.text(formattedDate, 277, 52, { align: 'right' });

    // 4. Checkboxes (minimal)
    const checkboxY = 58;
    ['INFO.ONLY', 'ROUTINE', 'URGENT', 'IMMEDIATE'].forEach((label, i) => {
      const x = 15 + i * 40;
      doc.setDrawColor(180, 180, 180);
      doc.setFillColor(255, 255, 255);
      doc.rect(x, checkboxY, 5, 5, 'D');
    doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(label, x + 8, checkboxY + 4);
    });
    
    // 5. Memo Block (subtle left border)
    let y = 68;
    doc.setDrawColor(99, 102, 241); // indigo-600
    doc.setLineWidth(1.2);
    doc.line(13, y, 13, y + 28);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text(`NO. & Date: MUET/`, 17, y + 4);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(`${department}`, 55, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(99, 102, 241);
    doc.text('/-', 65, y + 4);
    doc.setTextColor(120, 120, 120);
    doc.text(formattedDate, 277, y + 4, { align: 'right' });
    
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text('From:', 17, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(`Convener OBE committee, `, 35, y + 4);
    doc.setFont('helvetica', 'bold');
    doc.text(`${department}`, 95, y + 4);

    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text('To:', 17, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(`Class Advisor of `, 27, y + 4);
    doc.setFont('helvetica', 'bold');
    doc.text(`${batchYear}`, 70, y + 4);

    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text('Sub:', 17, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(`Improvement required for the non-achievement of students of `, 30, y + 4);
    doc.setFont('helvetica', 'bold');
    doc.text(`${batchYear}`, 145, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.text(' in the PLOs', 160, y + 4);
    
    y += 7;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('C.C. to: 01. Chairman', 17, y + 4);
    
    // 7. Main content (spaced, lighter font)
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('According to the OBE system, the students are required to achieve 50% KPI of the set PLO\'s in the subjects specified in the degree program.', 15, y + 4);
    y += 5;
    doc.text('The following students have less than 50% achievement in the respective PLOs, therefore they are required to improve those PLOs in the summer semester or subjects of upcoming semesters.', 15, y + 9);

    // 8. Title (minimal badge)
    y += 13;
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(80, y + 4, 130, 10, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(`Final Result Analysis - Batch: ${batchYear}`, 145, y + 11, { align: 'center' });

    // 9. Search info (if any)
    if (searchTerm) {
      y += 15;
      doc.setFontSize(9);
      doc.setTextColor(99, 102, 241);
      doc.text(`Search: ${searchTerm}`, 15, y + 4);
    }

    // --- TABLES (unchanged, but start at y+18) ---
    const generateTable = (title, students, emptyNote, yPos) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(title, 10, yPos);

      if (students.length === 0) {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(emptyNote, 10, yPos + 5);
        return yPos + 10;
      }

      const tableData = students.map(student => {
        const row = [student.batch || '', student.name || ''];
        PLO_COLUMNS.forEach(col => {
          row.push(student[col] !== undefined ? student[col] : '');
        });
        return row;
      });

      const headers = ['Batch', 'Name', ...PLO_COLUMNS.map((_, idx) => String(idx+1).padStart(2, '0'))];

      doc.autoTable({
        startY: yPos + 5,
        head: [headers],
        body: tableData,
        styles: {
          fontSize: 7,
          cellPadding: 2,
          overflow: 'linebreak',
          lineWidth: 0.1,
          cellWidth: 'auto'
        },
        headStyles: {
          fillColor: [99, 102, 241], // indigo-600 for ALL header columns
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 248, 255]
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto' },
          ...Object.fromEntries(PLO_COLUMNS.map((_, idx) => [idx + 2, { cellWidth: 'auto', halign: 'center' }]))
        },
        showHead: 'firstPage',
        didParseCell: (data) => {
          // Only highlight body cells < 50, not header cells!
          if (data.section === 'body' && data.column.index >= 2 && data.cell.raw !== '' && !isNaN(data.cell.raw)) {
            if (parseFloat(data.cell.raw) < 50) {
              data.cell.styles.fillColor = [254, 226, 226];
              data.cell.styles.textColor = [220, 38, 38];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      });

      return doc.autoTable.previous.finalY + 8;
    };

    const filterStudents = (students) => {
      return students.filter(s => {
        const search = searchTerm.toLowerCase();
        return (
          (s.batch && s.batch.toLowerCase().includes(search)) ||
          (s.name && s.name.toLowerCase().includes(search))
        );
      });
    };

    let yPos = y + 18;
    yPos = generateTable(
      'Table 1: All Students (Failed or Did Not Attain PLOs)',
      filterStudents(data.students),
      'No students found.',
      yPos
    );

    yPos = generateTable(
      'Table 2: Students Who Passed But Did Not Attain PLOs',
      filterStudents(data.table2),
      'No such students found.',
      yPos
    );

    yPos = generateTable(
      'Table 3: Comprehensive Failure List',
      filterStudents(data.table3),
      'No failed students found.',
      yPos
    );

    doc.save(`${batchYear || 'Report'}.pdf`);
    setDownloading(false);
  };

  if (loading) return <div className="p-8 text-lg animate-pulse">Loading...</div>;
  if (error) return <div className="p-8 text-red-600 font-medium">{error}</div>;
  if (!data) return null;

  const batch = data?.batch || '';
  let department = '';
  const match = batch.match(/[A-Za-z]+/g);
  if (match && match.length > 0) {
    department = match[0].toUpperCase();
  }
  const batchYear = batch.length >= 4 ? batch.slice(0, 4) : batch;
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-4 py-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm text-gray-700 font-medium transition text-xs sm:text-sm"
        >
          <FiArrowLeft /> Back
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm font-medium transition text-xs sm:text-sm disabled:opacity-60"
        >
          <FiDownload /> {downloading ? 'Downloading...' : 'Download PDF'}
        </button>
      </div>

      <div className="bg-gray-50 rounded-xl p-2 sm:p-4">
        <Header batch={batch} department={department} batchYear={batchYear} formattedDate={formattedDate} />
        <div className="flex items-center gap-2 mb-4 max-w-xs">
          <FiSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by roll number or name..."
            className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <TableSection
          title="Table 1: All Students (Failed or Did Not Attain PLOs)"
          students={data.students}
          emptyNote="No students found."
          searchTerm={searchTerm}
        />

        <TableSection
          title="Table 2: Students Who Passed But Did Not Attain PLOs"
          students={data.table2}
          emptyNote="No such students found."
          searchTerm={searchTerm}
        />

        <TableSection
          title="Table 3: Comprehensive Failure List"
          students={data.table3}
          emptyNote="No failed students found."
          searchTerm={searchTerm}
        />
      </div>
    </div>
  );
};

export default FinalResultDetailPage;
