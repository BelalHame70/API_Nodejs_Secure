const mongoose = require("mongoose");

const tokenPasswordSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    tokenHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    used: {
      type: Boolean,
      default: false
    },
    usedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PasswordReset", tokenPasswordSchema);