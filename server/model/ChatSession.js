const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Counseling Session",
      trim: true,
    },
    counselorType: {
      type: String,
      required: true,
      trim: true,
    },
    messages: [chatMessageSchema],
    lastActivity: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user sessions sorted by last activity
chatSessionSchema.index({ user: 1, lastActivity: -1 });

module.exports = mongoose.model("ChatSession", chatSessionSchema);
