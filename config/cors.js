const allowOrigin = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://ageentlab.netlify.app"
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const isAllowed =
      allowOrigin.includes(origin) ||
      /^https:\/\/[a-z0-9-]+--ageentlab\.netlify\.app$/.test(origin);

    if (isAllowed) {
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