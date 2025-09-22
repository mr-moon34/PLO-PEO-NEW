import FinalResultTemp from "../models/FinalResultTemp.js";
import xlsx from "xlsx";
import FinalResultAnalysis from "../models/FinalResultAnalysis.js";

// Upload Failure File
export const uploadFailureFile = async (req, res) => {
  console.log("uploadFailureFile called, sessionId:", req.body.sessionId, "file:", req.file);
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      console.log("No sessionId in uploadFailureFile");
      return res.status(400).json({ message: "sessionId is required" });
    }
    if (!req.file) {
      console.log("No file uploaded in uploadFailureFile");
      return res.status(400).json({ message: "No file uploaded" });
    }
    // Parse Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    // Extract batch from first row if possible
    const batch = data[0]?.Batch || null;
    // Upsert temp record for this session, store file name
    const temp = await FinalResultTemp.findOneAndUpdate(
      { sessionId },
      { failureData: data, batch, failureFileName: req.file.originalname },
      { upsert: true, new: true }
    );
    console.log("Temp record after uploadFailureFile:", temp);
    res.status(200).json({ message: "Failure file uploaded and parsed successfully", batch });
  } catch (error) {
    console.log("Error in uploadFailureFile:", error);
    res.status(500).json({ message: "Error uploading failure file", error: error.message });
  }
};

// Upload Non-PLO File
export const uploadNonPLOFile = async (req, res) => {
  console.log("uploadNonPLOFile called, sessionId:", req.body.sessionId, "file:", req.file);
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      console.log("No sessionId in uploadNonPLOFile");
      return res.status(400).json({ message: "sessionId is required" });
    }
    if (!req.file) {
      console.log("No file uploaded in uploadNonPLOFile");
      return res.status(400).json({ message: "No file uploaded" });
    }
    // Parse Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    // Update temp record for this session, store file name
    const temp = await FinalResultTemp.findOneAndUpdate(
      { sessionId },
      { nonPLOData: data, nonPLOFileName: req.file.originalname },
      { new: true }
    );
    console.log("Temp record after uploadNonPLOFile:", temp);
    if (!temp) {
      console.log("No temp record found for this session in uploadNonPLOFile");
      return res.status(404).json({ message: "No temp record found for this session. Upload failure file first." });
    }
    res.status(200).json({ message: "Non-PLO file uploaded and parsed successfully", students: data.length });
  } catch (error) {
    console.log("Error in uploadNonPLOFile:", error);
    res.status(500).json({ message: "Error uploading non-PLO file", error: error.message });
  }
};

// Calculate and Save Final Result
export const calculateAndSaveFinalResult = async (req, res) => {
  console.log("calculateAndSaveFinalResult called, body:", req.body);
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      console.log("No sessionId in request body");
      return res.status(400).json({ message: "sessionId is required" });
    }
    const temp = await FinalResultTemp.findOne({ sessionId });
    if (!temp) {
      console.log("No temp record found for session:", sessionId);
      return res.status(400).json({ message: "Both files must be uploaded before calculation. (No temp record)" });
    }
    if (!temp.failureData || !temp.failureData.length || !temp.nonPLOData || !temp.nonPLOData.length) {
      console.log("Temp record missing data:", temp);
      return res.status(400).json({ message: "Both files must be uploaded before calculation. (Missing data)" });
    }
    // Merge logic: create a map of students by Batch/Registration No
    const studentMap = new Map();
    // Add failure students (no PLOs, just batch)
    temp.failureData.forEach(row => {
      const batch = row.Batch?.trim();
      if (batch) {
        studentMap.set(batch, {
          batch,
          name: row.Name && row.Name.trim() ? row.Name : "N/A",
          sePLO01: undefined, sePLO02: undefined, sePLO03: undefined, sePLO04: undefined, sePLO05: undefined,
          sePLO06: undefined, sePLO07: undefined, sePLO08: undefined, sePLO09: undefined, sePLO10: undefined,
          sePLO11: undefined, sePLO12: undefined
        });
      }
    });
    // Add/update students from nonPLOData (with PLOs)
    temp.nonPLOData.forEach(row => {
      const batch = row.Batch?.trim();
      if (!batch) return;
      const student = studentMap.get(batch) || {
        batch,
        name: row.Name && row.Name.trim() ? row.Name : "N/A",
        sePLO01: undefined, sePLO02: undefined, sePLO03: undefined, sePLO04: undefined, sePLO05: undefined,
        sePLO06: undefined, sePLO07: undefined, sePLO08: undefined, sePLO09: undefined, sePLO10: undefined,
        sePLO11: undefined, sePLO12: undefined
      };
      for (let i = 1; i <= 12; i++) {
        let value = undefined;
        for (const k of Object.keys(row)) {
          const normalized = k.replace(/\s+/g, '').toLowerCase();
          const target1 = `seplo${i}`;
          const target2 = `seplo${i.toString().padStart(2, '0')}`;
          if (normalized === target1 || normalized === target2) {
            value = row[k];
            break;
          }
        }
        student[`sePLO${i.toString().padStart(2, '0')}`] = value !== undefined ? Number(value) : undefined;
      }
      student.name = row.Name && row.Name.trim() ? row.Name : student.name || "N/A";
      studentMap.set(batch, student);
    });
    // Prepare students array for Table 1
    const students = Array.from(studentMap.values());
    // Prepare fileNames array
    const fileNames = [];
    if (temp.failureFileName) fileNames.push(temp.failureFileName);
    if (temp.nonPLOFileName) fileNames.push(temp.nonPLOFileName);
    // Save to FinalResultAnalysis
    let finalResult;
    try {
      finalResult = await FinalResultAnalysis.create({
        batch: temp.batch || "",
        fileNames,
        students
      });
      console.log("FinalResultAnalysis created:", finalResult);
    } catch (err) {
      console.log("Error saving FinalResultAnalysis:", err);
      return res.status(500).json({ message: "Error saving final result", error: err.message });
    }
    await FinalResultTemp.deleteOne({ sessionId });
    if (!finalResult || !finalResult._id) {
      console.log("FinalResultAnalysis not created properly:", finalResult);
      return res.status(500).json({ message: "Final result not created" });
    }
    res.status(201).json({ message: "Final result calculated and saved", id: finalResult._id });
  } catch (error) {
    console.log("Error in calculateAndSaveFinalResult:", error);
    res.status(500).json({ message: "Error calculating final result", error: error.message });
  }
};

// Get Final Result by ID (Table 1, Table 2, Table 3)
export const getFinalResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await FinalResultAnalysis.findById(id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    // Table 1: students (already present)
    const students = record.students;

    // Table 2: Students who passed but did not attain PLOs
    // (not in failure list, but have any PLO < 50)
    // For this, we need the original failure list (batch numbers)
    // We'll store failureBatchSet as all batch numbers in students[] with name === 'N/A'
    const failureBatchSet = new Set(
      students.filter(s => s.name === 'N/A').map(s => s.batch)
    );
    const table2 = students.filter(s =>
      !failureBatchSet.has(s.batch) &&
      PLO_COLUMNS.some(col => s[col] !== undefined && s[col] < 50)
    );

    // Table 3: Comprehensive failure list (all students with name === 'N/A'), but try to get name from non-failure students
    const table3 = students
      .filter(s => failureBatchSet.has(s.batch))
      .map(s => {
        if (s.name === 'N/A') {
          // Try to find name from non-failure students (trim for robust match)
          const match = students.find(
            x => x.batch && x.batch.trim() === s.batch.trim() && x.name !== 'N/A'
          );
          return match ? { ...s, name: match.name } : s;
        }
        return s;
      });

    res.status(200).json({
      batch: record.batch,
      students,
      table2,
      table3,
      createdAt: record.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching final result", error: error.message });
  }
};

// Helper for PLO columns
const PLO_COLUMNS = [
  'sePLO01', 'sePLO02', 'sePLO03', 'sePLO04', 'sePLO05', 'sePLO06',
  'sePLO07', 'sePLO08', 'sePLO09', 'sePLO10', 'sePLO11', 'sePLO12'
];

// Get all Final Result records
export const getAllFinalResults = async (req, res) => {
  try {
    const records = await FinalResultAnalysis.find({}, 'batch createdAt fileNames');
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching records", error: error.message });
  }
};

// Delete a Final Result record by ID
export const deleteFinalResult = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await FinalResultAnalysis.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Record not found" });
    res.status(200).json({ message: "Record deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting record", error: error.message });
  }
};

export const getFinalResultCount = async (req, res) => {
  console.log('getFinalResultCount called'); // Debugging line
  try {
    const count = await FinalResultAnalysis.countDocuments();
    console.log('FinalResultAnalysis count:', count); // Debugging line
    res.json({ count });
  } catch (err) {
    console.error('Error in getFinalResultCount:', err); // Debugging line
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}; 
