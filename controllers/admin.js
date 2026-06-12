const bcrypt = require("bcryptjs");
const uuid = require("uuid");

const userRepository = require("../repositories/user");
const agentRepository = require("../repositories/agent");
const agentSessionRepository = require("../repositories/agentSession");

const getDashboardOverview = async (req, res) => {
  try {
    const users = await userRepository.findAllUsers();
    const agents = await agentRepository.findAllAgents();
    const sessionsCount = await agentSessionRepository.countAllSessions();

    const adminsCount = users.filter((user) => user.role === "admin").length;

    return res.status(200).json({
      success: true,
      overview: {
        total_users: users.length,
        total_admins: adminsCount,
        total_agents: agents.length,
        total_sessions: sessionsCount,
        knowledge_base_agents: agents.filter((a) => a.agent_type === "knowledge_base").length,
        customer_support_agents: agents.filter((a) => a.agent_type === "customer_support").length,
        analysis_agents: agents.filter((a) => a.agent_type === "analysis").length
      }
    });
  } catch (error) {
    console.error("getDashboardOverview error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userRepository.findAllUsers();

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error("getAllUsers error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = await userRepository.findByUserId(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const agents = await agentRepository.findAgentsByUserId(user.user_id);
    const agentIds = agents.map((agent) => agent.agent_id);
    const sessions = await agentSessionRepository.findSessionsByAgentIds(agentIds);

    return res.status(200).json({
      success: true,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        verified: user.verified,
        role: user.role,
        createdAt: user.createdAt
      },
      agents_count: agents.length,
      sessions_count: sessions.length,
      agents,
      sessions
    });
  } catch (error) {
    console.error("getUserDetails error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email and password are required"
      });
    }

    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepository.createUser({
      user_id: uuid.v4(),
      name: name.trim(),
      email,
      password: hashedPassword,
      verified: true,
      role: role === "admin" ? "admin" : "user"
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        verified: user.verified,
        role: user.role
      }
    });
  } catch (error) {
    console.error("createUser error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email and password are required"
      });
    }

    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await userRepository.createUser({
      user_id: uuid.v4(),
      name: name.trim(),
      email,
      password: hashedPassword,
      verified: true,
      role: "admin"
    });

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: {
        user_id: admin.user_id,
        name: admin.name,
        email: admin.email,
        verified: admin.verified,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("createAdmin error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const makeAdmin = async (req, res) => {
  try {
    const user = await userRepository.findByUserId(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await userRepository.updateRole(user.user_id, "admin");

    return res.status(200).json({
      success: true,
      message: "User promoted to admin successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("makeAdmin error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const removeAdmin = async (req, res) => {
  try {
    if (req.params.userId === req.user.user_id) {
      return res.status(400).json({
        message: "You cannot remove admin role from yourself"
      });
    }

    const user = await userRepository.findByUserId(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await userRepository.updateRole(user.user_id, "user");

    return res.status(200).json({
      success: true,
      message: "Admin role removed successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("removeAdmin error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.params.userId === req.user.user_id) {
      return res.status(400).json({
        message: "You cannot delete yourself"
      });
    }

    const user = await userRepository.findByUserId(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const agents = await agentRepository.findAgentsByUserId(user.user_id);
    const agentIds = agents.map((agent) => agent.agent_id);

    if (agentIds.length > 0) {
      await agentSessionRepository.deleteSessionsByAgentIds(agentIds);
    }

    await agentRepository.deleteAgentsByUserId(user.user_id);
    await userRepository.deleteUserById(user.user_id);

    return res.status(200).json({
      success: true,
      message: "User, agents and messages deleted successfully"
    });
  } catch (error) {
    console.error("deleteUser error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getAllAgents = async (req, res) => {
  try {
    const agents = await agentRepository.findAllAgents();

    return res.status(200).json({
      success: true,
      count: agents.length,
      agents
    });
  } catch (error) {
    console.error("getAllAgents error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getUserAgents = async (req, res) => {
  try {
    const user = await userRepository.findByUserId(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const agents = await agentRepository.findAgentsByUserId(user.user_id);

    return res.status(200).json({
      success: true,
      count: agents.length,
      agents
    });
  } catch (error) {
    console.error("getUserAgents error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getAgentMessages = async (req, res) => {
  try {
    const agent = await agentRepository.findById(req.params.agentId);

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const sessions = await agentSessionRepository.findSessionsByAgentId(agent.agent_id);

    return res.status(200).json({
      success: true,
      agent,
      sessions_count: sessions.length,
      sessions
    });
  } catch (error) {
    console.error("getAgentMessages error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getUserMessages = async (req, res) => {
  try {
    const user = await userRepository.findByUserId(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const agents = await agentRepository.findAgentsByUserId(user.user_id);
    const agentIds = agents.map((agent) => agent.agent_id);

    const sessions = await agentSessionRepository.findSessionsByAgentIds(agentIds);

    return res.status(200).json({
      success: true,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      agents_count: agents.length,
      sessions_count: sessions.length,
      agents,
      sessions
    });
  } catch (error) {
    console.error("getUserMessages error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = {
  getDashboardOverview,
  getAllUsers,
  getUserDetails,
  createUser,
  createAdmin,
  makeAdmin,
  removeAdmin,
  deleteUser,
  getAllAgents,
  getUserAgents,
  getAgentMessages,
  getUserMessages
};