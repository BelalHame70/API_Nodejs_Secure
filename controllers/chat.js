const axios = require("axios");
const agentRepo = require("../repositories/agent");
const { getAiConfigForAgent } = require("../config/aiAgents");

const testAgent = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "message is required" });
    }

    const agent = await agentRepo.findById(req.params.id);

    if (!agent || agent.user_id !== req.user.user_id) {
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

    const aiBaseUrl = aiConfig.baseUrl;
    const chatUrl = `${aiBaseUrl}${aiConfig.chatPath}`;

    const payload = {
      agent_id: agent.agent_id,
      [aiConfig.chatMessageKey]: message.trim()
    };

    console.log("AI ask URL:", chatUrl);
    console.log("AI ask payload:", payload);

    const { data } = await axios.post(chatUrl, payload, {
      timeout: aiConfig.chatTimeout || 120000
    });

    return res.status(200).json({
      answer: data.answer ?? data.message ?? data.response ?? data,
      sources: data.sources ?? []
    });
  } catch (error) {
    console.error("AI ask status:", error.response?.status);
    console.error("AI ask data:", error.response?.data);
    console.error("AI ask code:", error.code);
    console.error("AI ask error:", error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        message: "AI service timeout",
        details: "The AI service took too long to respond. Please try again.",
        ai_error: error.message
      });
    }

    return res.status(500).json({
      message: "AI error",
      ai_status: error.response?.status,
      ai_error: error.response?.data || error.message
    });
  }
};

module.exports = { testAgent };