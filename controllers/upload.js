const s3 = require("../utils/s3");
const agentRepo = require("../repositories/agent");
const { v4: uuid } = require("uuid");

const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File required" });

    const agent = await agentRepo.findById(req.params.id);
    if (!agent || agent.user_id !== req.user.user_id) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const fileExtension = req.file.originalname.split(".").pop().toLowerCase();
    const fileName = `${uuid()}_${req.file.originalname}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: "public-read"
    };

    const data = await s3.upload(params).promise();

    // ✅ يحدّث file_path + status trained
    await agentRepo.updateAgentFile(req.params.id, data.Location);

    return res.json({
      message: `${fileExtension.toUpperCase()} uploaded successfully`,
      file_path: data.Location
    });
  } catch (err) {
    console.error(err);
    if (err.message && err.message.includes("Invalid file type")) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const agent = await agentRepo.findById(req.params.id);
    if (!agent || agent.user_id !== req.user.user_id) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // ملاحظة: انت عامل deleteFile في repo؟ لو مش موجود، لازم تعملها.
    await agentRepo.deleteFile(req.params.id);

    return res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { uploadFile, deleteFile };
