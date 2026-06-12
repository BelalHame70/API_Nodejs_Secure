require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const connectDB = require("./config/db");
const corsOptions = require("./config/cors");

const authRouter = require("./routes/auth");
const agentRouter = require("./routes/agent");
const widgetRouter = require("./routes/widget");
const uploadRouter = require("./routes/upload");
const chatRouter = require("./routes/chat");
const trainRouter = require("./routes/train");
const adminRouter = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 9000;

/* ---------------- Swagger ---------------- */

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Final Project API",
      version: "1.0.0",
      description: "API Documentation for Final Project",
    },
    servers: [
      {
        url: "http://localhost:9000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        publicKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-public-key",
        },
      },
    },
    tags: [
      { name: "Health" },
      { name: "Auth" },
      { name: "Agents" },
      { name: "Upload" },
      { name: "Widgets" },
      { name: "Chat" },
      { name: "Train" },
      { name: "Admin" },
    ],
  },
  apis: ["./routes/*.js", "./server.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

/* ---------------- Public Widget CORS ---------------- */

const publicWidgetCors = cors({
  origin: true,
  credentials: false,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-public-key"],
});

app.use("/api/v1/public", publicWidgetCors);

/* ---------------- Main CORS ---------------- */

app.use(cors(corsOptions));

/* ---------------- Middlewares ---------------- */

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

/* ---------------- Admin Login Page ---------------- */

app.get("/admin-login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin-login.html"));
});

/* ---------------- Admin Dashboard Page ---------------- */

app.get("/admin-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin-dashboard.html"));
});

/* ---------------- Swagger Docs ---------------- */

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* ---------------- Health ---------------- */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check server health
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 */
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

/* ---------------- Routes ---------------- */

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/agents", agentRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1", widgetRouter);
app.use("/api/v1/agents/:agentId/widgets", widgetRouter);
app.use("/api/v1/agents", trainRouter);
app.use("/api/v1", chatRouter);

/* ---------------- Admin Routes ---------------- */

app.use("/api/v1/admin", adminRouter);

/* ---------------- 404 ---------------- */

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

/* ---------------- Error Handler ---------------- */

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: err.message || "Server error",
  });
});

/* ---------------- DB ---------------- */

connectDB();

mongoose.connection.once("open", () => {
  console.log("MongoDB connected");

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err);
});