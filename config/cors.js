const allowOrigin = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://ageentlab.netlify.app",
  "https://6a0758f4391b571ae55e8a24--ageentlab.netlify.app",
  "http://localhost:9000",
  "https://apinodejssecure-production.up.railway.app"
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || origin === "null") {
      return callback(null, true);
    }

    const isAllowed =
      allowOrigin.includes(origin) ||
      /^https:\/\/[a-z0-9-]+--ageentlab\.netlify\.app$/.test(origin);

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS"
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-public-key"
  ],

  optionsSuccessStatus: 200
};

module.exports = corsOptions;