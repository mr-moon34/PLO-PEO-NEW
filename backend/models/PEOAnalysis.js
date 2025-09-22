import mongoose from "mongoose";

const peoAnalysisSchema = new mongoose.Schema({
  batch: { type: String, required: true, trim: true },
  alumniPercentages: {
    peo1: { type: Number, required: true },
    peo2: { type: Number, required: true },
    peo3: { type: Number, required: true },
    peo4: { type: Number, required: true }
  },
  employerPercentages: {
    peo1: { type: Number, required: true },
    peo2: { type: Number, required: true },
    peo3: { type: Number, required: true },
    peo4: { type: Number, required: true }
  },
  averages: {
    peo1: { type: Number, required: true },
    peo2: { type: Number, required: true },
    peo3: { type: Number, required: true },
    peo4: { type: Number, required: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

peoAnalysisSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const PEOAnalysis = mongoose.model('PEOAnalysis', peoAnalysisSchema);

export default PEOAnalysis; 