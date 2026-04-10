const mongoose = require("mongoose");

const emailChangeTokenSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },     // your user_id (uuid)
    newEmail: { type: String, required: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailChangeToken", emailChangeTokenSchema);
