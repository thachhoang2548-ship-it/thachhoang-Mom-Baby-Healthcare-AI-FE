/**
 * ===================================================================
 * [MODEL] Auth Service
 * ===================================================================
 * Gọi API liên quan đến xác thực người dùng.
 * Backend: .NET
 * ===================================================================
 */
import axiosClient from '../api/axiosClient';

const authService = {
  // ─── .NET Backend APIs ───

  login: async (email, password) => {
    const response = await axiosClient.post('/api/auth/login', { email, password });
    return response.data; // Returns ApiResponse<AuthResponseDto>
  },

  register: async (email, password, fullName) => {
    const response = await axiosClient.post('/api/auth/register', { email, password, fullName });
    return response.data; // Returns ApiResponse<AuthResponseDto>
  },

  logout: async () => {
    const response = await axiosClient.post('/api/auth/logout');
    return response.data;
  },

  refresh: async (refreshToken) => {
    const response = await axiosClient.post('/api/auth/refresh', { refreshToken });
    return response.data;
  },
};

export default authService;
