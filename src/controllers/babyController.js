/**
 * [CONTROLLER] Baby Controller
 * Quản lý hồ sơ bé & tăng trưởng.
 * Zustand Hook: useBabyController()
 */
import { create } from 'zustand';
import babyService from '../models/services/babyService';

export const useBabyController = create((set, get) => ({
  babyProfiles: [],
  currentBaby: null,
  isLoading: false,

  fetchBabyProfiles: async () => {
    set({ isLoading: true });
    try {
      const res = await babyService.getProfiles();
      if (res.isSuccess && res.data) {
        set({
          babyProfiles: res.data,
          currentBaby: res.data[0] || null,
        });
      }
    } catch (error) {
      console.error('Error fetching baby profiles:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createBabyProfile: async (profile) => {
    set({ isLoading: true });
    try {
      const res = await babyService.createProfile(profile);
      if (res.isSuccess && res.data) {
        await get().fetchBabyProfiles();
        return res.data;
      }
    } catch (error) {
      console.error('Error creating baby profile:', error);
    } finally {
      set({ isLoading: false });
    }
    return null;
  },
}));
