const mongoose = require('mongoose');

const { CONVERSATION_STATUS } = require('../constants/conversationStatus');

const metadataSchema = new mongoose.Schema(
  {
    tags: { type: [String], default: [] },
    source: { type: String, trim: true, default: null },
    notes: { type: String, trim: true, maxlength: 2000, default: null },
  },
  { _id: false },
);

const conversationSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    simulation: { type: mongoose.Schema.Types.ObjectId, ref: 'Simulation', required: true, index: true },
    customerAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerAgent', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    status: { type: String, enum: Object.values(CONVERSATION_STATUS), default: CONVERSATION_STATUS.OPEN },
    // lastMessage/lastActivity/messageCount are server-managed denormalized
    // fields, recomputed by conversation.service.js whenever a message is
    // sent or soft-deleted — never accepted from client input.
    lastMessage: { type: String, trim: true, default: null },
    lastActivity: { type: Date, default: null },
    messageCount: { type: Number, min: 0, default: 0 },
    metadata: { type: metadataSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

conversationSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (ret.metadata) delete ret.metadata._id;
    return ret;
  },
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = { Conversation };
