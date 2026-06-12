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

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Test User"
 *             email: "test@example.com"
 *             password: "123456"
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "test@example.com"
 *             password: "123456"
 *     responses:
 *       200:
 *         description: User logged in successfully
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   get:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
router.get("/logout", authController.logout);

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   get:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 */
router.get("/refresh-token", authController.refreshToken);

/**
 * @swagger
 * /api/v1/auth/verify-account:
 *   get:
 *     summary: Verify account
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         example: "verification-code"
 *     responses:
 *       200:
 *         description: Account verified successfully
 */
router.get("/verify-account", verifyAccount);

/**
 * @swagger
 * /api/v1/auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "test@example.com"
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 */
router.post("/resend-verification", resendVerification);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request reset password link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "test@example.com"
 *     responses:
 *       200:
 *         description: Password reset link sent
 */
router.post("/forgot-password", resetPasswordRequest);

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     summary: Change password using reset token
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         example: "reset-token"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             newPassword: "newpassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.post("/change-password", verifyResetToken, resetPasswordConfirm);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile returned
 */
router.get("/profile", authenticateToken, getUserProfile);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   delete:
 *     summary: Delete user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             confirmation: "DELETE"
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete("/profile", authenticateToken, deleteOneProfile);

/**
 * @swagger
 * /api/v1/auth/profile-name:
 *   put:
 *     summary: Update profile name
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "New Name"
 *     responses:
 *       200:
 *         description: Name updated
 */
router.put("/profile-name", authenticateToken, updateNameProfile);

/**
 * @swagger
 * /api/v1/auth/change-password-inside:
 *   put:
 *     summary: Change password while logged in
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             oldPassword: "123456"
 *             newPassword: "newpassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.put("/change-password-inside", authenticateToken, changePasswordInside);

/**
 * @swagger
 * /api/v1/auth/profile-email:
 *   put:
 *     summary: Request email change
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "newemail@example.com"
 *     responses:
 *       200:
 *         description: Verification link sent to new email
 */
router.put("/profile-email", authenticateToken, requestEmailChange);

/**
 * @swagger
 * /api/v1/auth/profile-email-confirm:
 *   get:
 *     summary: Confirm email change
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         example: "email-change-token"
 *     responses:
 *       200:
 *         description: Email updated successfully
 */
router.get("/profile-email-confirm", confirmEmailChange);

module.exports = router;