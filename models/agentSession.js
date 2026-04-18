const mongoose = require("mongoose");
const agentSessionSchema = new mongoose.Schema(
  {
    session_id: { type: String, required: true, unique: true, index: true }, //spreat chat 
    agent_id: { type: String, ref: "Agent", required: true, index: true },

    visitor_id: { type: String, default: null }, // to tracking

    messages: [
      {
        role: { type: String, enum: ["visitor", "assistant"], required: true },
        content: { type: String, required: true },
        created_at: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("AgentSession", agentSessionSchema);