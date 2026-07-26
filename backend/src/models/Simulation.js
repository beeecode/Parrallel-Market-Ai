const mongoose = require('mongoose');

const { SIMULATION_DIFFICULTY } = require('../constants/simulationDifficulty');
const { SIMULATION_STATUS } = require('../constants/simulationStatus');
const { SENTIMENT } = require('../constants/sentiment');
const { CASE_INSENSITIVE_COLLATION } = require('../utils/mongoCollation');

const configurationSchema = new mongoose.Schema(
  {
    language: { type: String, trim: true, default: 'en' },
    difficulty: { type: String, enum: Object.values(SIMULATION_DIFFICULTY), default: SIMULATION_DIFFICULTY.MEDIUM },
    sentiment: { type: String, enum: Object.values(SENTIMENT), default: SENTIMENT.NEUTRAL },
    customerBehavior: { type: String, trim: true, default: null },
    temperature: { type: Number, min: 0, max: 1, default: 0.7 },
    conversationLength: { type: Number, min: 1, default: 10 },
    allowInterruptions: { type: Boolean, default: true },
  },
  { _id: false },
);

const statisticsSchema = new mongoose.Schema(
  {
    conversationCount: { type: Number, min: 0, default: 0 },
    completionRate: { type: Number, min: 0, max: 100, default: 0 },
    averageSentiment: { type: Number, min: 0, max: 100, default: 0 },
    responseRate: { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: false },
);

const simulationSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    industry: { type: String, trim: true, default: null },
    targetAudience: { type: String, trim: true, maxlength: 500, default: null },
    objective: { type: String, trim: true, maxlength: 500, default: null },
    customerCount: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: Object.values(SIMULATION_STATUS), default: SIMULATION_STATUS.DRAFT },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    estimatedDuration: { type: Number, min: 0, default: null },
    configuration: { type: configurationSchema, default: () => ({}) },
    statistics: { type: statisticsSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Case-insensitive so the same owner can't reuse a title twice for the same product.
simulationSchema.index({ owner: 1, product: 1, title: 1 }, { unique: true, collation: CASE_INSENSITIVE_COLLATION });

simulationSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (ret.configuration) delete ret.configuration._id;
    if (ret.statistics) delete ret.statistics._id;
    return ret;
  },
});

const Simulation = mongoose.model('Simulation', simulationSchema);

module.exports = { Simulation };
