const express = require("express");
const router = express.Router();

const authenticateToken = require("../middlewares/authenticateToken");
const { checkApiKey } = require("../middlewares/requireWidgetKey");

const { createWidget, getWidget, askWidget } = require("../controllers/widget");
//const { createWidgetSession, getWidgetSession } = require("../controllers/widgetSession");

// Owner routes (Dashboard)
router.post("/agents/:agentId/widget", authenticateToken, createWidget);
router.get("/agents/:agentId/widget", authenticateToken, getWidget);

// Visitor routes (Public Widget)
// router.post("/widget/:publicKey/session", checkApiKey, createWidgetSession);
// router.get("/widget/:publicKey/session/:sessionId", checkApiKey, getWidgetSession);
// router.post("/widget/:publicKey/ask", checkApiKey, askWidget);

module.exports = router;
