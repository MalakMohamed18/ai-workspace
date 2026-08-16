import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

export async function createMessage(
  chatId,
  userId,
  content
) {
  const chat = await Chat.findOne({
    _id: chatId,
    userId,
  });

  if (!chat) {
    return null;
  }

  const message =
    await Message.create({
      chatId: chat._id,

      role: "user",

      content,
    });

  chat.preview = content;

  chat.updatedAt =
    message.createdAt;

  await chat.save();

  return message;
}

export async function getMessagesByChatId(
  chatId,
  userId
) {
  const chat = await Chat.findOne({
    _id: chatId,
    userId,
  });

  if (!chat) {
    return null;
  }

  return Message.find({
    chatId: chat._id,
  })
    .sort({ createdAt: 1 })
    .lean();
}