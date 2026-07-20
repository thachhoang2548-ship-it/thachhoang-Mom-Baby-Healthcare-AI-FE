/**
 * ===================================================================
 * [MODEL] Alert Service
 * ===================================================================
 * Gọi API liên quan đến cảnh báo sức khỏe.
 * Backend: .NET
 * ===================================================================
 */
import axiosClient from "../api/axiosClient";

const alertService = {
  fetchAlerts: async () => {
    const res = await axiosClient.get("/api/alerts");
    return res.data;
  },

  resolveAlert: async (alertId) => {
    const res = await axiosClient.patch(`/api/alerts/${alertId}/resolve`);
    return res.data;
  },

  sendConsultationMessage: async (targetUserId, message) => {
    const res = await axiosClient.post("/api/alerts", {
      targetUserId: targetUserId,
      type: 0,
      severity: 10,
      message: message,
      channels: ["app"]
    });
    return res.data;
  }
};

export default alertService;
