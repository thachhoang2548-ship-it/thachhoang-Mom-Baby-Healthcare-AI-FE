/**
 * ===================================================================
 * [MODEL] Fertility Service
 * ===================================================================
 * Gọi API liên quan đến theo dõi chu kỳ kinh nguyệt & thụ thai.
 * Backend: .NET
 * ===================================================================
 */
import axiosClient from '../api/axiosClient';

const fertilityService = {
  logCycle: async (periodStartDate, cycleLength = 28, symptoms = []) => {
    const response = await axiosClient.post('/api/fertility/cycle-log', {
      periodStartDate,
      cycleLength: Number(cycleLength),
      symptoms
    });
    return response.data;
  },

  getCalendar: async (month) => {
    // month format: YYYY-MM
    const response = await axiosClient.get('/api/fertility/calendar', {
      params: { month }
    });
    return response.data;
  },

  getOvulationToday: async () => {
    const response = await axiosClient.get('/api/fertility/ovulation-today');
    return response.data;
  },

  createIvfTimeline: async (ivfStartDate, protocol = 'long') => {
    const response = await axiosClient.post('/api/fertility/ivf-timeline', {
      ivfStartDate,
      protocol
    }, {
      headers: {
        'x-required-tier': 'MomHienDai'
      }
    });
    return response.data;
  }
};

export default fertilityService;
