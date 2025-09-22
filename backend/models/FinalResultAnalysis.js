import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  batch: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  sePLO01: { type: Number },
  sePLO02: { type: Number },
  sePLO03: { type: Number },
  sePLO04: { type: Number },
  sePLO05: { type: Number },
  sePLO06: { type: Number },
  sePLO07: { type: Number },
  sePLO08: { type: Number },
  sePLO09: { type: Number },
  sePLO10: { type: Number },
  sePLO11: { type: Number },
  sePLO12: { type: Number }
}, { _id: false });

const finalResultAnalysisSchema = new mongoose.Schema({
  batch: { type: String, required: true, trim: true },
  fileNames: [{ type: String }], // [failureFile, nonPLOFile]
  students: [studentSchema],
  createdAt: { type: Date, default: Date.now }
});

const FinalResultAnalysis = mongoose.model('FinalResultAnalysis', finalResultAnalysisSchema);

export default FinalResultAnalysis; 