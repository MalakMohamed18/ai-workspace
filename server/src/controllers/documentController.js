import {
  uploadToAI,
  updateAIFile,
} from "../services/documentService.js";

export async function getDocuments(
  req,
  res,
  next,
) {
  try {
    /*
      TODO:
      في المرحلة دي الـ documents
      المفروض تتجاب من SQLite.

      هنربطها بالـ database في الخطوة
      التالية.
    */

    return res.json({
      success: true,
      documents: [],
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadDocument(
  req,
  res,
  next,
) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "No file was uploaded.",
      });
    }

    const result =
      await uploadToAI(req.file);

    return res.status(201).json({
      success: true,
      message:
        "Document uploaded successfully.",
      data: result,
    });
  } catch (error) {
    console.error(
      "Upload document error:",
      error,
    );

    next(error);
  }
}

export async function updateDocument(
  req,
  res,
  next,
) {
  try {
    const { file_id } = req.params;

    if (!file_id) {
      return res.status(400).json({
        success: false,
        message:
          "file_id is required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "No replacement file was uploaded.",
      });
    }

    const result =
      await updateAIFile(
        file_id,
        req.file,
      );

    return res.json({
      success: true,
      message:
        "Document updated successfully.",
      data: result,
    });
  } catch (error) {
    console.error(
      "Update document error:",
      error,
    );

    next(error);
  }
}