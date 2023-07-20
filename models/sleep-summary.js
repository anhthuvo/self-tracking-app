const mongoose = require("mongoose");

const SleepSummarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  self_assessment: { type: Number },
  latency: { type: Number },
  duration: { type: Number },
  efficiency: { type: Number },
  in_bed_at: { type: Date },
  sleep_at: { type: Date },
  wakeup_at: { type: Date },
  wakeup_time: { type: Number },
  overall_score: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("sleep-summary", SleepSummarySchema);
