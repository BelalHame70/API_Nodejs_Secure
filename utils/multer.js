const multer = require("multer");

const storage = multer.memoryStorage();

const allowedExtensions = ["pdf", "csv", "txt", "doc"];
const allowedMimeTypes = [
  "application/pdf",
  "text/csv",
  "text/plain",
  "application/msword"
];

const fileFilter = (req, file, cb) => {
  const ext = file.originalname.split(".").pop().toLowerCase();

  const isValidExt = allowedExtensions.includes(ext);
  const isValidMime = allowedMimeTypes.includes(file.mimetype);

  if (isValidExt && isValidMime) {
    return cb(null, true);
  }

  return cb(
    new Error("Invalid file type. Only PDF, CSV, TXT, DOC allowed."),
    false
  );
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = upload;