/**
 * ===================================================================
 * [MODEL] Lifestyle Service
 * ===================================================================
 * Gọi API liên quan đến nhật ký lối sống & tổng kết.
 * Backend: .NET
 * ===================================================================
 */
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

const lifestyleService = {
  submitLifestyleEntry: async (data) => {
    try {
      const res = await axiosClient.post("/api/lifestyle/entry", data);
      return res.data.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể gửi nhật ký lối sống";
      toast.error(errMsg);
      throw error;
    }
  },

  getTodayEntry: async () => {
    try {
      const res = await axiosClient.get("/api/lifestyle/today");
      return res.data.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể lấy nhật ký hôm nay";
      toast.error(errMsg);
      throw error;
    }
  },

  getHistory: async (days = 30) => {
    try {
      const res = await axiosClient.get(`/api/lifestyle/history?days=${days}`);
      return res.data.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể tải lịch sử";
      toast.error(errMsg);
      throw error;
    }
  },

  getAlerts: async () => {
    try {
      const res = await axiosClient.get("/api/lifestyle/alerts");
      return res.data.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể tải danh sách cảnh báo";
      toast.error(errMsg);
      throw error;
    }
  },

  getSummary: async () => {
    try {
      const res = await axiosClient.get("/api/lifestyle/summary");
      return res.data.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể tải báo cáo tổng kết";
      toast.error(errMsg);
      throw error;
    }
  },
};

export default lifestyleService;
