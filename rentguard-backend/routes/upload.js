const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage to process stream directly to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

router.post('/', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided.' });
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'rentguard_proofs' },
    (error, result) => {
      if (error) return res.status(500).json({ error: error.message });
      res.status(200).json({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }
  );

  uploadStream.end(req.file.buffer);
});

module.exports = router;