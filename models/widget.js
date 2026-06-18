const mongoose = require("mongoose");

const widgetSchema = new mongoose.Schema(
  {
    widget_id: { type: String, required: true, unique: true, index: true },
    agent_id: { type: String, ref: "Agent", required: true, unique: true, index: true },

    public_key: { type: String, required: true, unique: true, index: true },
    api_key_hash: { type: String, required: true, unique: true, index: true },

    active: { type: Boolean, default: true, index: true },
    expire_at: { type: Date, default: null, index: true },

    welcome_message: {
      ar: {
        type: String,
        default: "مرحباً! كيف يمكنني مساعدتك؟"
      },
      en: {
        type: String,
        default: "Hi! How can I help you?"
      }
    },

    theme_config: {
      primaryColor: { type: String, default: "#111827" },
      textColor: { type: String, default: "#ffffff" }
    },

    position: {
      type: String,
      enum: ["bottom-right", "bottom-left"],
      default: "bottom-right"
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

module.exports = mongoose.model("Widget", widgetSchema);