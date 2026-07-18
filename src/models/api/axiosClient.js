/**
 * ===================================================================
 * [MODEL] Axios Client - .NET Backend
 * ===================================================================
 * Cấu hình Axios instance kết nối tới .NET Backend API.
 * 
 * Chức năng:
 *   - Tự động gắn JWT Bearer token vào mỗi request
 *   - Tự động refresh token khi gặp lỗi 401 (Unauthorized)
 *   - Xử lý 503 (Server down) → hiện thông báo lỗi
 *   - Chuẩn hóa response format (isSuccess / success)
 * ===================================================================
 */
import axios from 'axios';
import toast from 'react-hot-toast';

let authStore = null;
export const injectAuthStore = (store) => {
  authStore = store;
};

const getAuthState = () => {
  if (authStore) return authStore.getState();
  return {
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tier');
      window.location.href = '/login';
    },
    setTokens: (token, refreshToken, user) => {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
  };
};

const axiosClient = axios.create({
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

// Request interceptor: tự động gắn JWT Bearer token
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAuthState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: xử lý token refresh (401), server down (503)
axiosClient.interceptors.response.use(
  (response) => {
    // Chuẩn hóa response format
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
    // Chuẩn hóa error response format
    if (error.response && error.response.data && typeof error.response.data === 'object') {
      const data = error.response.data;
      if (data.success !== undefined && data.isSuccess === undefined) {
        data.isSuccess = data.success;
      } else if (data.isSuccess !== undefined && data.success === undefined) {
        data.success = data.isSuccess;
      }
    }
    const originalRequest = error.config;

    // Xử lý lỗi mạng / 503
    if (!error.response || error.response.status === 503) {
      toast.error('Dịch vụ tạm thời gián đoạn. Vui lòng thử lại sau! 😢', {
        id: 'service-disrupted',
      });
      return Promise.reject(error);
    }

    const status = error.response.status;

    // Xử lý 401 Unauthorized (Token Refresh)
    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/api/auth/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = getAuthState().refreshToken;
      if (!storedRefreshToken) {
        getAuthState().logout();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5265'}/api/auth/refresh`;
        const refreshResponse = await axios.post(url, {
          refreshToken: storedRefreshToken,
        });

        const resData = refreshResponse.data;
        if (resData && resData.isSuccess && resData.data) {
          const { token, refreshToken, user } = resData.data;
          getAuthState().setTokens(token, refreshToken, user);
          processQueue(null, token);
          isRefreshing = false;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        } else {
          getAuthState().logout();
          processQueue(new Error('Token refresh response failed'));
          isRefreshing = false;
          return Promise.reject(error);
        }
      } catch (refreshError) {
        getAuthState().logout();
        processQueue(refreshError);
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
