import {
  createChat,
  deleteChat,
  getAllChats,
  getChatById,
} from "../services/chatService.js";

import { getDevelopmentUser } from "../config/devUser.js";

export async function getChats(
  req,
  res,
  next
) {
  try {
    const user =
      await getDevelopmentUser();

    const chats =
      await getAllChats(user._id);

    res.json({
      success: true,
      data: chats,
    });

  } catch (error) {
    next(error);
  }
}

export async function getChat(
  req,
  res,
  next
) {
  try {
    const user =
      await getDevelopmentUser();

    const chat =
      await getChatById(
        req.params.id,
        user._id
      );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    res.json({
      success: true,
      data: chat,
    });

  } catch (error) {
    next(error);
  }
}

export async function createNewChat(
  req,
  res,
  next
) {
  try {
    const user =
      await getDevelopmentUser();

    const chat =
      await createChat(
        user._id,
        req.body.title ||
          "New workspace"
      );

    res.status(201).json({
      success: true,
      data: chat,
    });

  } catch (error) {
    next(error);
  }
}

export async function removeChat(
  req,
  res,
  next
) {
  try {
    const user =
      await getDevelopmentUser();

    const deleted =
      await deleteChat(
        req.params.id,
        user._id
      );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    res.json({
      success: true,
      message: "Chat deleted",
    });

  } catch (error) {
    next(error);
  }
}