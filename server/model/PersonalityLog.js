const mongoose = require("mongoose");

const personalityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reportData: {
    type: mongoose.Schema.Types.Mixed,
  },
  summaryData: {
    type: mongoose.Schema.Types.Mixed,
  },
  dataHash: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("PersonalityLog", personalityLogSchema);
