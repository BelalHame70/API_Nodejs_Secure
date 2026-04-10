const crypto = require("crypto");
const otpRepo = require("../repositories/otp");
const userRepo = require("../repositories/user");
const { sendVerificationEmail } = require("../utils/mailService");

const sendVerification = async (user) => {
  const code = crypto.randomBytes(6).toString("hex");
  const expire = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await otpRepo.createOtp({
    user_id: user.user_id,
    otp_number: code,
    expire_at: expire,
    used: false
  });

  const link = `http://localhost:9000/api/v1/auth/verify-account?code=${code}`;
  const html = `<p>Click <a href="${link}">here</a> to verify your account</p>`;

  await sendVerificationEmail(user.email, html, "Verify Your Account");
};

const resendVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await userRepo.findByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "Account already verified" });
    }

    await sendVerification(user);

    return res.status(200).json({
      message: "Verification code sent successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const verifyAccount = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: "Code required" });
  }

  try {
    const record = await otpRepo.findValidOtp(code);

    if (!record) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    await otpRepo.markUsed(record._id);
    await userRepo.verifyUser(record.user_id);

    return res.status(200).json({
      message: "Account verified successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = {
  sendVerification,
  resendVerification,
  verifyAccount
};