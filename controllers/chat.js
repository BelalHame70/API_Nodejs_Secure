const axios = require("axios");
const agentRepo = require("../repositories/agent");

const testAgent = async (req, res) => {
  try {
    const aiBaseUrl = process.env.AI_SERVICE_URL?.replace(/\/$/, "");

    if (!aiBaseUrl) {
      return res.status(500).json({ message: "AI_SERVICE_URL is not set" });
    }

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

    const payload = {
      agent_id: agent.agent_id,
      question: message.trim()
    };

    console.log("AI ask URL:", `${aiBaseUrl}/ask`);
    console.log("AI ask payload:", payload);

    const { data } = await axios.post(`${aiBaseUrl}/ask`, payload, {
      timeout: 20000
    });

    return res.status(200).json({
      answer: data.answer ?? data.message ?? data,
      sources: data.sources ?? []
    });
  } catch (error) {
    console.error("AI ask status:", error.response?.status);
    console.error("AI ask data:", error.response?.data);
    console.error("AI ask error:", error.message);

    return res.status(500).json({
      message: "AI error",
      ai_status: error.response?.status,
      ai_error: error.response?.data || error.message
    });
  }
};

module.exports = { testAgent };