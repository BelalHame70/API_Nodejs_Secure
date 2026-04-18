const Widget = require("../models/widget");

const createWidget = async (data) => {
  return Widget.create(data);
};

const getWidgetByAgentId = async (agent_id) => {
  return Widget.findOne({ agent_id });
};

const getWidgetByKeyHash = async (api_key_hash) => {
  return Widget.findOne({ api_key_hash });
};

const getWidgetByWidgetId = async (widget_id) => {
  return Widget.findOne({ widget_id });
};

const updateWidgetByAgentId = async (agent_id, updateData) => {
  return Widget.findOneAndUpdate({ agent_id }, updateData, { new: true });
};

const deleteWidgetByAgentId = async (agent_id) => {
  return Widget.findOneAndDelete({ agent_id });
};

module.exports = {
  createWidget,
  getWidgetByAgentId,
  getWidgetByKeyHash,
  getWidgetByWidgetId,
  updateWidgetByAgentId,
  deleteWidgetByAgentId
};