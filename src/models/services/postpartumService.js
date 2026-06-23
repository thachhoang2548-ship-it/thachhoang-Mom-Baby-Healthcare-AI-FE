/**
 * ===================================================================
 * [MODEL] Postpartum Service
 * ===================================================================
 * Gọi API liên quan đến chăm sóc hậu sản.
 * Backend: .NET
 * ===================================================================
 */
import axiosClient from '../api/axiosClient';

const postpartumService = {
  setupPostpartum: async (deliveryDate, deliveryType = 'natural', isBreastfeeding = true) => {
    const response = await axiosClient.post('/api/postpartum/setup', {
      deliveryDate,
      deliveryType,
      isBreastfeeding
    });
    return response.data;
  },

  submitEpds: async (answers = []) => {
    const response = await axiosClient.post('/api/postpartum/epds', {
      answers: answers.map(Number)
    }, {
      headers: {
        'x-required-tier': 'MomHienDai'
      }
    });
    return response.data;
  },

  logVoiceJournal: async (audioBase64, mimeType = 'audio/webm') => {
    const response = await axiosClient.post('/api/postpartum/epds/voice-journal', {
      audioBase64,
      mimeType
    }, {
      headers: {
        'x-required-tier': 'SuperMomVip'
      }
    });
    return response.data;
  },

  logBreastfeeding: async (side = 'both', durationMinutes = 15, time = new Date().toISOString()) => {
    const response = await axiosClient.post('/api/postpartum/breastfeeding-log', {
      side,
      durationMinutes: parseInt(durationMinutes),
      time
    });
    return response.data;
  },

  getRecoveryPlan: async (day = null) => {
    const response = await axiosClient.get('/api/postpartum/recovery-plan', {
      params: day ? { day: parseInt(day) } : {}
    });
    return response.data;
  }
};

export default postpartumService;
