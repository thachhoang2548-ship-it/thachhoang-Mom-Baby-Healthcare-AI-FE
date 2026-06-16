import api from './axios';

export const pregnancyApi = {
  setupPregnancy: async (lastMenstrualPeriod, dueDate = null) => {
    const response = await api.post('/api/pregnancy/setup', {
      lastMenstrualPeriod,
      dueDate
    });
    return response.data;
  },

  getThisWeek: async () => {
    const response = await api.get('/api/pregnancy/this-week');
    return response.data;
  },

  logFood: async (foods = []) => {
    const response = await api.post('/api/pregnancy/food-log', { foods }, {
      headers: {
        'x-required-tier': 'MomHienDai'
      }
    });
    return response.data;
  },

  getMealPlan: async (week = null) => {
    const response = await api.get('/api/pregnancy/meal-plan', {
      params: week ? { week } : {},
      headers: {
        'x-required-tier': 'MomHienDai'
      }
    });
    return response.data;
  },

  logWeight: async (weightKg, date = new Date().toISOString()) => {
    const response = await api.post('/api/pregnancy/weight-log', {
      weightKg: parseFloat(weightKg),
      date
    });
    return response.data;
  },

  getExercisePlan: async () => {
    const response = await api.get('/api/pregnancy/exercise-plan', {
      headers: {
        'x-required-tier': 'MomHienDai'
      }
    });
    return response.data;
  },

  logExercise: async (stepCount, exerciseType = '', durationMinutes = 0) => {
    const response = await api.post('/api/pregnancy/exercise-log', {
      stepCount: parseInt(stepCount),
      exerciseType,
      durationMinutes: parseInt(durationMinutes)
    });
    return response.data;
  }
};
