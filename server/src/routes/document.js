import express from "express";
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
  getFileById,
  getFileByHash,
  updateFile,
} from "../database/sqlite.js";

// ========================================
// ESM __dirname
// ========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================
// Router
// ========================================

const router = express.Router();

// ========================================
// Upload Directory
// ========================================

const uploadDirectory = path.join(
  __dirname,
  "../../uploads"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
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
  },
});

const upload = multer({
  storage,
});

// ========================================
// PUT /api/documents/update/:fileId
// ========================================

router.put(
  "/update/:fileId",
  upload.single("file"),
  (req, res) => {
    let newFilePath = null;

    try {
      // ----------------------------------------
      // Get file ID
      // ----------------------------------------

      const { fileId } = req.params;

      // ----------------------------------------
      // Check replacement file
      // ----------------------------------------

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No replacement file uploaded.",
        });
      }

      newFilePath = req.file.path;

      // ----------------------------------------
      // Find existing document
      // ----------------------------------------

      const existingDocument =
        getFileById(fileId);

      if (!existingDocument) {
        fs.unlinkSync(newFilePath);

        return res.status(404).json({
          success: false,
          message: "Document not found.",
        });
      }

      // ----------------------------------------
      // Read replacement file
      // ----------------------------------------

      const fileBuffer = fs.readFileSync(
        newFilePath
      );

      // ----------------------------------------
      // Generate SHA-256
      // ----------------------------------------

      const newHash = crypto
        .createHash("sha256")
        .update(fileBuffer)
        .digest("hex");

      // ----------------------------------------
      // Check duplicate
      // ----------------------------------------

      const duplicateDocument =
        getFileByHash(newHash);

      if (
        duplicateDocument &&
        duplicateDocument.file_id !== fileId
      ) {
        fs.unlinkSync(newFilePath);
        newFilePath = null;

        return res.status(409).json({
          success: false,
          message:
            "This replacement file already exists as another document.",
          file: duplicateDocument,
        });
      }

      // ----------------------------------------
      // Update SQLite
      // ----------------------------------------

      updateFile({
        file_id: fileId,
        file_name: req.file.originalname,
        file_content_hash: newHash,
      });

      // ----------------------------------------
      // Delete old physical file
      // ----------------------------------------

      /*
       * We currently don't have the old physical
       * filename stored in SQLite.
       *
       * So we intentionally DON'T delete the old
       * physical file here.
       *
       * Later we should add storage_path to SQLite
       * so old files can be safely deleted.
       */

      // ----------------------------------------
      // Success
      // ----------------------------------------

      return res.status(200).json({
        success: true,
        message: "Document updated successfully.",

        file: {
          file_id: fileId,
          file_name: req.file.originalname,
          file_content_hash: newHash,
        },
      });
    } catch (error) {
      console.error(
        "Update document error:",
        error
      );

      // ----------------------------------------
      // Cleanup uploaded replacement
      // ----------------------------------------

      if (
        newFilePath &&
        fs.existsSync(newFilePath)
      ) {
        try {
          fs.unlinkSync(newFilePath);
        } catch (cleanupError) {
          console.error(
            "Failed to cleanup replacement file:",
            cleanupError
          );
        }
      }

      // ----------------------------------------
      // SQLite UNIQUE constraint
      // ----------------------------------------

      if (
        error.code ===
        "SQLITE_CONSTRAINT_UNIQUE"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "A document with this file content already exists.",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to update document.",
        error: error.message,
      });
    }
  }
);

// ========================================
// DELETE /api/documents/:fileId
// ========================================

router.delete(
  "/:fileId",
  (req, res) => {
    return res.status(501).json({
      success: false,
      message:
        "Delete endpoint is not implemented yet.",
    });
  }
);

// ========================================
// Export
// ========================================

export default router;