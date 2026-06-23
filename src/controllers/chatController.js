/**
 * [CONTROLLER] Chat Controller
 * Quản lý trạng thái cuộc hội thoại AI.
 * Zustand Hook: useChatController()
 */
import { create } from "zustand";
import chatService from "../models/services/chatService";

export const useChatController = create((set, get) => ({
  messages: [],
  isLoading: false,
  sessionId: `session-${Date.now()}`,

  setSessionId: (id) => set({ sessionId: id }),

  fetchHistory: async () => {
    const { sessionId } = get();
    set({ isLoading: true });
    try {
      const data = await chatService.getChatHistory(sessionId);
      if (data && data.messages) {
        set({ messages: data.messages });
      }
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (text) => {
    if (!text.trim()) return;
    const { sessionId, messages } = get();

    // Optimistic update for user message
    const userMsg = { sender: "user", text, timestamp: new Date().toISOString() };
    set({ messages: [...messages, userMsg], isLoading: true });

    try {
      const data = await chatService.sendMessage(text, sessionId);
      const replyText = data?.reply || "Error connecting to server.";
      const systemMsg = { sender: "bot", text: replyText, timestamp: new Date().toISOString() };
      set((state) => ({
        messages: [...state.messages, systemMsg],
      }));
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  clearChat: () => set({ messages: [] }),
}));
