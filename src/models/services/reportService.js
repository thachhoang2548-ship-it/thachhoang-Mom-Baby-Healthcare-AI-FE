/**
 * [MODEL] Report Service
 * Backend: .NET
 */
import axiosClient from "../api/axiosClient";

const reportService = {
  downloadPdf: async (reportId) => {
    const res = await axiosClient.get(`/api/reports/pdf`, { responseType: "blob" });
    return res.data;
  }
};

export default reportService;
