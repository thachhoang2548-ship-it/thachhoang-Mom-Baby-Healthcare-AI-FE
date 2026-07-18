/**
 * ===================================================================
 * [MODEL] Symptom Service
 * ===================================================================
 * Gọi API liên quan đến phân tích triệu chứng AI.
 * Backend: .NET
 * ===================================================================
 */
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

const mapSymptomLogToUI = (log) => {
  if (!log) return null;

  // Backend lưu toàn bộ kết quả phân tích của Gemini trong possibleConditionsJson.
  // Các trường chi tiết (urgencyReason, recommendations, ...) nằm BÊN TRONG chuỗi JSON này,
  // không phải là thuộc tính top-level của log.
  let ai = {};
  if (log.possibleConditionsJson) {
    try {
      ai = JSON.parse(log.possibleConditionsJson) || {};
    } catch (e) {
      console.warn("Failed to parse possibleConditionsJson", e);
    }
  }

  // AI có thể trả về mảng điều kiện trực tiếp thay vì object bọc ngoài.
  const possibleConditions = Array.isArray(ai)
    ? ai
    : ai.possibleConditions || [];

  // Không có JSON phân tích => AI thất bại, để FE hiển thị thông báo thay vì kết quả giả.
  const aiAvailable = Boolean(log.possibleConditionsJson);

  return {
    ...log,
    _id: log.id,
    aiAvailable,
    analysisResult: {
      urgencyLevel: log.urgencyLevel,
      severityScore: log.severityScore,
      shouldSeeDoctor: log.shouldSeeDoctor ?? ai.shouldSeeDoctor,
      possibleConditions,
      urgencyReason: ai.urgencyReason,
      lifestyleConnection: ai.lifestyleConnection,
      recommendations: ai.recommendations || [],
      dietarySuggestions: ai.dietarySuggestions || [],
      specialistType: ai.specialistType,
      disclaimer: ai.disclaimer
    }
  };
};

const symptomService = {
  submitAnalysis: async (payload) => {
    try {
      const res = await axiosClient.post("/api/symptoms", payload);
      if (res.data && res.data.isSuccess && res.data.data) {
        res.data.data = mapSymptomLogToUI(res.data.data);
      }
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể thực hiện phân tích triệu chứng.";
      toast.error(errMsg);
      throw error;
    }
  },

  fetchHistory: async () => {
    try {
      const res = await axiosClient.get("/api/symptoms");
      if (res.data && res.data.isSuccess && Array.isArray(res.data.data)) {
        res.data.data = res.data.data.map(mapSymptomLogToUI);
      }
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể tải lịch sử phân tích.";
      toast.error(errMsg);
      throw error;
    }
  },

  fetchAnalysisById: async (analysisId) => {
    try {
      const res = await axiosClient.get(`/api/symptoms/${analysisId}`);
      if (res.data && res.data.isSuccess && res.data.data) {
        res.data.data = mapSymptomLogToUI(res.data.data);
      }
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Không thể tải chi tiết phân tích triệu chứng.";
      toast.error(errMsg);
      throw error;
    }
  },
};

export default symptomService;
