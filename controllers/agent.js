const { v4: uuid } = require("uuid");
const agentRepo = require("../repositories/agent");

const Agents_types = ["knowledgeBase", "customerSupport", "analytics"];

const createAgent = async (req, res) => {
  try {
    const { name, type } = req.body;

    // validate name
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Agent name required" });
    }

    // validate type
    if (!type || !Agents_types.includes(type)) {
      return res.status(400).json({ message: "Invalid agent type" });
    }

    const agent = await agentRepo.createAgent({
      agent_id: uuid(),
      user_id: req.user.user_id,
      name: name.trim(),
      type,
      status: "draft"
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
