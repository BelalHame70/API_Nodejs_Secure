const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const { testAgent } = require("../controllers/chat");

const router = express.Router();

router.post("/agents/:id/test", authenticateToken, testAgent);

module.exports = router;