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
  }
};

export default adminService;
