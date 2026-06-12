const Agent = require("../models/agent");

const createAgent = (data) => Agent.create(data);
const findByUser = (user_id) => Agent.find({ user_id });
const findById = (agent_id) => Agent.findOne({ agent_id });
const updateAgent = (agent_id, data) => Agent.updateOne({ agent_id }, data);
const deleteAgent = (agent_id) => Agent.deleteOne({ agent_id });

const updateAgentFile = (agent_id, fileData) =>
  Agent.updateOne(
    { agent_id },
    {
      file_path: fileData.file_path,
      file_key: fileData.file_key,
      file_name: fileData.file_name,
      file_type: fileData.file_type,
      status: "draft",
      ai_status: "idle"
    }
  );

const deleteFile = (agent_id) =>
  Agent.updateOne(
    { agent_id },
    {
      file_path: null,
      file_key: null,
      file_name: null,
      file_type: null,
      status: "draft",
      ai_status: "idle"
    }
  );

const findAllAgents = () =>
  Agent.find().sort({ createdAt: -1 });

const findAgentsByUserId = (user_id) =>
  Agent.find({ user_id }).sort({ createdAt: -1 });

const deleteAgentsByUserId = (user_id) =>
  Agent.deleteMany({ user_id });

module.exports = {
  createAgent,
  findByUser,
  findById,
  updateAgent,
  deleteAgent,
  updateAgentFile,
  deleteFile,
  findAllAgents,
  findAgentsByUserId,
  deleteAgentsByUserId
};