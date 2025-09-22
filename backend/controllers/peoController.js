import PEOAnalysis from '../models/PEOAnalysis.js';
import xlsx from 'xlsx';
import fs from 'fs';

// Alumni & Employer file upload, calculation, save, get all, get one, delete functions yahan aayenge

// Helper: Convert grade to numeric (A=3, B=2, C=1, D=0)
const gradeToNumeric = (grade) => {
  if (!grade) return 0;
  const g = grade.toString().trim().toUpperCase();
  if (g === 'A') return 3;
  if (g === 'B') return 2;
  if (g === 'C') return 1;
  return 0; // D or anything else
};

// Helper: Count A/B/C responses for each PEO
const processPEOFile = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);

  // Find all PEO columns
  const peoQuestions = { peo1: [], peo2: [], peo3: [], peo4: [] };
  if (data.length > 0) {
    Object.keys(data[0]).forEach((col) => {
      const colLower = col.toLowerCase();
      if (colLower.includes('peo-1')) peoQuestions.peo1.push(col);
      if (colLower.includes('peo-2')) peoQuestions.peo2.push(col);
      if (colLower.includes('peo-3')) peoQuestions.peo3.push(col);
      if (colLower.includes('peo-4')) peoQuestions.peo4.push(col);
    });
  }

  const totalResponses = data.length;
  const percentages = {};

  Object.entries(peoQuestions).forEach(([peoKey, questions]) => {
    let countCertain = 0;
    let totalQuestions = questions.length;
    data.forEach((row) => {
      questions.forEach((q) => {
        const val = row[q];
        const num = gradeToNumeric(val);
        if (num >= 1) countCertain++; // A, B, C
      });
    });
    // Percentage = (countCertain / (totalResponses * totalQuestions)) * 100
    const percent = (totalResponses && totalQuestions)
      ? ((countCertain / (totalResponses * totalQuestions)) * 100)
      : 0;
    percentages[peoKey] = Number(percent.toFixed(3));
  });

  return { percentages, totalResponses };
};

export const uploadPEOFiles = async (req, res) => {
  try {
    if (!req.files || !req.files['alumniFile'] || !req.files['employerFile']) {
      return res.status(400).json({ message: 'Both Alumni and Employer files are required.' });
    }
    const batch = req.body.batch || 'Unknown';
    const alumniPath = req.files['alumniFile'][0].path;
    const employerPath = req.files['employerFile'][0].path;

    // Process both files
    const alumni = processPEOFile(alumniPath);
    const employer = processPEOFile(employerPath);

    // Clean up files
    fs.unlinkSync(alumniPath);
    fs.unlinkSync(employerPath);

    // Calculate averages
    const averages = {};
    ['peo1','peo2','peo3','peo4'].forEach((peo) => {
      averages[peo] = Number(((alumni.percentages[peo] + employer.percentages[peo]) / 2).toFixed(3));
    });

    // Save to DB
    const peoAnalysis = new PEOAnalysis({
      batch,
      alumniPercentages: alumni.percentages,
      employerPercentages: employer.percentages,
      averages
    });
    await peoAnalysis.save();

    res.status(201).json({
      message: 'PEO Analysis calculated and saved successfully',
      result: {
        batch,
        alumniPercentages: alumni.percentages,
        employerPercentages: employer.percentages,
        averages
      },
      _id: peoAnalysis._id
    });
  } catch (error) {
    console.error('Error processing PEO files:', error);
    res.status(500).json({ message: 'Error processing PEO files', error: error.message });
  }
};

export const getAllPEOAnalyses = async (req, res) => {
  try {
    const analyses = await PEOAnalysis.find().sort({ createdAt: -1 });
    res.status(200).json(analyses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching PEO analyses', error: error.message });
  }
};

export const getPEOAnalysis = async (req, res) => {
  try {
    const analysis = await PEOAnalysis.findById(req.params.id);
    if (!analysis) return res.status(404).json({ message: 'PEO Analysis not found' });
    res.status(200).json(analysis);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching PEO analysis', error: error.message });
  }
};

export const deletePEOAnalysis = async (req, res) => {
  try {
    const deleted = await PEOAnalysis.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'PEO Analysis not found' });
    res.status(200).json({ message: 'PEO Analysis deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting PEO analysis', error: error.message });
  }
};

export const getPEOCount = async (req, res) => {
  try {
    const count = await PEOAnalysis.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching PEO analysis count', error: error.message });
  }
}; 