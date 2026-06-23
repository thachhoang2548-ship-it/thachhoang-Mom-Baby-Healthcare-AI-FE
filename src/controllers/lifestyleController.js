/**
 * [CONTROLLER] Lifestyle Controller
 * Quản lý nhật ký lối sống & tổng kết.
 * Zustand Hook: useLifestyleController()
 */
import { create } from "zustand";
import lifestyleService from "../models/services/lifestyleService";
import toast from "react-hot-toast";

export const useLifestyleController = create((set, get) => ({
  todayEntry: null,
  alerts: [],
  history: [],
  summary: {
    healthScore: 70,
    trend: 0,
    radarData: { study: 0, sleep: 0, physical: 0, social: 0, gpa: 0 },
    scoreTrends: []
  },
  isLoading: false,
  error: null,

  submitEntry: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        studyHours: formData.studyHours,
        sleepHours: formData.sleepHours,
        physicalHours: formData.physicalActivityHours ?? formData.physicalHours ?? 1,
        socialHours: formData.socialHours,
        extracurricularHours: formData.extracurricularHours,
        gpa: formData.gpa,
        stressLevel: formData.stressLevel
      };
      const entry = await lifestyleService.submitLifestyleEntry(payload);
      set({
        todayEntry: entry,
        alerts: entry?.alerts || []
      });
      toast.success("Gửi nhật ký lối sống thành công! 🎉");
      await get().fetchTodayData();
      return entry;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTodayData: async () => {
    set({ isLoading: true, error: null });
    try {
      const todayEntry = await lifestyleService.getTodayEntry();
      const summaryData = await lifestyleService.getSummary();

      set({
        todayEntry,
        alerts: todayEntry?.alerts || [],
        summary: summaryData || {
          healthScore: 70,
          trend: 0,
          radarData: { study: 0, sleep: 0, physical: 0, social: 0, gpa: 0 },
          scoreTrends: []
        }
      });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchHistory: async (days = 30) => {
    set({ isLoading: true, error: null });
    try {
      const history = await lifestyleService.getHistory(days);
      set({ history });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
