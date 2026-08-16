import express from "express";
import cors from "cors";

import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

app.use(express.json());

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      success: true,
      message:
        "AI Workspace API is running",
    });
  }
);

app.use(
  "/api/chats",
  chatRoutes
);

app.use(
  "/api/messages",
  messageRoutes
);

/* Error Handler */

app.use(
  (error, req, res, next) => {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
);

export default app;