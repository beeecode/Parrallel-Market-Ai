const mongoose = require('mongoose');

const { PRODUCT_STATUS } = require('../constants/productStatus');
const { CASE_INSENSITIVE_COLLATION } = require('../utils/mongoCollation');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    category: { type: String, trim: true, maxlength: 120, default: null },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, trim: true, uppercase: true, minlength: 3, maxlength: 3, default: 'USD' },
    status: { type: String, enum: Object.values(PRODUCT_STATUS), default: PRODUCT_STATUS.DRAFT },
    targetAudience: { type: String, trim: true, maxlength: 500, default: null },
    features: { type: [String], default: [] },
    imageUrl: { type: String, trim: true, default: null },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Case-insensitive so "Widget" and "widget" collide as the same name for one owner.
productSchema.index({ owner: 1, name: 1 }, { unique: true, collation: CASE_INSENSITIVE_COLLATION });

productSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = { Product };
