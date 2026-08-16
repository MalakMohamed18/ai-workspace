import {
  createMessage,
  getMessagesByChatId,
} from "../services/messageService.js";

import { getDevelopmentUser } from "../config/devUser.js";

export async function getMessages(
  req,
  res,
  next
) {
  try {
    const user =
      await getDevelopmentUser();

    const messages =
      await getMessagesByChatId(
        req.params.chatId,
        user._id
      );

    if (!messages) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    res.json({
      success: true,
      data: messages,
    });

  } catch (error) {
    next(error);
  }
}

export async function sendMessage(
  req,
  res,
  next
) {
  try {
    const user =
      await getDevelopmentUser();

    const { content } = req.body;

    if (
      !content ||
      !content.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Message content is required",
      });
    }

    const message =
      await createMessage(
        req.params.chatId,
        user._id,
        content.trim()
      );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    res.status(201).json({
      success: true,
      data: message,
    });

  } catch (error) {
    next(error);
  }
}