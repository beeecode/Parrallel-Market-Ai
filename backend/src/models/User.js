const mongoose = require('mongoose');

const { ROLES } = require('../constants/roles');

/**
 * `password` and `refreshToken` use `select: false` so ordinary queries never
 * return them — callers must opt in with `.select('+password')`. The
 * `toJSON` transform strips them again as a second line of defense, so a
 * stray `res.json(user)` can never leak a hash.
 */
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 160 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.BUSINESS_OWNER },
    avatar: { type: String, default: null },
    companyName: { type: String, trim: true, default: null },
    phone: { type: String, trim: true, default: null },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    refreshToken: { type: String, select: false, default: null },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.refreshToken;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
