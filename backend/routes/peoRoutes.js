import express from 'express';
import multer from 'multer';
import { uploadPEOFiles, getAllPEOAnalyses, getPEOAnalysis, deletePEOAnalysis, getPEOCount } from '../controllers/peoController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Upload both files (alumniFile, employerFile)
router.post('/upload', upload.fields([
  { name: 'alumniFile', maxCount: 1 },
  { name: 'employerFile', maxCount: 1 }
]), uploadPEOFiles);

// Get all PEO analyses
router.get('/', getAllPEOAnalyses);

// Get single PEO analysis
router.get('/count', protect, adminOnly, getPEOCount);
router.get('/:id', getPEOAnalysis);

// Delete PEO analysis
router.delete('/:id', protect, adminOnly, deletePEOAnalysis);

export default router; 