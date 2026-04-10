const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema(
  {
    agent_id: { type: String, required: true, unique: true },
    user_id: { type: String, ref: "User", required: true }, // UUID user_id
    name: { type: String, required: true },
    type: { type: String, default: "pdf-agent" },
    file_path: { type: String, default: null },
    status: { type: String, enum: ["draft", "trained", "active"], default: "draft" },

    ai_status: { type: String, enum: ["idle", "processing", "ready"], default: "idle" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Agent", agentSchema);
