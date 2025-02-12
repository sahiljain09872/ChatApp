const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinaryConfig");

// Define storage for Multer using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // Folder name in Cloudinary
    format: async (req, file) => "png", // You can change format
    public_id: (req, file) => file.originalname.split(".")[0], // Use file name
  },
});

// Set up multer
const upload = multer({ storage: storage });

module.exports = upload;
