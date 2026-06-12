const agentRepo = require("../repositories/agent");
const axios = require("axios");
const { getSignedFileUrl } = require("../utils/s3SignedUrl");
const { getAiConfigForAgent } = require("../config/aiAgents");

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

    const aiConfig = getAiConfigForAgent(agent.agent_type);

    if (!aiConfig) {
      return res.status(400).json({
        message: "Unsupported agent type",
        agent_type: agent.agent_type
      });
    }

    const aiBaseUrl = aiConfig.baseUrl;
    const aiAgentType = aiConfig.type;

    await agentRepo.updateAgent(agent.agent_id, { ai_status: "processing" });

    const signedUrl = await getSignedFileUrl(agent.file_key);

    const payload = {
      agent_id: agent.agent_id,
      file_url: signedUrl,
      agent_type: aiAgentType,
      file_type: agent.file_type,
      file_name: agent.file_name
    };

    console.log("AI train URL:", `${aiBaseUrl}/train`);
    console.log("AI train payload:", payload);

    const aiResponse = await axios.post(`${aiBaseUrl}/train`, payload, {
      timeout: 120000
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
    }

    await agentRepo.updateAgent(agent.agent_id, {
      ai_status: "failed",
      status: "draft"
    });

    return res.status(500).json({
      success: false,
      message: "AI training failed",
      error: aiResponse.data.message || aiResponse.data
    });
  } catch (error) {
    console.error("AI status:", error.response?.status);
    console.error("AI data:", error.response?.data);
    console.error("trainAgent error:", error.message);

    if (agent) {
      await agentRepo.updateAgent(agent.agent_id, {
        ai_status: "failed",
        status: "draft"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Training failed",
      ai_status: error.response?.status,
      ai_error: error.response?.data || error.message
    });
  }
};

module.exports = { trainAgent };