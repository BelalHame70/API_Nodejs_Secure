const Widget = require('../models/widget'); // عدّل حسب مكان الموديل

const createWidget = (data) => Widget.create(data);
const getWidgetByAgentId = (agent_id) => Widget.findOne({ agent_id });
const getWidgetByKeyHash = (api_key_hash) => Widget.findOne({ api_key_hash });

module.exports = { createWidget, getWidgetByAgentId, getWidgetByKeyHash };
