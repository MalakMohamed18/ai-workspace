const AI_API_URL =
  process.env.AI_API_URL ||
  "http://127.0.0.1:8000";

export async function uploadToAI(
  file,
) {
  const formData = new FormData();

  const blob = new Blob(
    [file.buffer],
    {
      type:
        file.mimetype ||
        "application/octet-stream",
    },
  );

  formData.append(
    "file",
    blob,
    file.originalname,
  );

  const response = await fetch(
    `${AI_API_URL}/documents/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const text =
    await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      raw: text,
    };
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        "AI API upload failed.",
    );
  }

  return normalizeDocumentResponse(
    data,
    file,
  );
}

export async function updateAIFile(
  fileId,
  file,
) {
  const formData = new FormData();

  const blob = new Blob(
    [file.buffer],
    {
      type:
        file.mimetype ||
        "application/octet-stream",
    },
  );

  formData.append(
    "file",
    blob,
    file.originalname,
  );

  const response = await fetch(
    `${AI_API_URL}/documents/update/${encodeURIComponent(
      fileId,
    )}`,
    {
      method: "PUT",
      body: formData,
    },
  );

  const text =
    await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      raw: text,
    };
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        "AI API update failed.",
    );
  }

  return normalizeDocumentResponse(
    data,
    file,
    fileId,
  );
}

function normalizeDocumentResponse(
  data,
  originalFile,
  fallbackFileId = null,
) {
  const source =
    data?.data ||
    data?.document ||
    data;

  return {
    file_name:
      source?.file_name ||
      source?.filename ||
      source?.name ||
      originalFile.originalname,

    file_id:
      source?.file_id ||
      source?.id ||
      fallbackFileId,

    file_content_hash:
      source?.file_content_hash ||
      source?.content_hash ||
      null,

    file:
      source?.file ||
      null,

    raw: data,
  };
}