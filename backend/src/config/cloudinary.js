const cloudinary = require('cloudinary').v2;

const { env } = require('./env');

// Configuration only — no upload flow calls this yet. Wiring Multer's local
// disk storage over to Cloudinary is deferred to a future phase.
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME || undefined,
  api_key: env.CLOUDINARY_API_KEY || undefined,
  api_secret: env.CLOUDINARY_API_SECRET || undefined,
});

module.exports = { cloudinary };
