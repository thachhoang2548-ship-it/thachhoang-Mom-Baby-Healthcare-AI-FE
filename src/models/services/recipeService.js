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

// Backend trả macro dạng SỐ (protein: 12) còn UI cần chuỗi có đơn vị ("12g").
// Nếu đã là chuỗi thì giữ nguyên (luồng tạo mới từ AI trả sẵn "12g").
const withUnit = (value, unit) => {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'string') return value;
  return `${value}${unit}`;
};

const DIFFICULTY_VI = { Easy: 'Dễ', Medium: 'Trung bình', Hard: 'Khó' };

// IngredientsJson / StepsJson từ backend là chuỗi JSON; parse an toàn, lỗi thì trả mảng rỗng.
const parseJsonList = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

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

      // Map cấu trúc AI trả về ({recipe, calories, ingredients, steps}) sang đúng
      // shape mà RecipeCard/RecipePage sử dụng ({title, nutritionInfo, ...}).
      return {
        success: true,
        message: res.data?.message,
        data: {
          recipes: recipesList.map(r => ({
            ...r,
            _id: r.id || `recipe-${Date.now()}-${Math.random()}`,
            title: r.title || r.recipe || "Món ăn AI",
            description: r.description ||
              (Array.isArray(r.ingredients) ? `Nguyên liệu: ${r.ingredients.map(i => (typeof i === "string" ? i : i.name)).join(", ")}` : ""),
            nutritionInfo: r.nutritionInfo || {
              calories: r.calories || 0,
              protein: r.protein || '',
              carbs: r.carbs || '',
              fat: r.fat || '',
              prepTime: r.prepTime || '',
              difficulty: r.difficulty || 'Dễ'
            },
            tags: r.tags || ["AI gợi ý", "Chờ chuyên gia duyệt"],
            // Modal chi tiết cần object; AI trả mảng chuỗi nên chuyển đổi tại đây.
            ingredients: (r.ingredients || []).map(i =>
              typeof i === "string" ? { name: i, amount: "", unit: "" } : i),
            steps: (r.steps || []).map((s, idx) =>
              typeof s === "string" ? { stepNumber: idx + 1, instruction: s, duration: "" } : s),
            isSaved: false,
            isApproved: r.isApproved || (r.status === 1 || r.Status === 1) || false,
            status: r.status ?? r.Status ?? 0
          })),
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
          _id: r.id,
          isApproved: r.isApproved ?? (r.status === 1 || r.Status === 1) ?? false,
          status: r.status ?? r.Status ?? 0,
          // Backend lưu dinh dưỡng ở các cột phẳng; RecipeCard/RecipeDetailModal đọc
          // nutritionInfo.{calories,protein,carbs,fat} nên phải gom lại ở đây.
          nutritionInfo: r.nutritionInfo || {
            calories: r.calories || 0,
            protein: withUnit(r.protein, 'g'),
            carbs: withUnit(r.carbs, 'g'),
            fat: withUnit(r.fat, 'g'),
            prepTime: r.prepTimeMinutes ? `${r.prepTimeMinutes} phút` : '',
            difficulty: DIFFICULTY_VI[r.difficulty] || r.difficulty || 'Dễ'
          },
          // IngredientsJson/StepsJson là chuỗi JSON mảng chuỗi -> đổi sang object cho modal
          ingredients: parseJsonList(r.ingredientsJson).map(i =>
            typeof i === 'string' ? { name: i, amount: '', unit: '' } : i),
          steps: parseJsonList(r.stepsJson).map((s, idx) =>
            typeof s === 'string' ? { stepNumber: idx + 1, instruction: s, duration: '' } : s)
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
    const res = await axiosClient.get("/api/recipes/profiles/current");
    return res.data;
  },
};

export default recipeService;
