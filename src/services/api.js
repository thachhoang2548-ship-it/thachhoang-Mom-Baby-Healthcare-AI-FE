import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_NODE_API_URL 
    ? `${import.meta.env.VITE_NODE_API_URL}/api` 
    : "http://localhost:5000/api",
});

// Add JWT automatically from Zustand auth store or localStorage
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
