import express from 'express';
import { predictScores, predictBulkFromExcel } from '../controllers/mlController.js';
import multer from 'multer';

const router = express.Router();

router.post('/predict', predictScores);
router.post('/predict-bulk', multer().single('file'), predictBulkFromExcel);

export default router;


