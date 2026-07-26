const path = require('node:path');

const multer = require('multer');

const { env } = require('../config/env');
const { ValidationError } = require('../utils/ApiError');

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, path.resolve(process.cwd(), env.UPLOAD_PATH));
  },
  filename: (_req, file, callback) => {
    callback(null, `${Date.now()}-${file.originalname}`);
  },
});

function fileFilter(_req, file, callback) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(new ValidationError([{ code: 'INVALID_FILE_TYPE', message: `Unsupported file type: ${file.mimetype}` }]));
    return;
  }
  callback(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024 },
});

module.exports = { upload };
