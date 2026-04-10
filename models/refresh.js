const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  token_hash: String,
  expire: Date,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
