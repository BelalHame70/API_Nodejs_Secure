const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");

const {
  createAgent,
  getMyAgents,
  getAgent,
  updateAgent,
  deleteAgent
} = require("../controllers/agent");

const router = express.Router();

router.post("/", authenticateToken, createAgent);
router.get("/", authenticateToken, getMyAgents);
router.get("/:id", authenticateToken, getAgent);
router.put("/:id", authenticateToken, updateAgent);
router.delete("/:id", authenticateToken, deleteAgent);

module.exports = router;
