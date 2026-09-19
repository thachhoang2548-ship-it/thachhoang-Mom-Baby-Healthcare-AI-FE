import axiosClient from '../api/axiosClient';

export async function sendFeedback(payload) {
  const response = await axiosClient.post('/api/feedback', payload);
  return response.data?.data || response.data;
}

export async function getFeedbackOptions() {
  const response = await axiosClient.get('/api/feedback/options');
  return response.data?.data || response.data;
}

export default {
  sendFeedback,
  getFeedbackOptions,
};
