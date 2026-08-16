import express from "express";

import {
  getChats,
  getChat,
  createNewChat,
  removeChat,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/", getChats);

router.post("/", createNewChat);

router.get("/:id", getChat);

router.delete("/:id", removeChat);

export default router;