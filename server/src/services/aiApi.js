import "dotenv/config";

const AI_API_URL =
  process.env.AI_API_URL || "http://127.0.0.1:8000";

// ========================================
// Upload Document
// ========================================

export async function uploadDocument(file) {
  const formData = new FormData();

  const blob = new Blob([file.buffer], {
    type: file.mimetype,
  });

  formData.append("file", blob, file.originalname);

  const response = await fetch(
    `${AI_API_URL}/documents/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      raw: text,
    };
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        data?.detail ||
        data?.error ||
        "AI API upload failed"
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

// ========================================
// Generate Prompt
// ========================================

export async function generatePrompt(
  message,
  decomposition = true
) {
  const response = await fetch(
    `${AI_API_URL}/generation/generation`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        original_query: message,
        decomposition,
      }),
    }
  );

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      raw: text,
    };
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        data?.detail ||
        data?.error ||
        "AI API generation failed"
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  // The Medical RAG API returns the generated prompt.
  if (typeof data === "string") {
    return data;
  }

  if (data?.prompt) {
    return data.prompt;
  }

  if (data?.raw) {
    return data.raw;
  }

  return data;
}