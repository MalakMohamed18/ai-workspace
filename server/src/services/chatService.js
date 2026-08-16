import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

export async function getAllChats(userId) {
  return Chat.find({ userId })
    .sort({ updatedAt: -1 })
    .lean();
}

export async function getChatById(
  chatId,
  userId
) {
  const chat = await Chat.findOne({
    _id: chatId,
    userId,
  }).lean();

  if (!chat) {
    return null;
  }

  const messages = await Message.find({
    chatId: chat._id,
  })
    .sort({ createdAt: 1 })
    .lean();

  return {
    ...chat,
    messages,
  };
}

export async function createChat(
  userId,
  title = "New workspace"
) {
  return Chat.create({
    userId,
    title,
    preview: "Start a new conversation",
  });
}

export async function deleteChat(
  chatId,
  userId
) {
  const chat = await Chat.findOneAndDelete({
    _id: chatId,
    userId,
  });

  if (!chat) {
    return false;
  }

  await Message.deleteMany({
    chatId: chat._id,
  });

  return true;
}