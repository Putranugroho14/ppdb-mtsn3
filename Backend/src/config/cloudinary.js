const cloudinary = require('cloudinary').v2;

// Support full CLOUDINARY_URL env var (e.g. cloudinary://key:secret@cloud_name)
// or individual CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
if (process.env.CLOUDINARY_URL) {
  // Cloudinary SDK reads CLOUDINARY_URL automatically when it's set
  cloudinary.config({ secure: true });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

module.exports = cloudinary;
