/**
 * ===================================================================
 * [MODEL] Pregnancy Service
 * ===================================================================
 * Gọi API liên quan đến theo dõi thai kỳ.
 * Backend: .NET
 * ===================================================================
 */
import axiosClient from '../api/axiosClient';

const pregnancyService = {
  setupPregnancy: async (lastMenstrualPeriod, dueDate = null) => {
    const response = await axiosClient.post('/api/pregnancy/setup', {
      lastMenstrualPeriod,
      dueDate
    });
    return response.data;
  },

  getThisWeek: async () => {
    const response = await axiosClient.get('/api/pregnancy/this-week');
    return response.data;
  },

  logFood: async (foods = []) => {
    const response = await axiosClient.post('/api/pregnancy/food-log', { foods }, {
      headers: {
        'x-required-tier': 'MomHienDai'
      }
    });
    return response.data;
  },

  getMealPlan: async (week = null) => {
    const response = await axiosClient.get('/api/pregnancy/meal-plan', {
      params: week ? { week } : {},
      headers: {
        'x-required-tier': 'MomHienDai'
      }
    });
    return response.data;
  },

  logWeight: async (weightKg, date = new Date().toISOString()) => {
    const response = await axiosClient.post('/api/pregnancy/weight-log', {
      weightKg: parseFloat(weightKg),
      date
    });
    return response.data;
  },

  getExercisePlan: async () => {
    const response = await axiosClient.get('/api/pregnancy/exercise-plan', {
      headers: {
        'x-required-tier': 'MomHienDai'
      }
    });
    return response.data;
  },

  logExercise: async (stepCount, exerciseType = '', durationMinutes = 0) => {
    const response = await axiosClient.post('/api/pregnancy/exercise-log', {
      stepCount: parseInt(stepCount),
      exerciseType,
      durationMinutes: parseInt(durationMinutes)
    });
    return response.data;
  },

  getWeightLogs: async () => {
    const response = await axiosClient.get('/api/pregnancy/weight-logs');
    return response.data;
  },

  getTodaySteps: async () => {
    const response = await axiosClient.get('/api/pregnancy/today-steps');
    return response.data;
  }
};

export default pregnancyService;
