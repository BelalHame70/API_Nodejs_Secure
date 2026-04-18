const AgentSession = require("../models/agentSession");

const createSession = (data) => AgentSession.create(data);
// createSession({
//   session_id: "123",
//   agent_id: "agent_1",
//   visitor_id: "visitor_1",
//   messages: []
// }); 

const findBySessionId = (session_id) =>
  AgentSession.findOne({ session_id });

const findBySessionAndAgent = (session_id, agent_id) =>
  AgentSession.findOne({ session_id, agent_id });

const appendMessage = (session_id, agent_id, messageObj) =>  //add message to session into array
  AgentSession.findOneAndUpdate(
    { session_id, agent_id },
    { $push: { messages: messageObj } },
    { new: true }
  );

const getMessages = (session_id, agent_id) =>
  AgentSession.findOne({ session_id, agent_id }).select("messages");

module.exports = {
  createSession,
  findBySessionId,
  findBySessionAndAgent,
  appendMessage,
  getMessages
};