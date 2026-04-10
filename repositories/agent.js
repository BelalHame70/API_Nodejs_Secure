const Agent = require("../models/agent");

// CRUD
const createAgent = (data) => Agent.create(data);
const findByUser = (user_id) => Agent.find({ user_id });
const findById = (agent_id) => Agent.findOne({ agent_id });
const updateAgent = (agent_id, data) => Agent.updateOne({ agent_id }, data);
const deleteAgent = (agent_id) => Agent.deleteOne({ agent_id });

// upload updates
const updateAgentFile = (agent_id, file_path) =>
  Agent.updateOne({ agent_id }, { file_path, status: "trained" });

// ✅ delete file (لو هتستخدم /upload/:id/delete)
const deleteFile = (agent_id) =>
  Agent.updateOne({ agent_id }, { file_path: null, status: "draft" });

module.exports = {
  createAgent,
  findByUser,
  findById,
  updateAgent,
  deleteAgent,
  updateAgentFile,
  deleteFile
};
