const mongoose = require("mongoose");

const widgetSchema = new mongoose.Schema(
  {
    widget_id: { type: String, required: true, unique: true }, // uuid
    agent_id: { type: String, ref: "Agent", required: true, index: true }, // Agent.agent_id

    api_key_hash: { type: String, required: true, unique: true, index: true },

    active: { type: Boolean, default: true, index: true },
    expire_at: { type: Date, default: null, index: true },

    allowed_domains: { type: [String], default: [] }
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Widget واحدة لكل Agent
widgetSchema.index({ agent_id: 1 }, { unique: true });

module.exports = mongoose.model("Widget", widgetSchema);
