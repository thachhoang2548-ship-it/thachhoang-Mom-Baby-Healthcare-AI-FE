/**
 * ===================================================================
 * [CONTROLLER] Profile Controller
 * ===================================================================
 * Quản lý hồ sơ sức khỏe mẹ bầu: lấy profile, cập nhật,
 * thiết lập hành trình thai kỳ, ghi nhận cân nặng.
 * 
 * Zustand Store Hook: useProfileController()
 * ===================================================================
 */
import { create } from 'zustand';
import axiosClient from '../models/api/axiosClient';
import pregnancyService from '../models/services/pregnancyService';

const mapStage = (stageValue) => {
  if (stageValue === 0 || stageValue === 'PrePregnancy') return 'PrePregnancy';
  if (stageValue === 1 || stageValue === 'Pregnant') return 'Pregnant';
  if (stageValue === 2 || stageValue === 'Postpartum') return 'Postpartum';
  return 'PrePregnancy';
};

const calculateTrimester = (week) => {
  if (!week) return null;
  return week <= 12 ? 1 : week <= 27 ? 2 : 3;
};

export const useProfileController = create((set, get) => ({
  // ─── State ───
  momProfile: null,
  journeyStage: 'PrePregnancy',
  pregnancyWeek: null,
  trimester: null,
  isLoading: false,

  // ─── Actions ───

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosClient.get('/api/user-profile');
      const isSuccessful = response.data && (response.data.isSuccess || response.data.success || response.data.Success);
      if (isSuccessful && response.data.data) {
        const profile = response.data.data;
        const stage = mapStage(profile.stage);
        const week = profile.pregnancyWeek || null;
        const trimester = calculateTrimester(week);

        set({
          momProfile: profile,
          journeyStage: stage,
          pregnancyWeek: week,
          trimester,
          isLoading: false,
        });
        return profile;
      }
    } catch (error) {
      console.error('Error fetching health profile:', error);
    } finally {
      set({ isLoading: false });
    }
    return null;
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true });
    try {
      const response = await axiosClient.put('/api/user-profile', profileData);
      const isSuccessful = response.data && (response.data.isSuccess || response.data.success || response.data.Success);
      if (isSuccessful && response.data.data) {
        const profile = response.data.data;
        const stage = mapStage(profile.stage);
        const week = profile.pregnancyWeek || null;
        const trimester = calculateTrimester(week);

        set({
          momProfile: profile,
          journeyStage: stage,
          pregnancyWeek: week,
          trimester,
        });
        return profile;
      }
    } catch (error) {
      console.error('Error updating health profile:', error);
    } finally {
      set({ isLoading: false });
    }
    return null;
  },

  setupPregnancyJourney: async (lastMenstrualPeriod, dueDate = null) => {
    set({ isLoading: true });
    try {
      const res = await pregnancyService.setupPregnancy(lastMenstrualPeriod, dueDate);
      const isSuccessful = res && (res.isSuccess || res.success || res.Success);
      if (isSuccessful && res.data) {
        await get().fetchProfile();
        return res.data;
      }
    } catch (error) {
      console.error('Error setting up pregnancy:', error);
    } finally {
      set({ isLoading: false });
    }
    return null;
  },

  updateWeightLog: async (weightKg) => {
    set({ isLoading: true });
    try {
      const res = await pregnancyService.logWeight(weightKg);
      const isSuccessful = res && (res.isSuccess || res.success || res.Success);
      if (isSuccessful) {
        await get().fetchProfile();
        return res.data;
      }
    } catch (error) {
      console.error('Error logging weight:', error);
    } finally {
      set({ isLoading: false });
    }
    return null;
  },
}));
