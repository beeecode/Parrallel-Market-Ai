const mongoose = require('mongoose');

const { MESSAGE_SENDER_TYPE } = require('../constants/messageSenderType');
const { MESSAGE_STATUS } = require('../constants/messageStatus');
const { MESSAGE_TYPE } = require('../constants/messageType');

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    mimeType: { type: String, trim: true, default: null },
    size: { type: Number, min: 0, default: null },
  },
  { _id: false },
);

const metadataSchema = new mongoose.Schema(
  {
    tags: { type: [String], default: [] },
    source: { type: String, trim: true, default: null },
    notes: { type: String, trim: true, maxlength: 2000, default: null },
  },
  { _id: false },
);

const messageSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    // Polymorphic — refPath resolves to the `User` or `CustomerAgent` model
    // based on `senderType`; null when senderType is "System" (no document
    // to reference). Repositories deliberately never call
    // `.populate('sender')`, so `refPath` pointing at a non-existent
    // "System" model is never actually resolved.
    sender: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderType', default: null },
    senderType: { type: String, enum: Object.values(MESSAGE_SENDER_TYPE), required: true },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    type: { type: String, enum: Object.values(MESSAGE_TYPE), default: MESSAGE_TYPE.TEXT },
    attachments: { type: [attachmentSchema], default: [] },
    metadata: { type: metadataSchema, default: () => ({}) },
    status: { type: String, enum: Object.values(MESSAGE_STATUS), default: MESSAGE_STATUS.SENT },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    edited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
    // Message uses its own `deleted`/`deletedAt` pair for soft-delete
    // (per this phase's spec), not the `isActive` flag every other
    // resource in this codebase uses — a deliberate, spec-driven deviation.
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

messageSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (ret.metadata) delete ret.metadata._id;
    return ret;
  },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = { Message };
