/**
 * ===================================================================
 * [MODEL] Dashboard Service
 * ===================================================================
 * Gọi API lấy dữ liệu tổng quan dashboard.
 * Backend: .NET
 * ===================================================================
 */
import axiosClient from "../api/axiosClient";

const dashboardService = {
  getDashboardData: async () => {
    try {
      const res = await axiosClient.get("/api/dashboard");

      return {
        symptomEntries: res.data.data.recentSymptoms,
        dailyMonitoringEntries: res.data.data.recentDailyMonitoring,
        alerts: res.data.data.alerts,
        medSchedule: res.data.data.medicationSchedule,
        dietPlan: res.data.data.dietPlan,
        summary: {
          severityMetrics: res.data.data.severityMetrics,
          weeklySeverity: res.data.data.weeklySeverity,
          alertCount: res.data.data.alertCount,
          bmi: res.data.data.bmi,
        },
      };
    } catch (err) {
      throw err.response?.data || { message: "Error fetching dashboard data" };
    }
  },
};

export default dashboardService;
