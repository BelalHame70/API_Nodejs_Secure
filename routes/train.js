const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const { trainAgent } = require("../controllers/train");

const router = express.Router();

router.post("/:id/train", authenticateToken, trainAgent);

module.exports = router;