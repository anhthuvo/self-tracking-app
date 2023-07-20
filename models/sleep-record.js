const mongoose = require("mongoose");

const SleepRecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  confidence: { type: Number },
  motion: { type: Number },
  light: { type: Number },
  time: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("sleep-record", SleepRecordSchema);
