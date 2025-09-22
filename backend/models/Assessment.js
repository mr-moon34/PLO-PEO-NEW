import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema({
  program: { type: String, required: true, trim: true },
  batch: { type: String, required: true, trim: true },
  yearOfGraduation: { type: Number, required: true, min: 2000, max: 2100 },
  
  indirectResults: {
    type: Map,
    of: new mongoose.Schema({
      countCertain: { type: Number, required: true, min: 0 },
      totalResponses: { type: Number, required: true, min: 0 },
      noOfQuestions: { type: Number, required: true, default: 1, min: 1 },
      percentage: { type: Number, required: true, min: 0, max: 100 }
    }),
    required: true
  },
  
  studentData: { type: Array, default: [] },
  
  directData: {
    plo1: { type: Number, required: true, min: 0, max: 100 },
    plo2: { type: Number, required: true, min: 0, max: 100 },
    plo3: { type: Number, required: true, min: 0, max: 100 },
    plo4: { type: Number, required: true, min: 0, max: 100 },
    plo5: { type: Number, required: true, min: 0, max: 100 },
    plo6: { type: Number, required: true, min: 0, max: 100 },
    plo7: { type: Number, required: true, min: 0, max: 100 },
    plo8: { type: Number, required: true, min: 0, max: 100 },
    plo9: { type: Number, required: true, min: 0, max: 100 },
    plo10: { type: Number, required: true, min: 0, max: 100 },
    plo11: { type: Number, required: true, min: 0, max: 100 },
    plo12: { type: Number, required: true, min: 0, max: 100 }
  },
  
  cohortIndirect: {
    plo1: { type: Number, required: true, min: 0, max: 20 },
    plo2: { type: Number, required: true, min: 0, max: 20 },
    plo3: { type: Number, required: true, min: 0, max: 20 },
    plo4: { type: Number, required: true, min: 0, max: 20 },
    plo5: { type: Number, required: true, min: 0, max: 20 },
    plo6: { type: Number, required: true, min: 0, max: 20 },
    plo7: { type: Number, required: true, min: 0, max: 20 },
    plo8: { type: Number, required: true, min: 0, max: 20 },
    plo9: { type: Number, required: true, min: 0, max: 20 },
    plo10: { type: Number, required: true, min: 0, max: 20 },
    plo11: { type: Number, required: true, min: 0, max: 20 },
    plo12: { type: Number, required: true, min: 0, max: 20 }
  },
  
  cohortDirect: {
    plo1: { type: Number, required: true, min: 0, max: 80 },
    plo2: { type: Number, required: true, min: 0, max: 80 },
    plo3: { type: Number, required: true, min: 0, max: 80 },
    plo4: { type: Number, required: true, min: 0, max: 80 },
    plo5: { type: Number, required: true, min: 0, max: 80 },
    plo6: { type: Number, required: true, min: 0, max: 80 },
    plo7: { type: Number, required: true, min: 0, max: 80 },
    plo8: { type: Number, required: true, min: 0, max: 80 },
    plo9: { type: Number, required: true, min: 0, max: 80 },
    plo10: { type: Number, required: true, min: 0, max: 80 },
    plo11: { type: Number, required: true, min: 0, max: 80 },
    plo12: { type: Number, required: true, min: 0, max: 80 }
  },
  
  cumulative: {
    plo1: { type: Number, required: true, min: 0, max: 100 },
    plo2: { type: Number, required: true, min: 0, max: 100 },
    plo3: { type: Number, required: true, min: 0, max: 100 },
    plo4: { type: Number, required: true, min: 0, max: 100 },
    plo5: { type: Number, required: true, min: 0, max: 100 },
    plo6: { type: Number, required: true, min: 0, max: 100 },
    plo7: { type: Number, required: true, min: 0, max: 100 },
    plo8: { type: Number, required: true, min: 0, max: 100 },
    plo9: { type: Number, required: true, min: 0, max: 100 },
    plo10: { type: Number, required: true, min: 0, max: 100 },
    plo11: { type: Number, required: true, min: 0, max: 100 },
    plo12: { type: Number, required: true, min: 0, max: 100 }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

assessmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

assessmentSchema.virtual('formattedIndirect').get(function() {
  return Array.from(this.indirectResults.entries()).map(([plo, data]) => ({
    plo,
    countCertain: data.countCertain,
    totalResponses: data.totalResponses,
    noOfQuestions: data.noOfQuestions,
    percentage: data.percentage
  }));
});

assessmentSchema.virtual('formattedDirect').get(function() {
  return Object.entries(this.directData).map(([key, value]) => ({
    plo: key.replace('plo', 'PLO '),
    value
  }));
});

assessmentSchema.virtual('formattedCumulative').get(function() {
  return Object.entries(this.cumulative).map(([key, value]) => ({
    plo: key.replace('plo', 'PLO '),
    value
  }));
});

const Assessment = mongoose.model('Assessment', assessmentSchema);

export default Assessment;