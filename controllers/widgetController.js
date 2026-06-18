const widgetRepository = require("../repositories/widget");
const agentRepo = require("../repositories/agent");
const agentSessionRepo = require("../repositories/agentSession");
const axios = require("axios");
const { v4: uuid } = require("uuid");
const { generateApiKey, hashApiKey } = require("../utils/apiKeys");
const { getAiConfigForAgent } = require("../config/aiAgents");

const defaultWelcomeMessage = {
  ar: "مرحباً! كيف يمكنني مساعدتك؟",
  en: "Hi! How can I help you?"
};

const normalizeWelcomeMessage = (welcome_message) => {
  if (!welcome_message) return defaultWelcomeMessage;

  if (typeof welcome_message === "string") {
    return {
      ar: welcome_message,
      en: welcome_message
    };
  }

  return {
    ar: welcome_message.ar || defaultWelcomeMessage.ar,
    en: welcome_message.en || defaultWelcomeMessage.en
  };
};

const createWidget = async (req, res) => {
  try {
    const agentId = req.params.agentId;
    const { welcome_message, position, theme_config, expire_at } = req.body || {};

    const agent = await agentRepo.findById(agentId);

    if (!agent || req.user.user_id !== agent.user_id) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (agent.ai_status !== "ready") {
      return res.status(400).json({ message: "Agent is not trained yet" });
    }

    const existing = await widgetRepository.getWidgetByAgentId(agent.agent_id);

    if (existing) {
      const webUrl = process.env.API_URL?.replace(/\/$/, "");

      if (!webUrl) {
        return res.status(500).json({ message: "WEB_URL is not set" });
      }

      const publicKey = existing.public_key;
      const embed_code = publicKey
        ? `<script src="${webUrl}/widget.js" data-public-key="${publicKey}" defer></script>`
        : null;

      return res.status(200).json({
        message: "Widget already exists",
        widget: existing,
        publicKey,
        embed_code
      });
    }

    const publicKey = generateApiKey();
    const api_key_hash = hashApiKey(publicKey);

    const widget = await widgetRepository.createWidget({
      widget_id: uuid(),
      agent_id: agent.agent_id,
      public_key: publicKey,
      api_key_hash,
      active: true,
      expire_at: expire_at || null,
      welcome_message: normalizeWelcomeMessage(welcome_message),
      position: position || "bottom-right",
      theme_config: {
        primaryColor: theme_config?.primaryColor || "#0057ff",
        textColor: theme_config?.textColor || "#ffffff"
      }
    });

    const webUrl = process.env.API_URL?.replace(/\/$/, "");

    if (!webUrl) {
      return res.status(500).json({ message: "WEB_URL is not set" });
    }

    const embed_code = `<script src="${webUrl}/widget.js" data-public-key="${publicKey}" defer></script>`;

    return res.status(201).json({
      message: "Widget created",
      widget,
      publicKey,
      embed_code
    });
  } catch (error) {
    console.error("createWidget error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getWidget = async (req, res) => {
  try {
    const agentId = req.params.agentId;

    const agent = await agentRepo.findById(agentId);

    if (!agent || req.user.user_id !== agent.user_id) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const widget = await widgetRepository.getWidgetByAgentId(agent.agent_id);

    if (!widget) {
      return res.status(404).json({ message: "Widget not found" });
    }

    const webUrl = process.env.API_URL?.replace(/\/$/, "");

    if (!webUrl) {
      return res.status(500).json({ message: "WEB_URL is not set" });
    }

    const publicKey = widget.public_key;
    const embed_code = publicKey
      ? `<script src="${webUrl}/widget.js" data-public-key="${publicKey}" defer></script>`
      : null;

    return res.status(200).json({
      message: "Widget returned",
      widget,
      publicKey,
      embed_code
    });
  } catch (error) {
    console.error("getWidget error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const deleteWidget = async (req, res) => {
  try {
    const agentId = req.params.agentId;

    const agent = await agentRepo.findById(agentId);

    if (!agent || req.user.user_id !== agent.user_id) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const widget = await widgetRepository.getWidgetByAgentId(agent.agent_id);

    if (!widget) {
      return res.status(404).json({ message: "Widget not found" });
    }

    await widgetRepository.deleteWidgetByAgentId(agent.agent_id);

    return res.json({ message: "Widget deleted successfully" });
  } catch (error) {
    console.error("deleteWidget error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const initWidgetSession = async (req, res) => {
  try {
    const widget = req.widget;

    if (!widget || !widget.active) {
      return res.status(404).json({ message: "Widget not found or inactive" });
    }

    const agent = await agentRepo.findById(widget.agent_id);

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (agent.ai_status !== "ready") {
      return res.status(400).json({ message: "Agent is not trained yet" });
    }

    const session = await agentSessionRepo.createSession({
      session_id: uuid(),
      agent_id: widget.agent_id,
      visitor_id: uuid(),
      messages: []
    });

    return res.status(201).json({
      message: "Session created successfully",
      session_id: session.session_id,
      widget: {
        welcome_message: widget.welcome_message,
        theme_config: widget.theme_config,
        position: widget.position
      }
    });
  } catch (error) {
    console.error("initWidgetSession error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const askWidget = async (req, res) => {
  try {
    const { message, session_id } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "message is required" });
    }

    if (!session_id) {
      return res.status(400).json({ message: "session_id is required" });
    }

    const cleanMessage = message.trim();
    const widget = req.widget;

    if (!widget || !widget.active) {
      return res.status(404).json({ message: "Widget not found or inactive" });
    }

    const agent = await agentRepo.findById(widget.agent_id);

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (agent.ai_status !== "ready") {
      return res.status(400).json({ message: "Agent is not trained yet" });
    }

    const aiConfig = getAiConfigForAgent(agent.agent_type);

    if (!aiConfig) {
      return res.status(400).json({
        message: "Unsupported agent type",
        agent_type: agent.agent_type
      });
    }

    const chatUrl = `${aiConfig.baseUrl}${aiConfig.chatPath}`;

    const session = await agentSessionRepo.findBySessionAndAgent(
      session_id,
      widget.agent_id
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    await agentSessionRepo.appendMessage(session_id, widget.agent_id, {
      role: "visitor",
      content: cleanMessage,
      created_at: new Date()
    });

    const payload = {
      agent_id: widget.agent_id,
      [aiConfig.chatMessageKey]: cleanMessage
    };

    const { data } = await axios.post(chatUrl, payload, {
      timeout: aiConfig.chatTimeout || 120000
    });

    const answer = data.answer ?? data.message ?? data.response ?? data;
    const sources = data.sources ?? [];

    await agentSessionRepo.appendMessage(session_id, widget.agent_id, {
      role: "assistant",
      content: typeof answer === "string" ? answer : JSON.stringify(answer),
      created_at: new Date()
    });

    return res.json({ answer, sources });
  } catch (error) {
    console.error("AI widget ask status:", error.response?.status);
    console.error("AI widget ask data:", error.response?.data);
    console.error("askWidget error:", error.message);

    return res.status(500).json({
      message: "AI error",
      ai_status: error.response?.status,
      ai_error: error.response?.data || error.message
    });
  }
};

module.exports = {
  createWidget,
  getWidget,
  deleteWidget,
  initWidgetSession,
  askWidget
};