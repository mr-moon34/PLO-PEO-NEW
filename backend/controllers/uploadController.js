import Assessment from "../models/Assessment.js";
import xlsx from "xlsx";
import fs from "fs";

// Helper function to convert Map to plain object
function mapToObj(map) {
  const obj = {};
  for (let [k, v] of map.entries()) {
    obj[k] = v;
  }
  return obj;
}

// Helper function to process indirect assessment file
const processIndirectFile = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);

  const ploMapping = {
    "I am confident to apply engineering knowledge in the field": "PLO 1",
    "I am able to identify and analyze the engineering problems": "PLO 2",
    "I am equipped with skills of designing and developing the solutions for socio-cultural and environmental needs.": "PLO 3",
    "I can investigate experimental data to derive valid conclusions": "PLO 4",
    "I have the ability to create, select and apply modern tools to cater the complex engineering problems": "PLO 5",
    "I am able to take relevant responsibilities into professional engineering practices": "PLO 6",
    "I understand the impact of engineering practices in societal and environmental contexts and able to provide sustainable solutions": "PLO 7",
    "I feel confident to practice ethical principles and commit to professional ethics, responsibilities and norms of engineering practices.": "PLO 8",
    "I am confident in my ability to perform any project by being connected with people in my team and lead them individually": "PLO 9",
    "I can communicate effectively with the clients, colleagues, and other members of an interprofessional team": "PLO 10",
    "I am capable to manage projects in multidisciplinary fields": "PLO 11",
    "I have the ability to recognize the importance of, and pursue lifelong learning in the broader context of innovation and technological developments": "PLO 12"
  };

  // 1. Question Validation
  if (data.length === 0) {
    throw new Error("Excel file contains no data");
  }
  const foundQuestions = Object.keys(ploMapping).filter(q =>
    Object.keys(data[0] || {}).includes(q)
  );
  if (foundQuestions.length < Object.keys(ploMapping).length) {
    console.warn("Missing some PLO questions in the file. Found:", foundQuestions);
  }

  const ploResults = {};
  Object.entries(ploMapping).forEach(([question, plo]) => {
    const responses = data.map(student => {
      const value = student[question];
      let numericValue = null;
      if (typeof value === 'string') {
        // Enhanced value parsing: extract first numeric value from string
        const numericMatch = value.match(/(\d+)/);
        if (numericMatch) numericValue = parseInt(numericMatch[1], 10);
      } else if (typeof value === 'number') {
        numericValue = value;
      }
      return numericValue;
    }).filter(val => val !== null && !isNaN(val));

    const totalResponses = data.length; // Use total number of students (93)
    // Count responses that are >= 3 (Uncertain or higher)
    const countCertain = responses.filter(r => r >= 3).length;
    const noOfQuestions = 1;
    // Calculate percentage as (countCertain / totalResponses) * 100
    const percentage = totalResponses > 0 ? ((countCertain / totalResponses) * 100).toFixed(2) : "0.00";

    ploResults[plo] = {
      countCertain,
      totalResponses,
      noOfQuestions,
      percentage: Number(percentage)
    };
  });

  // 3. Logging for Debugging
  console.log("Processed PLO Results:", Object.entries(ploResults).map(([plo, data]) => ({
    plo,
    countCertain: data.countCertain,
    percentage: data.percentage
  })));

  const firstStudent = data[0] || {};
  return {
    program: firstStudent["Program (Department/Institute)"] || "Unknown Program",
    batch: firstStudent["Batch"] || "Unknown Batch",
    yearOfGraduation: firstStudent["Year of Graduation"] || new Date().getFullYear(),
    indirectResults: ploResults,
    studentData: data
  };
};

// Helper function to process direct assessment file
const processDirectFile = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);

  const directData = {};
  data.forEach(row => {
    if (row.PLOs && row["PLO Direct Assessment (%)"]) {
      const ploMatch = row.PLOs.match(/PLO (\d+)/i);
      if (ploMatch) {
        const ploNumber = ploMatch[1];
        directData[`plo${ploNumber}`] = parseFloat(row["PLO Direct Assessment (%)"]);
      }
    }
  });

  for (let i = 1; i <= 12; i++) {
    if (!directData[`plo${i}`]) {
      directData[`plo${i}`] = 0;
    }
  }

  const formattedDirectResults = Object.entries(directData).map(([plo, value]) => ({
    plo: plo.replace('plo', 'PLO '),
    percentage: value
  }));

  return {
    formattedDirectResults,
    directData
  };
};

// Calculate cohort and cumulative values
const calculateResults = (indirectResults, directData) => {
  const cohortIndirect = {};
  const cohortDirect = {};
  const cumulative = {};

  for (let i = 1; i <= 12; i++) {
    const ploKey = `plo${i}`;
    const ploLabel = `PLO ${i}`;
    
    const indirectPercentage = parseFloat(indirectResults[ploLabel]?.percentage) || 0;
    const directPercentage = parseFloat(directData[ploKey]) || 0;
    
    cohortIndirect[ploKey] = (indirectPercentage * 0.2).toFixed(2);
    cohortDirect[ploKey] = (directPercentage * 0.8).toFixed(2);
    cumulative[ploKey] = (parseFloat(cohortIndirect[ploKey]) + parseFloat(cohortDirect[ploKey])).toFixed(2);
  }

  return { cohortIndirect, cohortDirect, cumulative, indirectPercentage: indirectResults };
};

// Step 1: Upload and process indirect assessment file
export const uploadIndirectFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }

    const results = processIndirectFile(req.file.path);
    
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: "Indirect assessment processed successfully",
      results: {
        program: results.program,
        batch: results.batch,
        yearOfGraduation: results.yearOfGraduation,
        indirectResults: results.indirectResults,
        formattedResults: Object.entries(results.indirectResults).map(([plo, data]) => ({
          plo,
          countCertain: data.countCertain,
          totalResponses: data.totalResponses,
          noOfQuestions: data.noOfQuestions,
          percentage: data.percentage
        }))
      }
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Error processing indirect file:", error);
    res.status(500).json({ 
      message: "Error processing indirect assessment file",
      error: error.message 
    });
  }
};

// Step 2: Upload direct assessment and combine results
export const uploadDirectFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload direct file" });
    }

    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }

    const { formattedDirectResults, directData } = processDirectFile(req.file.path);

    fs.unlinkSync(req.file.path);

    if (!req.body.indirectResults) {
      return res.status(200).json({
        message: "Direct assessment processed successfully",
        results: {
          formattedDirectResults,
          directData
        }
      });
    }

    const indirectResults = JSON.parse(req.body.indirectResults);
    console.log("Parsed indirectResults:", indirectResults);

    const { cohortIndirect, cohortDirect, cumulative, indirectPercentage } = calculateResults(
      indirectResults,
      directData
    );

    const assessment = new Assessment({
      program: req.body.program,
      batch: req.body.batch,
      yearOfGraduation: req.body.yearOfGraduation,
      indirectResults,
      directData,
      cohortIndirect,
      cohortDirect,
      cumulative,
    });

    await assessment.save();

    // Convert Map to plain object before sending response
    const assessmentObj = assessment.toObject();
    if (assessment.indirectResults instanceof Map) {
      assessmentObj.indirectResults = Object.fromEntries(assessment.indirectResults);
    }

    res.status(201).json({
      message: "Assessment completed successfully",
      assessment: assessmentObj
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Error processing direct file:", error);
    res.status(500).json({ 
      message: "Error processing direct assessment file",
      error: error.message 
    });
  }
};

// Get all assessments
export const getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find().sort({ createdAt: -1 });
    // Convert Map to plain object for each assessment
    const formattedAssessments = assessments.map(assessment => {
      const assessmentObj = assessment.toObject();
      if (assessment.indirectResults instanceof Map) {
        assessmentObj.indirectResults = Object.fromEntries(assessment.indirectResults);
      }
      return assessmentObj;
    });
    res.status(200).json(formattedAssessments);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching assessments", 
      error: error.message 
    });
  }
};

// Get single assessment
export const getAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    
    // Convert Map to plain object
    const assessmentObj = assessment.toObject();
    if (assessment.indirectResults instanceof Map) {
      assessmentObj.indirectResults = Object.fromEntries(assessment.indirectResults);
    }
    
    res.status(200).json(assessmentObj);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching assessment", 
      error: error.message 
    });
  }
};

// Save assessment from frontend (JSON)
export const saveAssessment = async (req, res) => {
  try {
    const { program, batch, yearOfGraduation, indirectResults, directData, cohortIndirect, cohortDirect, cumulative } = req.body;
    if (!program || !batch || !yearOfGraduation || !indirectResults || !directData || !cohortIndirect || !cohortDirect || !cumulative) {
      return res.status(400).json({ message: "Missing required assessment fields" });
    }
    // Always save a new record (allow duplicates)
    const assessment = new Assessment({
      program,
      batch,
      yearOfGraduation,
      indirectResults,
      directData,
      cohortIndirect,
      cohortDirect,
      cumulative,
    });
    await assessment.save();
    res.status(201).json({ message: "Assessment saved successfully", assessment });
  } catch (error) {
    res.status(500).json({ message: "Error saving assessment", error: error.message });
  }
};

// Delete assessment by ID
export const deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Assessment.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    res.status(200).json({ message: "Assessment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting assessment", error: error.message });
  }
};

export const getAssessmentCount = async (req, res) => {
  try {
    const count = await Assessment.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assessment count', error: error.message });
  }
};