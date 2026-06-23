/**
 * ===================================================================
 * [MODEL] Baby Service
 * ===================================================================
 * Gọi API liên quan đến quản lý hồ sơ bé & theo dõi tăng trưởng.
 * Backend: .NET
 * ===================================================================
 */
import axiosClient from '../api/axiosClient';

const babyService = {
  createProfile: async (babyProfileData) => {
    const response = await axiosClient.post('/api/baby/profile', babyProfileData);
    return response.data;
  },

  getProfiles: async () => {
    const response = await axiosClient.get('/api/baby/profiles');
    return response.data;
  },

  logGrowth: async (babyId, weightKg, heightCm) => {
    const response = await axiosClient.post(`/api/baby/${babyId}/growth`, {
      weightKg: parseFloat(weightKg),
      heightCm: parseFloat(heightCm)
    });
    return response.data;
  }
};

export default babyService;
