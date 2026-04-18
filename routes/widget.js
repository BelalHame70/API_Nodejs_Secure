const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const { checkApiKey } = require("../middlewares/checkApiKey");
const {
  createWidget,
  getWidget,
  initWidgetSession,
  askWidget
} = require("../controllers/widgetController");

const router = express.Router();

router.post("/widgets/:agentId", authenticateToken, createWidget);
router.get("/widgets/:agentId", authenticateToken, getWidget);

router.post("/public/widgets/session", checkApiKey, initWidgetSession);
router.post("/public/widgets/ask", checkApiKey, askWidget);

module.exports = router;