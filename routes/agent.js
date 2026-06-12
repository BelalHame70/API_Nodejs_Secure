const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");

const {
  createAgent,
  getMyAgents,
  getAgent,
  deleteAgent
} = require("../controllers/agent");

const router = express.Router();

/**
 * @swagger
 * /api/v1/agents:
 *   post:
 *     summary: Create new agent
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "My Agent"
 *             agent_type: "knowledge_base"
 *     responses:
 *       201:
 *         description: Agent created successfully
 */
router.post("/", authenticateToken, createAgent);

/**
 * @swagger
 * /api/v1/agents:
 *   get:
 *     summary: Get my agents
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agents list returned
 */
router.get("/", authenticateToken, getMyAgents);

/**
 * @swagger
 * /api/v1/agents/{id}:
 *   get:
 *     summary: Get agent by id
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         example: "agent-id"
 *     responses:
 *       200:
 *         description: Agent returned successfully
 */
router.get("/:id", authenticateToken, getAgent);

/**
 * @swagger
 * /api/v1/agents/{id}:
 *   delete:
 *     summary: Delete agent by id
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         example: "agent-id"
 *     responses:
 *       200:
 *         description: Agent deleted successfully
 */
router.delete("/:id", authenticateToken, deleteAgent);

module.exports = router;