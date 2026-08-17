import axios from "axios";
import FormData from "form-data";

const AI_API_URL =
  process.env.AI_API_URL || "http://127.0.0.1:8000";

export async function generatePrompt(message, decomposition = true) {
  const response = await axios.post(
    `${AI_API_URL}/generation/generation`,
    {
      original_query: message
    },
    {
      params: {
        decomposition
      },
      timeout: 120000
    }
  );

  return response.data;
}

export async function uploadToAI(file) {
  const form = new FormData();

  form.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype
  });

  const response = await axios.post(
    `${AI_API_URL}/documents/upload`,
    form,
    {
      headers: {
        ...form.getHeaders()
      },
      timeout: 300000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    }
  );

  return response.data;
}