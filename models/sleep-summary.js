const mongoose = require("mongoose");

const SleepSummarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  self_assessment: { type: Number },
  latency: { type: Number },
  duration: { type: Number },
  efficiency: { type: Number },
  in_bed_at: { type: Number },
  sleep_at: { type: Number },
  wakeup_at: { type: Number },
  overall_score: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("sleep-summary", SleepSummarySchema);
