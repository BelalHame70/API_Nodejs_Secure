const AI_AGENT_CONFIG = {
  knowledge_base: {
    type: "knowledge_base",
    baseUrl: "https://hayam-mostafa-ai-knowledge-agent.hf.space",
    trainPath: "/train",
    chatPath: "/ask",
    chatMessageKey: "question"
  },

  customer_support: {
    type: "customer_support",
    baseUrl: "https://shrouk04-customer-support-rag.hf.space",
    trainPath: "/train",
    chatPath: "/chat",
    chatMessageKey: "message"
  },

  // مؤقت لحد ما لينك analysis يطلع
  analysis: {
    type: "analysis",
    baseUrl: "https://hayam-mostafa-ai-knowledge-agent.hf.space",
    trainPath: "/train",
    chatPath: "/ask",
    chatMessageKey: "question"
  }
};

const normalizeAgentType = (agentType) => {
  if (!agentType || typeof agentType !== "string") {
    return "";
  }

  return agentType
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
};

const getAiConfigForAgent = (agentType) => {
  const normalizedType = normalizeAgentType(agentType);
  const config = AI_AGENT_CONFIG[normalizedType];

  if (!config) {
    return null;
  }

  return {
    ...config,
    baseUrl: config.baseUrl.replace(/\/$/, "")
  };
};

module.exports = {
  getAiConfigForAgent
};