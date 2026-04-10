const crypto = require("crypto");
const tokenPasswordRepository = require("../repositories/tokenpassword");

const verifyResetToken = async (req, res, next) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const tokenDoc = await tokenPasswordRepository.findValidTokenByHash(tokenHash);

    if (!tokenDoc) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    req.userId = tokenDoc.userId;
    req.tokenId = tokenDoc._id;

    return next();
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = { verifyResetToken };