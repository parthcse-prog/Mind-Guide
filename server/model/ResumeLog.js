const mongoose = require("mongoose");

const resumeLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fileHash: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
  },
  analyzedAt: {
    type: Date,
    default: Date.now,
  }
});

const ResumeLog = mongoose.model("ResumeLog", resumeLogSchema);
module.exports = ResumeLog;
