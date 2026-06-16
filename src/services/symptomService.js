import api from "./api";
import toast from "react-hot-toast";

export const submitAnalysis = async (formData) => {
  try {
    const res = await api.post("/symptoms/analyze", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return res.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || "Không thể thực hiện phân tích triệu chứng.";
    toast.error(errMsg);
    throw error;
  }
};

export const fetchHistory = async () => {
  try {
    const res = await api.get("/symptoms/history");
    return res.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || "Không thể tải lịch sử phân tích.";
    toast.error(errMsg);
    throw error;
  }
};

export const fetchAnalysisById = async (analysisId) => {
  try {
    const res = await api.get(`/symptoms/${analysisId}`);
    return res.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || "Không thể tải chi tiết phân tích triệu chứng.";
    toast.error(errMsg);
    throw error;
  }
};