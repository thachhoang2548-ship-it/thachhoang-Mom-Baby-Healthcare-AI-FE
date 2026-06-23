/**
 * ===================================================================
 * [MODEL] Daily Monitoring Service
 * ===================================================================
 * Gọi API liên quan đến theo dõi sức khỏe hàng ngày.
 * Backend: .NET
 * ===================================================================
 */
import axiosClient from "../api/axiosClient";

const dailyMonitoringService = {
  createDailyMonitoring: async (data) => {
    try {
      // Đổi sang POST /api/daily-monitoring của .NET
      const response = await axiosClient.post("/api/daily-monitoring", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error creating daily monitoring entry" };
    }
  },

  getDailyMonitoringHistory: async (limit = 30) => {
    try {
      const response = await axiosClient.get(`/api/daily-monitoring/history?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching daily monitoring history" };
    }
  },

  getTodayMonitoring: async () => {
    try {
      const response = await axiosClient.get("/api/daily-monitoring/today");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error fetching today's monitoring" };
    }
  },
};

export default dailyMonitoringService;
