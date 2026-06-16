import api from './axios';

export const babyApi = {
  createProfile: async (babyProfileData) => {
    const response = await api.post('/api/baby/profile', babyProfileData);
    return response.data;
  },

  getProfiles: async () => {
    const response = await api.get('/api/baby/profiles');
    return response.data;
  },

  logGrowth: async (babyId, weightKg, heightCm) => {
    const response = await api.post(`/api/baby/${babyId}/growth`, {
      weightKg: parseFloat(weightKg),
      heightCm: parseFloat(heightCm)
    });
    return response.data;
  }
};
