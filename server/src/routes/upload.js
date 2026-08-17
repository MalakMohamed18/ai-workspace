import express from "express";
import multer from "multer";

import { uploadToAI } from "../services/aiApi.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded."
      });
    }

    const result = await uploadToAI(req.file);

    return res.status(201).json({
      success: true,
      message:
        result?.message ||
        "File uploaded successfully."
    });

  } catch (error) {
    console.error(
      "Upload error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to upload file."
    });
  }
});

export default router;