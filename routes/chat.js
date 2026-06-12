const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const { testAgent } = require("../controllers/chat");

const router = express.Router();

/**
 * @swagger
 * /api/v1/agents/{id}/test:
 *   post:
 *     summary: Test agent from dashboard
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         example: "agent-id"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             message: "Hello, test my agent"
 *     responses:
 *       200:
 *         description: Agent answer returned successfully
 */
router.post("/agents/:id/test", authenticateToken, testAgent);

module.exports = router;