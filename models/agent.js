const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema(
  {
    agent_id: { type: String, required: true, unique: true },
    user_id: { type: String, ref: "User", required: true },
    name: { type: String, required: true },

    agent_type: {
      type: String,
      enum: ["knowledge Base", "analysis", "customer support"],
      required: true
    },

    file_path: { type: String, default: null },
    file_key: { type: String, default: null },
    file_name: { type: String, default: null },
    file_type: {
      type: String,
      enum: ["pdf", "csv", "txt", "doc"],
      default: null
    },

    status: {
      type: String,
      enum: ["draft", "trained", "active"],
      default: "draft"
    },

    ai_status: {
      type: String,
      enum: ["idle", "processing", "ready", "failed"],
      default: "idle"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Agent", agentSchema);