const express = require("express");
const upload = require("./cloudinaryConfig");
const router = express.Router();

// 📌 Upload API (supports images, videos, GIFs)
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // File URL from Cloudinary
    const fileURL = req.file.path;

    res.json({ success: true, mediaURL: fileURL });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
