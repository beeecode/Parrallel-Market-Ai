const mongoose = require('mongoose');

const { INSIGHT_IMPORTANCE } = require('../constants/insightImportance');
const { INSIGHT_TREND } = require('../constants/insightTrend');

const metadataSchema = new mongoose.Schema(
  {
    tags: { type: [String], default: [] },
    source: { type: String, trim: true, default: null },
    notes: { type: String, trim: true, maxlength: 2000, default: null },
  },
  { _id: false },
);

const insightSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    importance: { type: String, enum: Object.values(INSIGHT_IMPORTANCE), required: true },
    trend: { type: String, enum: Object.values(INSIGHT_TREND), required: true },
    score: { type: Number, min: 0, max: 100, default: 0 },
    metadata: { type: metadataSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

insightSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (ret.metadata) delete ret.metadata._id;
    return ret;
  },
});

const Insight = mongoose.model('Insight', insightSchema);

module.exports = { Insight };
