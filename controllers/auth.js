const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const uuid = require("uuid");

const { sendVerification } = require("../controllers/verifyController");
const userRepository = require("../repositories/user");
const refreshRepository = require("../repositories/refresh");

const isProd = process.env.NODE_ENV === "production";

const getCookieOptions = () => ({
  httpOnly: true, // xss protection
  secure: isProd, // https only in production
  sameSite: isProd ? "none" : "lax", // csrf
  maxAge: 7 * 24 * 60 * 60 * 1000
});

// POST /register
const register = async (req, res) => {
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!validEmail.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters",
    });
  }

  try {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      user_id: uuid.v4(),
      name: name.trim(),
      email,
      password: hashedPassword,
      role: "user",
    };

    const user = await userRepository.createUser(newUser);

    await sendVerification(user);

    return res.status(201).json({
      message: "User registered successfully. Please verify your account.",
    });
  } catch (error) {
    console.error("register controller error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// POST /login
const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.verified) {
      return res.status(400).json({
        message: "Account not verified. Please verify your account."
      });
    }

    const accessToken = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role || "user"
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    await refreshRepository.saveRefreshToken({
      user_id: user.user_id,
      token_hash: crypto.createHash("sha256").update(refreshToken).digest("hex"),
      expire: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.cookie("refresh_token", refreshToken, getCookieOptions());

    return res.status(200).json({
      message: "User logged in successfully",
      access_token: accessToken,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        verified: user.verified
      }
    });
  } catch (error) {
    console.error("login controller error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// GET /logout
const logout = async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token not found" });
  }

  try {
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await refreshRepository.deleteRefreshToken(tokenHash);

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax"
    });

    return res.status(200).json({
      message: "User logged out successfully"
    });
  } catch (error) {
    console.error("logout controller error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// GET /refresh-token
const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token not found" });
  }

  try {
    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const storedToken = await refreshRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      return res.status(400).json({ message: "Invalid refresh token" });
    }

    if (storedToken.expire.getTime() < Date.now()) {
      await refreshRepository.deleteRefreshToken(tokenHash);

      return res.status(400).json({
        message: "Refresh token expired"
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await userRepository.findByUserId(decoded.user_id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const accessToken = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role || "user"
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({
      message: "Access token refreshed successfully",
      access_token: accessToken,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        verified: user.verified
      }
    });
  } catch (error) {
    console.error("refreshAccessToken controller error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken: refreshAccessToken
};