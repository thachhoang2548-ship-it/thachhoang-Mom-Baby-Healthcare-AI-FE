import api from "./api";

export const getDashboardData = async () => {
  try {
    const res = await api.get("/dashboard");

    return {
      symptomEntries: res.data.recentSymptoms,
      dailyMonitoringEntries: res.data.recentDailyMonitoring,
      alerts: res.data.alerts,
      medSchedule: res.data.medicationSchedule,
      dietPlan: res.data.dietPlan,
      summary: {
        severityMetrics: res.data.severityMetrics,
        weeklySeverity: res.data.weeklySeverity,
        alertCount: res.data.alertCount,
        bmi: res.data.bmi,
      },
    };
  } catch (err) {
    throw err.response?.data || { message: "Error fetching dashboard data" };
  }
};
