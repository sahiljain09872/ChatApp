require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// 🔥 Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔥 Set up storage for images/videos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "chat_uploads",  // 🔥 Cloud folder where files are stored
    allowed_formats: ["jpg", "png", "gif", "mp4", "mov"],
    resource_type: "auto",  // 🔥 Allows both images & videos
  },
});

// Initialize multer with Cloudinary storage
const upload = multer({ storage });

module.exports = upload;
