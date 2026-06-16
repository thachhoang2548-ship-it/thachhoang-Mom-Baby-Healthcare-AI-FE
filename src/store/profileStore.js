import { create } from 'zustand';
import api from '../api/axios';
import { pregnancyApi } from '../api/pregnancyApi';

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

export const useProfileStore = create((set, get) => ({
  momProfile: null,
  journeyStage: 'PrePregnancy', // 'PrePregnancy', 'Pregnant', 'Postpartum'
  pregnancyWeek: null,
  trimester: null,
  isLoading: false,

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/api/user-profile');
      if (response.data.isSuccess && response.data.data) {
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
      const response = await api.put('/api/user-profile', profileData);
      if (response.data.isSuccess && response.data.data) {
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
      const res = await pregnancyApi.setupPregnancy(lastMenstrualPeriod, dueDate);
      if (res.isSuccess && res.data) {
        // Refetch profile to synchronize everything
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
      const res = await pregnancyApi.logWeight(weightKg);
      if (res.isSuccess) {
        // Refetch profile to get updated BMI or metadata
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
