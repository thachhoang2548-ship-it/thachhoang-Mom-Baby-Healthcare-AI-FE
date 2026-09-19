import axiosClient from '../api/axiosClient';

export async function getCareCalendar() {
  const response = await axiosClient.get('/api/wellness/care-calendar');
  return response.data?.data || response.data;
}

export async function getEmergencyGuide() {
  const response = await axiosClient.get('/api/wellness/emergency-guide');
  return response.data?.data || response.data;
}

export async function getRelaxTracks() {
  const response = await axiosClient.get('/api/wellness/relax-tracks');
  return response.data?.data || response.data;
}

export default {
  getCareCalendar,
  getEmergencyGuide,
  getRelaxTracks,
};
