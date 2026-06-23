/**
 * ===================================================================
 * [MODEL] Recipe Service
 * ===================================================================
 * Gọi API liên quan đến tạo & quản lý công thức nấu ăn.
 * Backend: .NET
 * ===================================================================
 */
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

const recipeService = {
  generateRecipes: async (preferences) => {
    try {
      // Gộp các thông số sở thích ăn uống thành chuỗi truy vấn (query) để gửi lên Gemini
      const query = `Chế độ ăn: ${preferences.dietType || "Thường"}, Dị ứng: ${preferences.allergies || "Không"}, Thời gian nấu tối đa: ${preferences.maxCookTime || 30} phút, Nguyên liệu có sẵn: ${preferences.availableIngredients || "Không"}`;

      const res = await axiosClient.post("/api/ai/recipes", { query });
      
      let recipesList = [];
      if (res.data?.success && res.data.data?.recipesJson) {
        try {
          recipesList = JSON.parse(res.data.data.recipesJson);
        } catch (e) {
          console.error("Failed to parse recipesJson", e);
        }
      }

      // Map lại cấu trúc giống Node.js để Controller không bị lỗi
      return {
        success: true,
        data: {
          recipes: recipesList.map(r => ({ ...r, _id: r.id || `recipe-${Date.now()}-${Math.random()}` })),
          profile: null
        }
      };
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể tạo thực đơn lúc này.";
      toast.error(errMsg);
      throw error;
    }
  },

  fetchMyRecipes: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          params.append(key, val);
        }
      });
      const res = await axiosClient.get(`/api/recipes/my?${params.toString()}`);

      // Map kết quả trả về từ .NET để khớp với controller mong đợi (cần trường items)
      if (res.data?.success && res.data.data) {
        const mappedRecipes = (res.data.data.recipes || []).map(r => ({
          ...r,
          _id: r.id
        }));
        res.data.data.items = mappedRecipes;
        res.data.data.recipes = mappedRecipes;
      }
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể tải danh sách thực đơn.";
      toast.error(errMsg);
      throw error;
    }
  },

  toggleSave: async (recipeId) => {
    try {
      const res = await axiosClient.patch(`/api/recipes/${recipeId}/save`);
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể thay đổi trạng thái lưu thực đơn.";
      toast.error(errMsg);
      throw error;
    }
  },

  fetchCurrentProfile: async () => {
    try {
      const res = await axiosClient.get("/api/recipes/profiles/current");
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};

export default recipeService;
