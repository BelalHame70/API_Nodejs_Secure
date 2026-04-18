const agentRepo = require("../repositories/agent");
const axios = require("axios");
const { getSignedFileUrl } = require("../utils/s3SignedUrl");

const trainAgent = async (req, res) => {
  let agent;

  try {
    agent = await agentRepo.findById(req.params.id);

    if (!agent || agent.user_id !== req.user.user_id) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (!agent.file_key || !agent.file_type) {
      return res.status(400).json({ message: "No file uploaded for this agent" });
    }

    if (!agent.agent_type) {
      return res.status(400).json({ message: "Agent type is missing" });
    }

    await agentRepo.updateAgent(agent.agent_id, { ai_status: "processing" });

    const signedUrl = await getSignedFileUrl(agent.file_key);

    const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/train`, {
      agent_id: agent.agent_id,
      file_url: signedUrl,
      agent_type: agent.agent_type,
      file_type: agent.file_type,
      file_name: agent.file_name
    });

    if (aiResponse.data.success) {
      await agentRepo.updateAgent(agent.agent_id, {
        ai_status: "ready",
        status: "trained"
      });

      return res.json({
        success: true,
        message: "Agent trained successfully",
        agent_id: agent.agent_id
      });
    } else {
      await agentRepo.updateAgent(agent.agent_id, {
        ai_status: "failed",
        status: "draft"
      });

      return res.status(500).json({
        success: false,
        message: "AI training failed",
        error: aiResponse.data.message
      });
    }
  } catch (error) {
    console.error("trainAgent error:", error);

    if (agent) {
      await agentRepo.updateAgent(agent.agent_id, {
        ai_status: "failed",
        status: "draft"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Training failed",
      error: error.message
    });
  }
};

module.exports = { trainAgent };