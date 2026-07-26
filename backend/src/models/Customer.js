const mongoose = require('mongoose');

const { CUSTOMER_STATUS } = require('../constants/customerStatus');
const { CASE_INSENSITIVE_COLLATION } = require('../utils/mongoCollation');

const customerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 160 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, default: null },
    company: { type: String, trim: true, default: null },
    industry: { type: String, trim: true, default: null },
    jobTitle: { type: String, trim: true, default: null },
    country: { type: String, trim: true, default: null },
    tags: { type: [String], default: [] },
    notes: { type: String, trim: true, maxlength: 2000, default: null },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: Object.values(CUSTOMER_STATUS), default: CUSTOMER_STATUS.ACTIVE },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Case-insensitive so "Amara@x.com" and "amara@x.com" collide as the same email for one owner.
customerSchema.index({ owner: 1, email: 1 }, { unique: true, collation: CASE_INSENSITIVE_COLLATION });

customerSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = { Customer };
