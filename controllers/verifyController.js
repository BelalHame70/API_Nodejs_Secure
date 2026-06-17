const crypto = require("crypto");
const otpRepo = require("../repositories/otp");
const userRepo = require("../repositories/user");
const { sendVerificationEmail } = require("../utils/mailService");

const getFrontendUrl = () => process.env.FRONTEND_URL || "http://localhost:3000";
const getApiUrl = () => process.env.API_URL || "http://localhost:9000";

const sendVerification = async (user) => {
  const code = crypto.randomBytes(6).toString("hex");
  const expire = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await otpRepo.createOtp({
    user_id: user.user_id,
    otp_number: code,
    expire_at: expire,
    used: false,
  });

  const link = `${getApiUrl()}/api/v1/auth/verify-account?code=${code}`;
  const html = `<p>Click <a href="${link}">here</a> to verify your account</p>`;

  return sendVerificationEmail(user.email, html, "Verify Your Account");
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
      message: "Verification code sent successfully",
    });
  } catch (error) {
    console.error("resendVerification controller error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const verifyAccount = async (req, res) => {
  const { code } = req.query;

  const successRedirect = `${getFrontendUrl()}/auth?mode=login&verified=success`;
  const failedRedirect = `${getFrontendUrl()}/auth?mode=login&verified=failed`;

  if (!code) {
    return res.redirect(failedRedirect);
  }

  try {
    const record = await otpRepo.findValidOtp(code);

    if (!record) {
      return res.redirect(failedRedirect);
    }

    await otpRepo.markUsed(record._id);
    await userRepo.verifyUser(record.user_id);

    return res.redirect(successRedirect);
  } catch (error) {
    console.error("verifyAccount controller error:", error);
    return res.redirect(failedRedirect);
  }
};

module.exports = {
  sendVerification,
  resendVerification,
  verifyAccount,
};