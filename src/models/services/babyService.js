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
    // Map frontend fields to match C# BabyProfile class properties:
    // BabyName (string), DateOfBirth (DateTime), Gender (string), CurrentWeightKg (float?), CurrentHeightCm (float?)
    const backendPayload = {
      babyName: babyProfileData.babyName || babyProfileData.name || '',
      dateOfBirth: babyProfileData.dateOfBirth || babyProfileData.birthDate || new Date().toISOString(),
      gender: typeof babyProfileData.gender === 'number'
        ? babyProfileData.gender
        : ((babyProfileData.gender || '').toString().toLowerCase() === 'male' || babyProfileData.gender === 'boy' || babyProfileData.gender === 0 ? 0 : 1),
      currentWeightKg: babyProfileData.currentWeightKg || babyProfileData.birthWeightKg || null,
      currentHeightCm: babyProfileData.currentHeightCm || babyProfileData.birthHeightCm || null,
      allergies: babyProfileData.allergies || [],
      foodHistory: babyProfileData.foodHistory || [],
      growthRecords: []
    };
    const response = await axiosClient.post('/api/baby/profile', backendPayload);
    return response.data;
  },

  getProfiles: async () => {
    const response = await axiosClient.get('/api/baby/profiles');
    
    // Support both success and isSuccess properties and map backend response back to the format frontend expects
    const isSuccessful = response.data && (response.data.isSuccess || response.data.success || response.data.Success);
    if (isSuccessful && Array.isArray(response.data.data)) {
      response.data.data = response.data.data.map(b => ({
        id: b.id,
        name: b.babyName || '',
        gender: b.gender === 0 || (b.gender || '').toString().toLowerCase() === 'male' ? 0 : 1,
        birthDate: b.dateOfBirth,
        birthWeightKg: b.currentWeightKg || 3.2,
        birthHeightCm: b.currentHeightCm || 50,
        currentWeightKg: b.currentWeightKg || 3.2,
        currentHeightCm: b.currentHeightCm || 50,
        allergies: b.allergies || [],
        foodHistory: b.foodHistory || [],
        growthRecords: b.growthRecords || []
      }));
      
      // Ensure both keys are present and true
      response.data.isSuccess = true;
      response.data.success = true;
    }
    return response.data;
  },

  logGrowth: async (babyId, weightKg, heightCm) => {
    const response = await axiosClient.post(`/api/baby/${babyId}/growth`, {
      weightKg: parseFloat(weightKg),
      heightCm: parseFloat(heightCm)
    });
    return response.data;
  },

  updateProfile: async (babyId, profileData) => {
    const response = await axiosClient.put(`/api/baby/${babyId}`, {
      babyName: profileData.name || profileData.babyName,
      dateOfBirth: profileData.birthDate || profileData.dateOfBirth,
      gender: profileData.gender === 0 || profileData.gender === 'male' || profileData.gender === 'boy' ? 0 : 1,
      currentWeightKg: parseFloat(profileData.currentWeightKg || profileData.birthWeightKg || 3.2),
      currentHeightCm: parseFloat(profileData.currentHeightCm || profileData.birthHeightCm || 50),
      allergies: profileData.allergies || [],
      foodHistory: profileData.foodHistory || []
    });
    return response.data;
  }
};

export default babyService;
