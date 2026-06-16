import { create } from 'zustand';
import { babyApi } from '../api/babyApi';

export const useBabyStore = create((set, get) => ({
  babyProfiles: [],
  currentBaby: null,
  isLoading: false,

  fetchBabyProfiles: async () => {
    set({ isLoading: true });
    try {
      const res = await babyApi.getProfiles();
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
      const res = await babyApi.createProfile(profile);
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
