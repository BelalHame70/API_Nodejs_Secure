const widgetrepository = require("../repositories/widget");
const agentRepo = require("../repositories/agent");
const agentSessionRepo = require("../repositories/agentSession");
const axios = require("axios");
const { v4: uuid } = require("uuid");
const { generateApiKey, hashApiKey } = require("../utils/apiKeys");

const AI_BASE = process.env.AI_SERVICE_URL;

const createWidget = async (req, res) => {
  try {
    const agentId = req.params.agentId;

    const agent = await agentRepo.findById(agentId);
    if (!agent || req.user.user_id !== agent.user_id) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // (اختياري لكن منطقي مع flow): مينفعش تعمل widget قبل training
    if (agent.ai_status !== "ready") {
      return res.status(400).json({ message: "Agent is not trained yet" });
    }

    const existing = await widgetrepository.getWidgetByAgentId(agent.agent_id);
    if (existing) {
      return res.status(200).json({ message: "Widget already exists", widget: existing });
    }

    const publicKey = generateApiKey();
    const api_key_hash = hashApiKey(publicKey);

    const widget = await widgetrepository.createWidget({
      widget_id: uuid(),
      agent_id: agent.agent_id,
      api_key_hash,
      active: true,
      expire_at: null,
      
    });

    return res.status(201).json({ message: "Widget created", widget, publicKey });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getWidget = async (req, res) => {
  try {
    const agentId = req.params.agentId;

    const agent = await agentRepo.findById(agentId);
    if (!agent || req.user.user_id !== agent.user_id) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const widget = await widgetrepository.getWidgetByAgentId(agent.agent_id);
    if (!widget) return res.status(404).json({ message: "Widget not found" });

    return res.json({ widget });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const askWidget = async (req, res) => {
  try {
    if (!AI_BASE) return res.status(500).json({ message: "AI_SERVICE_URL is not set" });

    const { message, session_id } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "message is required" });
    }

    const widget = req.widget;

    // تأكد agent موجود و trained (عشان visitor ميستخدمش agent قبل التدريب)
    const agent = await agentRepo.findById(widget.agent_id);
    if (!agent) return res.status(404).json({ message: "Agent not found" });
    if (agent.ai_status !== "ready") {
      return res.status(400).json({ message: "Agent is not trained yet" });
    }

    // لو session_id موجود لازم يكون تابع لنفس agent
    if (session_id) {
      const session = await agentSessionRepo.findBySessionAndAgent(session_id, widget.agent_id);
      if (!session) return res.status(404).json({ message: "Session not found" });

      // خزّن رسالة الزائر
      await agentSessionRepo.appendMessage(session_id, {
        role: "visitor",
        content: message.trim(),
        created_at: new Date()
      });
    }

    const { data } = await axios.post(
      `${AI_BASE}/ask`,
      { agent_id: widget.agent_id, message: message.trim(), session_id: session_id ?? null },
      { timeout: 20000 }
    );

    const answer = data.answer ?? data;
    const sources = data.sources ?? [];

    // خزّن رد المساعد
    if (session_id) {
      await agentSessionRepo.appendMessage(session_id, {
        role: "assistant",
        content: typeof answer === "string" ? answer : JSON.stringify(answer),
        created_at: new Date()
      });
    }

    return res.json({ answer, sources });
  } catch (error) {
    return res.status(500).json({ message: "AI error", error: error.message });
  }
};

module.exports = { createWidget, getWidget, askWidget };
