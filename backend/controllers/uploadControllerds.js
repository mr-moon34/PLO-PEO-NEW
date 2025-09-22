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

  // Enhanced PLO mapping with flexible matching
  const ploMapping = [
    { 
      pattern: /confident.*apply engineering knowledge/i, 
      plo: "PLO 1" 
    },
    { 
      pattern: /able.*identify.*analyze.*engineering problems/i, 
      plo: "PLO 2" 
    },
    { 
      pattern: /equipped.*skills.*designing.*solutions.*socio-cultural/i, 
      plo: "PLO 3" 
    },
    { 
      pattern: /investigate.*experimental data.*derive.*conclusions/i, 
      plo: "PLO 4" 
    },
    { 
      pattern: /ability.*create.*select.*apply.*modern tools/i, 
      plo: "PLO 5" 
    },
    { 
      pattern: /able.*take.*responsibilities.*professional engineering practices/i, 
      plo: "PLO 6" 
    },
    { 
      pattern: /impact.*engineering practices.*societal.*environmental.*sustainable solutions/i, 
      plo: "PLO 7" 
    },
    { 
      pattern: /practice ethical principles.*professional ethics.*responsibilities/i, 
      plo: "PLO 8" 
    },
    { 
      pattern: /perform any project.*connected with people.*team.*lead them/i, 
      plo: "PLO 9" 
    },
    { 
      pattern: /communicate effectively.*clients.*colleagues.*interprofessional team/i, 
      plo: "PLO 10" 
    },
    { 
      pattern: /capable.*manage projects.*multidisciplinary fields/i, 
      plo: "PLO 11" 
    },
    { 
      pattern: /recognize.*importance.*pursue lifelong learning.*innovation.*technological developments/i, 
      plo: "PLO 12" 
    }
  ];

  const ploResults = {};
  const firstRow = data[0] || {};
  
  // First find all question columns that match our PLO patterns
  const questionColumns = {};
  
  Object.keys(firstRow).forEach(col => {
    if (typeof firstRow[col] === 'string') {
      const matchedPLO = ploMapping.find(plo => plo.pattern.test(col));
      if (matchedPLO) {
        questionColumns[matchedPLO.plo] = col;
      }
    }
  });

  // Now process each PLO
  ploMapping.forEach(({ plo }) => {
    const column = questionColumns[plo];
    if (!column) {
      ploResults[plo] = {
        countCertain: 0,
        totalResponses: 0,
        noOfQuestions: 1,
        percentage: 0
      };
      return;
    }

    const responses = data.map(student => {
      const value = student[column];
      // Handle different data types and convert to number
      if (typeof value === 'string') {
        // Extract first numeric value from string
        const numericMatch = value.match(/(\d+)/);
        if (numericMatch) return parseInt(numericMatch[1], 10);
        return null;
      } else if (typeof value === 'number') {
        return value;
      }
      return null;
    }).filter(val => val !== null && !isNaN(val));
    
    const totalResponses = responses.length;
    const countCertain = responses.filter(r => r >= 4).length;
    const percentage = totalResponses > 0 
      ? parseFloat(((countCertain / totalResponses) * 100).toFixed(2))
      : 0;

    ploResults[plo] = {
      countCertain,
      totalResponses,
      noOfQuestions: 1,
      percentage
    };
  });

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