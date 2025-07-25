const express = require("express");
const multer = require("multer");
const path = require("path");
const { handleImageGeneration } = require("../controllers/imageGenerationController");

const router = express.Router();

// Setup Multer to store files in `uploads/` folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/generate", upload.single("selfie"), handleImageGeneration);


module.exports = router;
