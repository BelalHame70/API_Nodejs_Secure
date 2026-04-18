const { v4: uuid } = require("uuid");
const agentRepo = require("../repositories/agent");

const AGENT_TYPES =  ["knowledge Base", "analysis", "customer support"];

const createAgent = async (req, res) => {
  try {
    const { name, agent_type } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Agent name required" });
    }

    if (!agent_type || !AGENT_TYPES.includes(agent_type)) {
      return res.status(400).json({ message: "Invalid agent type" });
    }

    const agent = await agentRepo.createAgent({
      agent_id: uuid(),
      user_id: req.user.user_id,
      name: name.trim(),
      agent_type,
      status: "draft",
      ai_status: "idle",
      file_path: null,
      file_key: null,
      file_name: null,
      file_type: null
    });

    return res.status(201).json(agent);
  } catch (err) {
    console.error("createAgent error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getMyAgents = async (req, res) => {
  try {
    const agents = await agentRepo.findByUser(req.user.user_id);
    return res.json(agents);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAgent = async (req, res) => {
  try {
    const agent = await agentRepo.findById(req.params.id);

    if (!agent || agent.user_id !== req.user.user_id) {
      return res.status(404).json({ message: "Agent not found" });
    }

    return res.json(agent);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteAgent = async (req, res) => {
  try {
    const agent = await agentRepo.findById(req.params.id);

    if (!agent || agent.user_id !== req.user.user_id) {
      return res.status(404).json({ message: "Agent not found" });
    }

    await agentRepo.deleteAgent(req.params.id);
    return res.json({ message: "Agent deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAgent,
  getMyAgents,
  getAgent,
  deleteAgent
};