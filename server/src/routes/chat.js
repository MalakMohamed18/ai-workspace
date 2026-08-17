import express from "express";

import { generatePrompt } from "../services/aiApi.js";
import { generateAnswer } from "../services/groq.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message, decomposition = true } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message is required."
      });
    }

    console.log("User message:", message);

    // Step 1:
    // Send question to Medical RAG API
    const prompt = await generatePrompt(
      message,
      decomposition
    );

    console.log("RAG prompt received.");

    // Step 2:
    // Send RAG prompt to Groq
    const answer = await generateAnswer(prompt);

    console.log("Groq answer generated.");

    return res.status(200).json({
      success: true,
      answer
    });

  } catch (error) {
    console.error(
      "Chat error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate answer."
    });
  }
});

export default router;