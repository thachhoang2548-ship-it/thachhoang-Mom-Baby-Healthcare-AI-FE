import api from './axios';

export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data; // Returns ApiResponse<AuthResponseDto>
  },
  
  register: async (email, password, fullName) => {
    const response = await api.post('/api/auth/register', { email, password, fullName });
    return response.data; // Returns ApiResponse<AuthResponseDto>
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },

  refresh: async (refreshToken) => {
    const response = await api.post('/api/auth/refresh', { refreshToken });
    return response.data;
  }
};
