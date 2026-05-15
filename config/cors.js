const allowOrigin = require("./allowOrigin");

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowOrigin.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
};

module.exports = corsOptions;