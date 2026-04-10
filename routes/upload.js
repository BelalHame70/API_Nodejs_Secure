const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const upload = require("../utils/multer");

const { uploadFile, deleteFile } = require("../controllers/upload");

const router = express.Router();

router.post("/:id/upload", authenticateToken, upload.single("file"), uploadFile);
router.delete("/:id/delete", authenticateToken, deleteFile);

module.exports = router;
