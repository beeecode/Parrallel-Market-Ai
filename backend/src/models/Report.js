const mongoose = require('mongoose');

const { RECOMMENDATION_PRIORITY } = require('../constants/recommendationPriority');
const { REPORT_STATUS } = require('../constants/reportStatus');

const metricsSchema = new mongoose.Schema(
  {
    conversationCount: { type: Number, min: 0, default: 0 },
    completionRate: { type: Number, min: 0, max: 100, default: 0 },
    responseRate: { type: Number, min: 0, max: 100, default: 0 },
    averageSentiment: { type: Number, min: 0, max: 100, default: 0 },
    positiveResponses: { type: Number, min: 0, default: 0 },
    neutralResponses: { type: Number, min: 0, default: 0 },
    negativeResponses: { type: Number, min: 0, default: 0 },
    averageResponseTime: { type: Number, min: 0, default: 0 },
    conversionScore: { type: Number, min: 0, max: 100, default: 0 },
    engagementScore: { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: false },
);

const recommendationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priority: { type: String, enum: Object.values(RECOMMENDATION_PRIORITY), required: true },
  },
  { _id: false },
);

const reportSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    simulation: { type: mongoose.Schema.Types.ObjectId, ref: 'Simulation', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    summary: { type: String, trim: true, maxlength: 1000, default: '' },
    metrics: { type: metricsSchema, default: () => ({}) },
    recommendations: { type: [recommendationSchema], default: [] },
    status: { type: String, enum: Object.values(REPORT_STATUS), default: REPORT_STATUS.GENERATED },
    generatedAt: { type: Date, default: null },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// One active report per simulation — the service pre-checks and returns the
// existing report instead of ever attempting a second insert, so this index
// is a safety net against races, not the primary duplicate-prevention path.
reportSchema.index({ simulation: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

reportSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (ret.metrics) delete ret.metrics._id;
    return ret;
  },
});

const Report = mongoose.model('Report', reportSchema);

module.exports = { Report };
