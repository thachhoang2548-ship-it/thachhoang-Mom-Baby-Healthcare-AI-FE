/**
 * ===================================================================
 * [MODEL] Chat Service
 * ===================================================================
 * Gọi API liên quan đến tính năng chat AI.
 * Backend: .NET
 * ===================================================================
 */
import axiosClient from "../api/axiosClient";

const chatService = {
  sendMessage: async (text, sessionId) => {
    try {
      const res = await axiosClient.post("/api/chat/send", { text, sessionId });
      return res.data;
    } catch (err) {
      console.error("Error sending message:", err);
      return { reply: "Error connecting to server." };
    }
  },

  getChatHistory: async (sessionId) => {
    try {
      const res = await axiosClient.get(`/api/chat/history?sessionId=${sessionId}`);
      return res.data;
    } catch (err) {
      console.error("Error fetching history:", err);
      return { messages: [] };
    }
  },
};

export default chatService;
