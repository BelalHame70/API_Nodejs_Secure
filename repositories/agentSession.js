const AgentSession = require("../models/agentSession");

const createSession = (data) => AgentSession.create(data);

const findBySessionId = (session_id) => AgentSession.findOne({ session_id });

const findBySessionAndAgent = (session_id, agent_id) =>
  AgentSession.findOne({ session_id, agent_id });

const appendMessage = (session_id, messageObj) =>
  AgentSession.updateOne(
    { session_id },
    { $push: { messages: messageObj } }
  );

module.exports = {
  createSession,
  findBySessionId,
  findBySessionAndAgent,
  appendMessage
};
