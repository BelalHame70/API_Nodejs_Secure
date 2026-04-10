const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");
const {
  verifyAccount,
  resendVerification
} = require("../controllers/verifyController");

const authenticateToken = require("../middlewares/authenticateToken");
const { verifyResetToken } = require("../middlewares/password_verify");

const {
  resetPasswordRequest,
  resetPasswordConfirm,
  getUserProfile,
  deleteOneProfile,
  updateNameProfile,
  changePasswordInside,
  requestEmailChange,
  confirmEmailChange
} = require("../controllers/profile");

// Auth routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/refresh-token", authController.refreshToken);

// Verify account
router.get("/verify-account", verifyAccount);
router.post("/resend-verification", resendVerification);

// Forgot / Reset password
router.post("/forgot-password", resetPasswordRequest);
router.post("/change-password", verifyResetToken, resetPasswordConfirm);

// User profile
router.get("/profile", authenticateToken, getUserProfile);
router.delete("/profile", authenticateToken, deleteOneProfile);

router.put("/profile-name", authenticateToken, updateNameProfile);
router.put("/change-password-inside", authenticateToken, changePasswordInside);

// Email change with verification
router.put("/profile-email", authenticateToken, requestEmailChange);
router.get("/profile-email-confirm", confirmEmailChange);

module.exports = router;