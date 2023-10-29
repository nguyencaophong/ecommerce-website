const mongoose = require('mongoose');
const includes = require('../utils/common.util');

const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
    },
    images: [{ type: String }],
    seen: { type: Boolean, default: false },
    seenAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Message', messageSchema);
