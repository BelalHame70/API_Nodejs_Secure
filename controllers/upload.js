const s3 = require("../utils/s3");
const agentRepo = require("../repositories/agent");
const { v4: uuid } = require("uuid");

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File required" });
    }

    const agent = await agentRepo.findById(req.params.id);

    if (!agent || agent.user_id !== req.user.user_id) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const safeName = req.file.originalname.replace(/\s+/g, "_");
    const fileExtension = safeName.split(".").pop().toLowerCase();
    const fileName = `${uuid()}_${safeName}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    const data = await s3.upload(params).promise();

    // update DB with new file
    await agentRepo.updateAgentFile(agent.agent_id, {
      file_path: data.Location,
      file_key: fileName,
      file_name: safeName,
      file_type: fileExtension
    });

    // delete old file after successful upload + DB update
    if (agent.file_key) {
      try {
        await s3.deleteObject({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: agent.file_key
        }).promise();
      } catch (deleteErr) {
        console.error("old file delete error:", deleteErr.message);
      }
    }

    return res.json({
      success: true,
      message: `${fileExtension.toUpperCase()} uploaded successfully`,
      file_path: data.Location,
      file_name: safeName,
      file_type: fileExtension
    });

  } catch (err) {
    console.error("uploadFile error:", err);

    if (err.message && err.message.includes("Invalid file type")) {
      return res.status(400).json({ message: err.message });
    }

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File size exceeds 10MB limit" });
    }

    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

const deleteFile = async (req, res) => {
  try {
    const agent = await agentRepo.findById(req.params.id);

    if (!agent || agent.user_id !== req.user.user_id) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (!agent.file_path || !agent.file_key) {
      return res.status(400).json({ message: "No file to delete" });
    }

    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: agent.file_key
    }).promise();

    await agentRepo.deleteFile(agent.agent_id);

    return res.json({
      success: true,
      message: "File deleted successfully"
    });

  } catch (err) {
    console.error("deleteFile error:", err);

    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

module.exports = {
  uploadFile,
  deleteFile
};