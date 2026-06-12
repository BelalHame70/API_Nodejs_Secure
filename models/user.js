const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, unique: true },
    name: String,
    email: { type: String, required: true, unique: true },
    password: String,
    verified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"],default: "user" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
