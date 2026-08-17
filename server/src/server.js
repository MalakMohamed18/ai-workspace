import "dotenv/config";

import express from "express";
import cors from "cors";

import chatRouter from "./routes/chat.js";
import uploadRouter from "./routes/upload.js";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);

app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Web backend is running."
  });
});

app.use("/api/chat", chatRouter);
app.use("/api/upload", uploadRouter);

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    success: false,
    message: "Internal server error."
  });
});

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