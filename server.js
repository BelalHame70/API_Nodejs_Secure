require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");

const connectDB = require("./config/db");
const corsOptions = require("./config/cors");

const authRouter = require("./routes/auth");
const agentRouter = require("./routes/agent");
const widgetRouter = require("./routes/widget");
const uploadRouter = require("./routes/upload");
const chatRouter = require("./routes/chat");
const trainRouter = require("./routes/train");

const app = express();
const PORT = process.env.PORT || 9000;

/* ---------------- Public Widget CORS ---------------- */

const publicWidgetCors = cors({
  origin: true,
  credentials: false,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "x-public-key"
  ]
});

app.use("/api/v1/public", publicWidgetCors);

/* ---------------- Main CORS ---------------- */

app.use(cors(corsOptions));

/* ---------------- Middlewares ---------------- */

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

/* ---------------- Health ---------------- */

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

/* ---------------- 404 ---------------- */

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

/* ---------------- Error Handler ---------------- */

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: err.message || "Server error"
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