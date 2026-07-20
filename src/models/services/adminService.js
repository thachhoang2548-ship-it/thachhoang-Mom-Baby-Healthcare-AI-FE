import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

const adminService = {
  // Get all users with roles and lock status
  getAllUsers: async () => {
    try {
      const res = await axiosClient.get("/api/admin/users");
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể tải danh sách người dùng.";
      toast.error(errMsg);
      throw error;
    }
  },

  // Create a new Staff or Expert account
  createStaffOrExpert: async (userDto) => {
    try {
      const res = await axiosClient.post("/api/admin/users/create", userDto);
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể tạo tài khoản nhân viên/chuyên gia.";
      toast.error(errMsg);
      throw error;
    }
  },

  // Lock user account
  lockUser: async (userId) => {
    try {
      const res = await axiosClient.patch(`/api/admin/users/${userId}/lock`);
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể khóa tài khoản.";
      toast.error(errMsg);
      throw error;
    }
  },

  // Unlock user account
  unlockUser: async (userId) => {
    try {
      const res = await axiosClient.patch(`/api/admin/users/${userId}/unlock`);
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể mở khóa tài khoản.";
      toast.error(errMsg);
      throw error;
    }
  },

  // Get business rules
  getBusinessRules: async () => {
    try {
      const res = await axiosClient.get("/api/admin/rules");
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể tải danh sách quy tắc.";
      toast.error(errMsg);
      throw error;
    }
  },

  // Update business rule
  updateBusinessRule: async (id, ruleDto) => {
    try {
      const res = await axiosClient.put(`/api/admin/rules/${id}`, ruleDto);
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể cập nhật quy tắc.";
      toast.error(errMsg);
      throw error;
    }
  },

  // Create business rule
  createBusinessRule: async (ruleDto) => {
    try {
      const res = await axiosClient.post("/api/admin/rules", ruleDto);
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể tạo quy tắc mới.";
      toast.error(errMsg);
      throw error;
    }
  },

  // Delete business rule
  deleteBusinessRule: async (id) => {
    try {
      const res = await axiosClient.delete(`/api/admin/rules/${id}`);
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể xóa quy tắc.";
      toast.error(errMsg);
      throw error;
    }
  },

  // Get high-risk users
  getUsersAtRisk: async () => {
    try {
      const res = await axiosClient.get("/api/admin/users/risk");
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể tải danh sách mami nguy cơ cao.";
      toast.error(errMsg);
      throw error;
    }
  },

  // Get aggregate report summary
  getReportsSummary: async () => {
    try {
      const res = await axiosClient.get("/api/admin/reports/summary");
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể tải báo cáo hệ thống.";
      toast.error(errMsg);
      throw error;
    }
  },

  // Sync USDA nutrition data
  syncUsdaData: async (query, maxItems = 10) => {
    try {
      const res = await axiosClient.post("/api/admin/usda/sync", { query, maxItems });
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể đồng bộ dữ liệu USDA.";
      toast.error(errMsg);
      throw error;
    }
  }
};

export default adminService;
