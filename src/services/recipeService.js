import api from "./api";
import toast from "react-hot-toast";

export const generateRecipes = async (preferences) => {
  try {
    const res = await api.post("/recipes/generate", preferences);
    return res.data; // Unified response is { success, data, message, error }
  } catch (error) {
    const errMsg = error.response?.data?.message || "Không thể tạo thực đơn lúc này.";
    toast.error(errMsg);
    throw error;
  }
};

export const fetchMyRecipes = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        params.append(key, val);
      }
    });
    const res = await api.get(`/recipes/my?${params.toString()}`);
    return res.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || "Không thể tải danh sách thực đơn.";
    toast.error(errMsg);
    throw error;
  }
};

export const toggleSave = async (recipeId) => {
  try {
    const res = await api.patch(`/recipes/${recipeId}/save`);
    return res.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || "Không thể thay đổi trạng thái lưu thực đơn.";
    toast.error(errMsg);
    throw error;
  }
};

export const fetchCurrentProfile = async () => {
  try {
    const res = await api.get("/recipes/profiles/current");
    return res.data;
  } catch (error) {
    // Silent fail if no lifestyle data exists yet, will handle in UI
    throw error;
  }
};
