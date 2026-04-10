// routes/agentTest.js
const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const { testAgent } = require("../controllers/testAgent");

const router = express.Router();

// Owner tests agent from dashboard
router.post("/agents/:id/test", authenticateToken, testAgent);

module.exports = router;
