import express from "express";
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
  createFile,
  getFileByHash,
  getAllFiles
} from "../database/sqlite.js";

const router = express.Router();

// ========================================
// ESM __dirname
// ========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================
// Upload Directory
// ========================================

const uploadDirectory = path.join(
  __dirname,
  "../../uploads"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true
  });
}

// ========================================
// Multer
// ========================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },

  filename: function (req, file, cb) {
    const uniqueName =
      `${Date.now()}-${crypto.randomUUID()}-${file.originalname}`;

    cb(null, uniqueName);
  }
});

const upload = multer({
  storage
});

// ========================================
// GET /api/upload
// Get all documents
// ========================================

router.get("/", (req, res) => {
  try {
    const files = getAllFiles();

    console.log("GET /api/upload");
    console.log("Documents from SQLite:", files);

    return res.status(200).json({
      success: true,
      documents: files
    });

  } catch (error) {
    console.error(
      "Get documents error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load documents.",
      error: error.message
    });
  }
});

// ========================================
// POST /api/upload
// Upload new document
// ========================================

router.post(
  "/",
  upload.single("file"),
  async (req, res) => {

    try {

      // ----------------------------------------
      // Check file
      // ----------------------------------------

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded."
        });
      }

      console.log(
        "Uploading:",
        req.file.originalname
      );

      // ----------------------------------------
      // Read file
      // ----------------------------------------

      const fileBuffer = fs.readFileSync(
        req.file.path
      );

      // ----------------------------------------
      // SHA-256
      // ----------------------------------------

      const fileContentHash = crypto
        .createHash("sha256")
        .update(fileBuffer)
        .digest("hex");

      console.log(
        "File hash:",
        fileContentHash
      );

      // ----------------------------------------
      // Duplicate check
      // ----------------------------------------

      const existingFile =
        getFileByHash(fileContentHash);

      if (existingFile) {

        console.log(
          "File already exists:",
          existingFile
        );

        // Delete newly uploaded physical file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(409).json({
          success: false,
          exists: true,
          message: "File already exists.",
          file: existingFile
        });
      }

      // ----------------------------------------
      // Generate ID
      // ----------------------------------------

      const fileId = crypto.randomUUID();

      // ----------------------------------------
      // Save in SQLite
      // ----------------------------------------

      createFile({
        file_id: fileId,
        file_name: req.file.originalname,
        file_content_hash: fileContentHash
      });

      // ----------------------------------------
      // Response
      // ----------------------------------------

      const document = {
        file_id: fileId,
        file_name: req.file.originalname,
        file_content_hash: fileContentHash
      };

      console.log(
        "Document saved:",
        document
      );

      return res.status(201).json({
        success: true,
        message: "File uploaded successfully.",
        file: document
      });

    } catch (error) {

      console.error(
        "Upload error:",
        error
      );

      // ----------------------------------------
      // Cleanup uploaded file
      // ----------------------------------------

      if (req.file?.path) {
        try {

          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }

        } catch (cleanupError) {

          console.error(
            "Upload cleanup error:",
            cleanupError
          );

        }
      }

      return res.status(500).json({
        success: false,
        message: "Failed to upload file.",
        error: error.message
      });
    }
  }
);

export default router;