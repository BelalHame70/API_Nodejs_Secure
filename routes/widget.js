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

/**
 * @swagger
 * /api/v1/widgets/{agentId}:
 *   post:
 *     summary: Create widget for agent
 *     tags: [Widgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agentId
 *         schema:
 *           type: string
 *         required: true
 *         example: "agent-id"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           example:
 *             welcome_message: "Hi! How can I help you?"
 *             position: "bottom-right"
 *             theme_config:
 *               primaryColor: "#111827"
 *               textColor: "#ffffff"
 *     responses:
 *       201:
 *         description: Widget created successfully
 */
router.post("/widgets/:agentId", authenticateToken, createWidget);

/**
 * @swagger
 * /api/v1/widgets/{agentId}:
 *   get:
 *     summary: Get widget by agent id
 *     tags: [Widgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agentId
 *         schema:
 *           type: string
 *         required: true
 *         example: "agent-id"
 *     responses:
 *       200:
 *         description: Widget returned successfully
 */
router.get("/widgets/:agentId", authenticateToken, getWidget);

/**
 * @swagger
 * /api/v1/public/widgets/session:
 *   post:
 *     summary: Create public widget session
 *     tags: [Widgets]
 *     security:
 *       - publicKeyAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           example:
 *             publicKey: "public-widget-key"
 *     responses:
 *       201:
 *         description: Session created successfully
 */
router.post("/public/widgets/session", checkApiKey, initWidgetSession);

/**
 * @swagger
 * /api/v1/public/widgets/ask:
 *   post:
 *     summary: Ask widget message
 *     tags: [Widgets]
 *     security:
 *       - publicKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             publicKey: "public-widget-key"
 *             session_id: "session-id"
 *             message: "Hello"
 *     responses:
 *       200:
 *         description: Widget answer returned successfully
 */
router.post("/public/widgets/ask", checkApiKey, askWidget);

module.exports = router;