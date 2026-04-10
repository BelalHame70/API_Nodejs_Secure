const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  otp_number: String,
  used: { type: Boolean, default: false },
  expire_at: Date,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Otp", otpSchema);
