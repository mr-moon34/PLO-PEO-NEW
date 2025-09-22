import express from "express";
import multer from "multer";
import {
  uploadFailureFile,
  uploadNonPLOFile,
  calculateAndSaveFinalResult,
  getFinalResultById,
  getAllFinalResults,
  deleteFinalResult,
  getFinalResultCount
} from "../controllers/finalResultController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Upload failure file
router.post("/upload-failure", upload.single("file"), uploadFailureFile);

// Upload non-PLO file
router.post("/upload-nonplo", upload.single("file"), uploadNonPLOFile);

// Calculate and save final result
router.post("/calculate", calculateAndSaveFinalResult);

// Get final result count
router.get("/count", getFinalResultCount);

// Get final result by ID
router.get("/:id", getFinalResultById);

// Get all final results
router.get("/", getAllFinalResults);

// Delete final result
router.delete("/:id", deleteFinalResult);

export default router; 