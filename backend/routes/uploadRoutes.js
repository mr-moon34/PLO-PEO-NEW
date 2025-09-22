import express from "express";
import multer from "multer";
import {
  uploadIndirectFile,
  uploadDirectFile,
  getAssessments,
  getAssessment,
  saveAssessment,
  deleteAssessment,
  getAssessmentCount,
} from "../controllers/uploadController.js";
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/indirect", upload.single("indirectFile"), uploadIndirectFile);
router.post("/direct", upload.single("directFile"), uploadDirectFile);
router.post("/save", saveAssessment);
router.get("/", getAssessments);
router.get('/count', protect, adminOnly, getAssessmentCount);
router.get('/:id', getAssessment);
router.delete("/:id", protect, adminOnly, deleteAssessment);

export default router;