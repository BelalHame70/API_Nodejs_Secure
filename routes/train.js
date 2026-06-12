const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const { trainAgent } = require("../controllers/train");

const router = express.Router();

/**
 * @swagger
 * /api/v1/agents/{id}/train:
 *   post:
 *     summary: Train agent
 *     tags: [Train]
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
 *         description: Agent trained successfully
 */
router.post("/:id/train", authenticateToken, trainAgent);

module.exports = router;