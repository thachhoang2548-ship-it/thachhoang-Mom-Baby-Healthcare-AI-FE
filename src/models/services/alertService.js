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
};

export default alertService;
