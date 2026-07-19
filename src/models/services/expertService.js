import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

const expertService = {
  // Get all AI recipes pending review by Medical Expert
  getPendingRecipes: async () => {
    try {
      const res = await axiosClient.get("/api/expert/recipes/pending");
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể tải danh sách thực đơn chờ duyệt.";
      toast.error(errMsg);
      throw error;
    }
  },

  // Get ALL recipes grouped by category (Mom/Baby) for the expert dashboard
  getAllRecipes: async () => {
    try {
      const res = await axiosClient.get("/api/expert/recipes/all");
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể tải danh sách thực đơn.";
      toast.error(errMsg);
      throw error;
    }
  },

  // Review (Approve or Reject) a recipe
  reviewRecipe: async (recipeId, isApproved, note = "") => {
    try {
      const res = await axiosClient.patch(`/api/expert/recipes/${recipeId}/review`, {
        isApproved,
        note
      });
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể xử lý duyệt thực đơn.";
      toast.error(errMsg);
      throw error;
    }
  },

  // Get list of Moms assigned for consultation
  getAssignedMoms: async () => {
    try {
      const res = await axiosClient.get("/api/expert/moms");
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể tải danh sách mami tư vấn.";
      toast.error(errMsg);
      throw error;
    }
  },

  // Send consultation message to a specific Mom
  consultMom: async (momId, message) => {
    try {
      const res = await axiosClient.post(`/api/expert/moms/${momId}/consult`, { message });
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể gửi tin nhắn tư vấn.";
      toast.error(errMsg);
      throw error;
    }
  }
};

export default expertService;
