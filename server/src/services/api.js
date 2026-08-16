const API_URL = "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong"
    );
  }

  return data;
}

export const api = {

  getChats() {
    return request("/chats");
  },

  getChat(id) {
    return request(`/chats/${id}`);
  },

  createChat(title) {
    return request("/chats", {
      method: "POST",

      body: JSON.stringify({
        title,
      }),
    });
  },

  deleteChat(id) {
    return request(`/chats/${id}`, {
      method: "DELETE",
    });
  },

  getMessages(chatId) {
    return request(
      `/messages/${chatId}`
    );
  },

  sendMessage(chatId, content) {
    return request(
      `/messages/${chatId}`,
      {
        method: "POST",

        body: JSON.stringify({
          content,
        }),
      }
    );
  },
};