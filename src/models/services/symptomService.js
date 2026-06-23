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

  let possibleConditions = [];
  if (log.possibleConditionsJson) {
    try {
      const parsed = JSON.parse(log.possibleConditionsJson);
      possibleConditions = parsed.possibleConditions || parsed;
    } catch (e) {
      console.warn("Failed to parse possibleConditionsJson", e);
    }
  }

  return {
    ...log,
    _id: log.id,
    analysisResult: {
      urgencyLevel: log.urgencyLevel,
      urgencyReason: log.urgencyReason,
      possibleConditions,
      lifestyleConnection: log.lifestyleConnection,
      recommendations: log.recommendations || [],
      dietarySuggestions: log.dietarySuggestions || [],
      shouldSeeDoctor: log.shouldSeeDoctor,
      specialistType: log.specialistType,
      disclaimer: log.disclaimer
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
