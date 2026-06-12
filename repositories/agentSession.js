const AgentSession = require("../models/agentSession");

const createSession = (data) => AgentSession.create(data);

const findBySessionId = (session_id) =>
  AgentSession.findOne({ session_id });

const findBySessionAndAgent = (session_id, agent_id) =>
  AgentSession.findOne({ session_id, agent_id });

const appendMessage = (session_id, agent_id, messageObj) =>
  AgentSession.findOneAndUpdate(
    { session_id, agent_id },
    { $push: { messages: messageObj } },
    { new: true }
  );

const getMessages = (session_id, agent_id) =>
  AgentSession.findOne({ session_id, agent_id }).select("messages");

const findSessionsByAgentId = (agent_id) =>
  AgentSession.find({ agent_id }).sort({ created_at: -1 });

const findSessionsByAgentIds = (agentIds) =>
  AgentSession.find({ agent_id: { $in: agentIds } }).sort({ created_at: -1 });

const deleteSessionsByAgentIds = (agentIds) =>
  AgentSession.deleteMany({ agent_id: { $in: agentIds } });

const countAllSessions = () =>
  AgentSession.countDocuments();

module.exports = {
  createSession,
  findBySessionId,
  findBySessionAndAgent,
  appendMessage,
  getMessages,
  findSessionsByAgentId,
  findSessionsByAgentIds,
  deleteSessionsByAgentIds,
  countAllSessions
};