// controllers/testAgent.js
const axios = require("axios");
const agentRepo = require("../repositories/agent");

const AI_BASE = process.env.AI_SERVICE_URL;

const testAgent = async (req, res) => {
  try {
    if (!AI_BASE) {
      return res.status(500).json({ message: "AI_SERVICE_URL is not set" });
    }

    const { message } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "message is required" });
    }

    const agent = await agentRepo.findById(req.params.id);

    // ownership check
    if (!agent || agent.user_id !== req.user.user_id) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // prevent test before training
    if (agent.ai_status !== "ready") {
      return res.status(400).json({ message: "Agent is not trained yet" });
    }

    // call AI service (same idea as widget ask)
    const { data } = await axios.post(
      `${AI_BASE}/ask`,
      { agent_id: agent.agent_id, message: message.trim() },
      { timeout: 20000 }
    );

    return res.status(200).json({
      answer: data.answer ?? data,
      sources: data.sources ?? []
    });
  } catch (error) {
    return res.status(500).json({
      message: "AI error",
      error: error.message
    });
  }
};

module.exports = { testAgent };
