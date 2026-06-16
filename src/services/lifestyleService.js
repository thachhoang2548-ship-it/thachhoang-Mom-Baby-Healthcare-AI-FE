import api from "./api";
import toast from "react-hot-toast";

export const submitLifestyleEntry = async (data) => {
  try {
    const res = await api.post("/lifestyle/entry", data);
    return res.data.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || "Không thể gửi nhật ký lối sống";
    toast.error(errMsg);
    throw error;
  }
};

export const getTodayEntry = async () => {
  try {
    const res = await api.get("/lifestyle/today");
    return res.data.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || "Không thể lấy nhật ký hôm nay";
    toast.error(errMsg);
    throw error;
  }
};

export const getHistory = async (days = 30) => {
  try {
    const res = await api.get(`/lifestyle/history?days=${days}`);
    return res.data.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || "Không thể tải lịch sử";
    toast.error(errMsg);
    throw error;
  }
};

export const getAlerts = async () => {
  try {
    const res = await api.get("/lifestyle/alerts");
    return res.data.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || "Không thể tải danh sách cảnh báo";
    toast.error(errMsg);
    throw error;
  }
};

export const getSummary = async () => {
  try {
    const res = await api.get("/lifestyle/summary");
    return res.data.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || "Không thể tải báo cáo tổng kết";
    toast.error(errMsg);
    throw error;
  }
};
