/**
 * [CONTROLLER] Recipe Controller
 * Quản lý công thức nấu ăn.
 * Zustand Hook: useRecipeController()
 */
import { create } from "zustand";
import recipeService from "../models/services/recipeService";
import toast from "react-hot-toast";

export const useRecipeController = create((set, get) => ({
  recipes: [],
  currentProfile: null,
  isGenerating: false,
  isFetching: false,
  error: null,
  preferences: {
    dietType: "Thường",
    allergies: "",
    maxCookTime: 30,
    availableIngredients: []
  },

  setPreferences: (prefs) => {
    set((state) => ({
      preferences: { ...state.preferences, ...prefs }
    }));
  },

  fetchCurrentProfile: async () => {
    try {
      const res = await recipeService.fetchCurrentProfile();
      if (res.success && res.data) {
        set({ currentProfile: res.data });
      }
    } catch (err) {
      console.warn("Could not fetch current profile:", err.message);
    }
  },

  generateRecipes: async (preferences) => {
    set({ isGenerating: true, error: null });
    try {
      const formattedPrefs = {
        ...preferences,
        availableIngredients: Array.isArray(preferences.availableIngredients)
          ? preferences.availableIngredients.join(", ")
          : preferences.availableIngredients
      };
      const res = await recipeService.generateRecipes(formattedPrefs);
      if (res.success && res.data) {
        set({
          recipes: res.data.recipes || [],
          currentProfile: res.data.profile || null
        });
        toast.success("Đã tạo công thức dinh dưỡng mới thành công! 🍳");
        return res.data;
      } else {
        throw new Error(res.message || "Tạo thực đơn thất bại");
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Không thể kết nối máy chủ";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isGenerating: false });
    }
  },

  fetchMyRecipes: async (filters = {}) => {
    set({ isFetching: true, error: null });
    try {
      const res = await recipeService.fetchMyRecipes(filters);
      if (res.success && res.data) {
        set({ recipes: res.data.items || [] });
      }
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ isFetching: false });
    }
  },

  toggleSave: async (recipeId) => {
    try {
      const res = await recipeService.toggleSave(recipeId);
      if (res.success && res.data) {
        const updatedRecipes = get().recipes.map((r) =>
          r._id === recipeId ? { ...r, isSaved: res.data.isSaved } : r
        );
        set({ recipes: updatedRecipes });
        toast.success(res.message || (res.data.isSaved ? "Đã lưu vào sổ tay!" : "Đã bỏ lưu!"));
      }
    } catch (err) {
      console.error(err);
    }
  },
}));
