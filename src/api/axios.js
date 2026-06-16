import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5265',
  timeout: 15000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor: automatically attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token refresh (401), tier-lock (403), and server downtime (503)
api.interceptors.response.use(
  (response) => {
    if (response && response.data && typeof response.data === 'object') {
      const data = response.data;
      if (data.success !== undefined && data.isSuccess === undefined) {
        data.isSuccess = data.success;
      } else if (data.isSuccess !== undefined && data.success === undefined) {
        data.success = data.isSuccess;
      }
    }
    return response;
  },
  async (error) => {
    if (error.response && error.response.data && typeof error.response.data === 'object') {
      const data = error.response.data;
      if (data.success !== undefined && data.isSuccess === undefined) {
        data.isSuccess = data.success;
      } else if (data.isSuccess !== undefined && data.success === undefined) {
        data.success = data.isSuccess;
      }
    }
    const originalRequest = error.config;

    // Handle Network / 503 errors
    if (!error.response || error.response.status === 503) {
      toast.error('Dịch vụ tạm thời gián đoạn. Vui lòng thử lại sau! 😢', {
        id: 'service-disrupted',
      });
      return Promise.reject(error);
    }

    const status = error.response.status;

    // Handle 403 Forbidden (Tier Lock)
    if (status === 403) {
      // Dispatch global tier locked event to open upgrade modal
      const requiredTier = originalRequest.headers?.['x-required-tier'] || 'MomHienDai';
      window.dispatchEvent(new CustomEvent('TIER_LOCKED', { detail: { requiredTier } }));
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized (Token Refresh)
    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/api/auth/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = useAuthStore.getState().refreshToken;
      if (!storedRefreshToken) {
        useAuthStore.getState().logout();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5265'}/api/auth/refresh`;
        const refreshResponse = await axios.post(url, {
          refreshToken: storedRefreshToken,
        });

        // Backend response format: ApiResponse<AuthResponseDto> { isSuccess, data: { token, refreshToken, user } }
        const resData = refreshResponse.data;
        if (resData && resData.isSuccess && resData.data) {
          const { token, refreshToken, user } = resData.data;
          useAuthStore.getState().setTokens(token, refreshToken, user);
          processQueue(null, token);
          isRefreshing = false;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } else {
          useAuthStore.getState().logout();
          processQueue(new Error('Token refresh response failed'));
          isRefreshing = false;
          return Promise.reject(error);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        processQueue(refreshError);
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
