const mongoose = require("mongoose");

const FactorRecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  factor_code: { type: String },
  value: { type: String },
  unit: { type: String, maxlength: 20 },
  start_at: { type: Number },
  end_at: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("factor-record", FactorRecordSchema);
