const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const upload = require("../utils/multer");

const { uploadFile, deleteFile } = require("../controllers/upload");

const router = express.Router();

/**
 * @swagger
 * /api/v1/upload/{id}/upload:
 *   post:
 *     summary: Upload file for agent
 *     tags: [Upload]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */
router.post("/:id/upload", authenticateToken, upload.single("file"), uploadFile);

/**
 * @swagger
 * /api/v1/upload/{id}/delete:
 *   delete:
 *     summary: Delete uploaded file from agent
 *     tags: [Upload]
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
 *         description: File deleted successfully
 */
router.delete("/:id/delete", authenticateToken, deleteFile);

module.exports = router;