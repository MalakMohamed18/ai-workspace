import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,

      index: true,
    },

    title: {
      type: String,

      required: true,

      trim: true,

      maxlength: 100,
    },

    preview: {
      type: String,

      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model(
  "Chat",
  chatSchema
);

export default Chat;