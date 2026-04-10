const multer = require("multer");

const storage = multer.memoryStorage();
const allowedExtensions = ["pdf", "csv", "txt", "doc"];

const fileFilter = (req, file, cb) => {
  const ext = file.originalname.split(".").pop().toLowerCase();
  if (allowedExtensions.includes(ext)) return cb(null, true);
  return cb(new Error("Invalid file type. Only PDF, CSV, TXT, DOC allowed."), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 } // 
});


module.exports = upload;
