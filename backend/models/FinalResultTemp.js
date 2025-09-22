import mongoose from "mongoose";

const finalResultTempSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  batch: { type: String },
  failureData: { type: Array, default: [] }, // Raw data from failure file
  nonPLOData: { type: Array, default: [] }, // Raw data from non-PLO file
  failureFileName: { type: String },
  nonPLOFileName: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 3600 } // Auto-delete after 1 hour
});

const FinalResultTemp = mongoose.model('FinalResultTemp', finalResultTempSchema);

export default FinalResultTemp; 