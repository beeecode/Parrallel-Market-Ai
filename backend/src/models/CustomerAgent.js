const mongoose = require('mongoose');

const { CUSTOMER_AGENT_STATUS } = require('../constants/customerAgentStatus');
const { SENTIMENT } = require('../constants/sentiment');
const { CASE_INSENSITIVE_COLLATION } = require('../utils/mongoCollation');

const metadataSchema = new mongoose.Schema(
  {
    tags: { type: [String], default: [] },
    score: { type: Number, min: 0, max: 100, default: 0 },
    notes: { type: String, trim: true, maxlength: 2000, default: null },
  },
  { _id: false },
);

const customerAgentSchema = new mongoose.Schema(
  {
    simulation: { type: mongoose.Schema.Types.ObjectId, ref: 'Simulation', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    avatar: { type: String, trim: true, default: null },
    age: { type: Number, min: 0, max: 120, default: null },
    occupation: { type: String, trim: true, default: null },
    location: { type: String, trim: true, default: null },
    income: { type: String, trim: true, default: null },
    personality: { type: String, trim: true, default: null },
    goals: { type: [String], default: [] },
    painPoints: { type: [String], default: [] },
    buyingBehavior: { type: String, trim: true, default: null },
    communicationStyle: { type: String, trim: true, default: null },
    sentiment: { type: String, enum: Object.values(SENTIMENT), default: SENTIMENT.NEUTRAL },
    status: { type: String, enum: Object.values(CUSTOMER_AGENT_STATUS), default: CUSTOMER_AGENT_STATUS.ACTIVE },
    metadata: { type: metadataSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Case-insensitive so the same simulation can't have two agents named e.g. "Sarah Chen".
customerAgentSchema.index({ simulation: 1, name: 1 }, { unique: true, collation: CASE_INSENSITIVE_COLLATION });

customerAgentSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (ret.metadata) delete ret.metadata._id;
    return ret;
  },
});

const CustomerAgent = mongoose.model('CustomerAgent', customerAgentSchema);

module.exports = { CustomerAgent };
