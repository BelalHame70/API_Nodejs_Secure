const agentRepo = require("../repositories/agent");
const axios = require("axios");

const trainAgent = async (req, res) => {
  try {
    const agent = await agentRepo.findById(req.params.id);

    if (!agent || agent.user_id !== req.user.user_id) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (!agent.file_path) {
      return res.status(400).json({ message: "No PDF uploaded for this agent" });
    }

    await agentRepo.updateAgent(agent.agent_id, { ai_status: "processing" });

    const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/train`, {
      agent_id: agent.agent_id,
      file_url: agent.file_path,
      agent_type: agent.type
    });

    if (aiResponse.data.success) {
      await agentRepo.updateAgent(agent.agent_id, { ai_status: "ready" });
      return res.json({ message: "Agent trained successfully", agent_id: agent.agent_id });
    } else {
      await agentRepo.updateAgent(agent.agent_id, { ai_status: "failed" });
      return res.status(500).json({
        message: "AI training failed",
        error: aiResponse.data.message
      });
    }
  } catch (error) {
    console.error(error);
    await agentRepo.updateAgent(req.params.id, { ai_status: "failed" });
    return res.status(500).json({ message: "Training failed", error: error.message });
  }
};

module.exports = { trainAgent };
