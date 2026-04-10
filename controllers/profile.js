const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userRepository = require("../repositories/user");
const tokenPasswordRepository = require("../repositories/tokenpassword");
const emailChangeRepository = require("../repositories/EmailChangeToken");
const { sendVerificationEmail } = require("../utils/mailService");

// GET /profile
const getUserProfile = async (req, res) => {
  try {
    const foundUser = await userRepository.findByUserId(req.user.user_id);

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user_id: foundUser.user_id,
      name: foundUser.name,
      email: foundUser.email,
      verified: foundUser.verified
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// PUT /profile-name
const updateNameProfile = async (req, res) => {
  const { name } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    await userRepository.updateByUserId(req.user.user_id, {
      name: name.trim()
    });

    return res.status(200).json({ message: "Name updated" });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// PUT /profile-email
const requestEmailChange = async (req, res) => {
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const { email: newEmail } = req.body || {};

  if (!newEmail || !validEmail.test(newEmail)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  try {
    const user = await userRepository.findByUserId(req.user.user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.email === newEmail) {
      return res.status(400).json({ message: "Email is the same as current" });
    }

    const existingUser = await userRepository.findByEmail(newEmail);
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await emailChangeRepository.invalidateAllForUser(req.user.user_id);

    await emailChangeRepository.create({
      userId: req.user.user_id,
      newEmail,
      tokenHash,
      expiresAt,
      used: false
    });

    const verifyLink = `http://localhost:9000/api/v1/auth/profile-email-confirm?token=${token}`;
    const html = `
      <p>Confirm your new email by clicking:</p>
      <p><a href="${verifyLink}">Verify new email</a></p>
      <p>This link expires in 1 hour.</p>
    `;

    await sendVerificationEmail(newEmail, html, "Verify your new email");

    return res.status(200).json({
      message: "Verification link sent to new email"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// GET /profile-email-confirm?token=...
const confirmEmailChange = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const requestRecord = await emailChangeRepository.findByTokenHash(tokenHash);

    if (!requestRecord) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (requestRecord.used) {
      return res.status(400).json({ message: "Token already used" });
    }

    if (requestRecord.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "Token expired" });
    }

    const existingUser = await userRepository.findByEmail(requestRecord.newEmail);
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    await userRepository.updateByUserId(requestRecord.userId, {
      email: requestRecord.newEmail,
      verified: true
    });

    await emailChangeRepository.markUsed(requestRecord._id);

    return res.status(200).json({ message: "Email updated successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// DELETE /profile
const deleteOneProfile = async (req, res) => {
  const { confirmation } = req.body;

  if (confirmation !== "DELETE") {
    return res.status(400).json({
      message: "Confirmation text does not match"
    });
  }

  try {
    const foundUser = await userRepository.findByUserId(req.user.user_id);

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await userRepository.deleteByUserId(req.user.user_id);

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// POST /forgot-password
const resetPasswordRequest = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      return res.status(200).json({
        message: "If account exists, check your email"
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await tokenPasswordRepository.createTokenPassword({
      userId: user.user_id,
      tokenHash,
      expiresAt,
      used: false
    });

    const resetLink = `http://localhost:9000/api/v1/auth/change-password?token=${token}`;
    const html = `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`;

    await sendVerificationEmail(user.email, html, "Reset Your Password");

    return res.status(200).json({
      message: "Password reset link sent to email"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// POST /change-password?token=...
const resetPasswordConfirm = async (req, res) => {
  const { newPassword } = req.body;
  const { userId, tokenId } = req;

  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      message: "New password must be at least 6 characters"
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await userRepository.updatePassword(userId, hashedPassword);
    await tokenPasswordRepository.markTokenUsed(tokenId);

    return res.status(200).json({
      message: "Password changed successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// PUT /change-password-inside
const changePasswordInside = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      message: "New password must be at least 6 characters"
    });
  }

  try {
    const user = await userRepository.findByUserId(req.user.user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(req.user.user_id, hashedPassword);

    return res.status(200).json({
      message: "Password changed successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = {
  getUserProfile,
  updateNameProfile,
  requestEmailChange,
  confirmEmailChange,
  deleteOneProfile,
  resetPasswordRequest,
  resetPasswordConfirm,
  changePasswordInside
};