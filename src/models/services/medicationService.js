/**
 * ===================================================================
 * [MODEL] Medication Service
 * ===================================================================
 * Gọi API liên quan đến lịch uống thuốc.
 * Backend: .NET
 * ===================================================================
 */
import axiosClient from "../api/axiosClient";

const medicationService = {
  // Lấy danh sách thuốc của user
  getMedications: async () => {
    try {
      const res = await axiosClient.get("/api/medications");
      return res.data;
    } catch (err) {
      console.error("Error fetching medications:", err);
      throw err;
    }
  },

  // Thêm lịch uống thuốc mới
  addMedication: async (data) => {
    try {
      const res = await axiosClient.post("/api/medications", data);
      return res.data;
    } catch (err) {
      console.error("Error adding medication:", err);
      throw err;
    }
  },

  // Cập nhật trạng thái tuân thủ
  updateAdherence: async (id, data) => {
    try {
      // Đổi sang phương thức POST và dùng endpoint của .NET
      const res = await axiosClient.post(`/api/medications/${id}/adherence`, data);
      return res.data;
    } catch (err) {
      console.error("Error updating adherence:", err);
      throw err;
    }
  },

  // Xóa lịch uống thuốc
  deleteMedication: async (id) => {
    try {
      const res = await axiosClient.delete(`/api/medications/${id}`);
      return res.data;
    } catch (err) {
      console.error("Error deleting medication:", err);
      throw err;
    }
  },
};

export default medicationService;
