const mongoose = require('mongoose');

/**
 * The only model allowed in this phase. Used purely to prove read/write
 * connectivity to MongoDB — not a real domain entity.
 */
const healthLogSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ['ok', 'degraded'], required: true },
    checkedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);

const HealthLog = mongoose.model('HealthLog', healthLogSchema);

module.exports = { HealthLog };
