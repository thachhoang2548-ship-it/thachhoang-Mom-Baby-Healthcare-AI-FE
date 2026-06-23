/**
 * [CONTROLLER] Symptom Controller
 * Quản lý phân tích triệu chứng AI.
 * Zustand Hook: useSymptomController()
 */
import { create } from "zustand";
import symptomService from "../models/services/symptomService";
import toast from "react-hot-toast";

export const useSymptomController = create((set, get) => ({
  currentAnalysis: null,
  history: [],
  isAnalyzing: false,
  uploadedImage: null,
  textDescription: "",
  error: null,

  setTextDescription: (text) => set({ textDescription: text }),

  setUploadedImage: (file) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      set({ uploadedImage: { file, previewUrl } });
    } else {
      set({ uploadedImage: null });
    }
  },

  removeImage: () => {
    const { uploadedImage } = get();
    if (uploadedImage?.previewUrl) {
      URL.revokeObjectURL(uploadedImage.previewUrl);
    }
    set({ uploadedImage: null });
  },

  clearCurrent: () => {
    set({ currentAnalysis: null, textDescription: "", error: null });
    get().removeImage();
  },

  submitAnalysis: async () => {
    const { textDescription, uploadedImage } = get();

    if (!textDescription || textDescription.trim().length < 10) {
      toast.error("Vui lòng nhập mô tả triệu chứng chi tiết (tối thiểu 10 ký tự).");
      return;
    }

    set({ isAnalyzing: true, error: null });

    try {
      let imageUrl = null;
      let imageMimeType = null;

      if (uploadedImage?.file) {
        imageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(uploadedImage.file);
        });
        imageMimeType = uploadedImage.file.type;
      }

      const payload = {
        textDescription: textDescription.trim(),
        imageUrl,
        imageMimeType
      };

      const timeoutId = setTimeout(() => {
        toast("Phân tích mất nhiều thời gian hơn bình thường, xin vui lòng kiên nhẫn...", {
          icon: "🤖",
          duration: 6000
        });
      }, 8000);

      const res = await symptomService.submitAnalysis(payload);
      clearTimeout(timeoutId);

      if (res.success && res.data) {
        const analysisDoc = res.data.analysis || res.data;
        set({ currentAnalysis: analysisDoc });
        toast.success("Phân tích triệu chứng hoàn tất! 🔬");
        get().fetchHistory();
        return res.data;
      } else {
        throw new Error(res.message || "Không thể thực hiện phân tích");
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Lỗi hệ thống khi phân tích triệu chứng.";
      set({ error: errMsg });
      throw err;
    } finally {
      set({ isAnalyzing: false });
    }
  },

  fetchHistory: async () => {
    try {
      const res = await symptomService.fetchHistory();
      if (res.success && res.data) {
        set({ history: res.data });
      }
    } catch (err) {
      console.error("Error fetching history:", err.message);
    }
  },

  fetchAnalysisById: async (analysisId) => {
    try {
      const res = await symptomService.fetchAnalysisById(analysisId);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
}));
