import "dotenv/config";

import express from "express";
import cors from "cors";

import chatRouter from "./routes/chat.js";
import uploadRouter from "./routes/upload.js";
import documentsRouter from "./routes/document.js";

const app = express();

const PORT = process.env.PORT || 5000;

// ========================================
// Middleware
// ========================================

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173"
  })
);

app.use(
  express.json({
    limit: "10mb"
  })
);

// ========================================
// Health Check
// ========================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Web backend is running."
  });
});

// ========================================
// Routes
// ========================================

// Chat
app.use(
  "/api/chat",
  chatRouter
);

// Upload new document
app.use(
  "/api/upload",
  uploadRouter
);

// Documents
// GET  /api/documents
// PUT  /api/documents/update/:fileId
app.use(
  "/api/documents",
  documentsRouter
);

// ========================================
// Error Handler
// ========================================

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error."
  });
});

// ========================================
// Start Server
// ========================================

app.listen(PORT, () => {
  console.log(`
========================================
 Medical RAG Web Backend
========================================
 Server: http://localhost:${PORT}
 AI API: ${process.env.AI_API_URL}
========================================
  `);
});