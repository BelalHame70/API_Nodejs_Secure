const widgetRepository = require("../repositories/widget");
const agentRepo = require("../repositories/agent");
const agentSessionRepo = require("../repositories/agentSession");
const axios = require("axios");
const { v4: uuid } = require("uuid");
const { generateApiKey, hashApiKey } = require("../utils/apiKeys");

const AI_BASE = process.env.AI_SERVICE_URL;

const createWidget = async (req, res) => {
  try {
    const agentId = req.params.agentId;
    const {
      welcome_message,
      position,
      theme_config,
      expire_at
    } = req.body || {};

    const agent = await agentRepo.findById(agentId);

    if (!agent || req.user.user_id !== agent.user_id) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // if (agent.ai_status !== "ready") {
    //   return res.status(400).json({ message: "Agent is not trained yet" });
    // }

    const existing = await widgetRepository.getWidgetByAgentId(agent.agent_id);

    if (existing) {
      return res.status(200).json({
        message: "Widget already exists",
        widget: existing
      });
    }

    const publicKey = generateApiKey();
    const api_key_hash = hashApiKey(publicKey);

    const widget = await widgetRepository.createWidget({
      widget_id: uuid(),
      agent_id: agent.agent_id,
      api_key_hash,
      active: true,
      expire_at: expire_at || null,
      welcome_message: welcome_message || "Hi! How can I help you?",
      position: position || "bottom-right",
      theme_config: {
        primaryColor: theme_config?.primaryColor || "#111827",
        textColor: theme_config?.textColor || "#ffffff"
      }
    });

    const embed_code = `<script src="${process.env.WEB_URL}/widget.js" data-public-key="${publicKey}" defer></script>`;

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

    return res.json({ widget });
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

// const askWidget = async (req, res) => {
//   try {
//     // if (!AI_BASE) {
//     //   return res.status(500).json({ message: "AI_SERVICE_URL is not set" });
//     // }

//     const { message, session_id } = req.body || {};

//     if (!message || typeof message !== "string" || !message.trim()) {
//       return res.status(400).json({ message: "message is required" });
//     }

//     if (!session_id) {
//       return res.status(400).json({ message: "session_id is required" });
//     }

//     const cleanMessage = message.trim();
//     const widget = req.widget;

//     const agent = await agentRepo.findById(widget.agent_id);
//     if (!agent) {
//       return res.status(404).json({ message: "Agent not found" });
//     }

//     // if (agent.ai_status !== "ready") {
//     //   return res.status(400).json({ message: "Agent is not trained yet" });
//     // }

//     const session = await agentSessionRepo.findBySessionAndAgent(
//       session_id,
//       widget.agent_id
//     );

//     if (!session) {
//       return res.status(404).json({ message: "Session not found" });
//     }

//     await agentSessionRepo.appendMessage(session_id, widget.agent_id, {
//       role: "visitor",
//       content: cleanMessage,
//       created_at: new Date()
//     });

//     const { data } = await axios.post(
//       `${AI_BASE}/ask`,
//       {
//         agent_id: widget.agent_id,
//         message: cleanMessage,
//         session_id
//       },
//       { timeout: 20000 }
//     );

//     const answer = data.answer ?? data;
//     const sources = data.sources ?? [];

//     await agentSessionRepo.appendMessage(session_id, widget.agent_id, {
//       role: "assistant",
//       content: typeof answer === "string" ? answer : JSON.stringify(answer),
//       created_at: new Date()
//     });

//     return res.json({ answer, sources });
//   } catch (error) {
//     console.error("askWidget error:", error);
//     return res.status(500).json({
//       message: "AI error",
//       error: error.message
//     });
//   }
// };
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

    const session = await agentSessionRepo.findBySessionAndAgent(
      session_id,
      widget.agent_id
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // ✅ هنا التخزين
    await agentSessionRepo.appendMessage(session_id, widget.agent_id, {
      role: "visitor",
      content: cleanMessage,
      created_at: new Date()
    });

    // ✅ mock reply
    const answer = `You said: ${cleanMessage}`;
    const sources = [];

    // ✅ تخزين الرد
    await agentSessionRepo.appendMessage(session_id, widget.agent_id, {
      role: "assistant",
      content: answer,
      created_at: new Date()
    });

    return res.json({ answer, sources });

  } catch (error) {
    console.error("askWidget error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
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