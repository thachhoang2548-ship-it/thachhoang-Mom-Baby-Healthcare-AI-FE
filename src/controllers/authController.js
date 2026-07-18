/**
 * ===================================================================
 * [CONTROLLER] Auth Controller
 * ===================================================================
 * Quản lý toàn bộ logic xác thực: login, register, logout, refresh,
 * tier upgrade, và đồng bộ trạng thái auth với localStorage.
 * 
 * Zustand Store Hook: useAuthController()
 * ===================================================================
 */
import { create } from 'zustand';
import axios from 'axios';
import authService from '../models/services/authService';
import axiosClient, { injectAuthStore } from '../models/api/axiosClient';

const mapTier = (tierValue) => {
  if (tierValue === 1 || tierValue === 'MomHienDai') return 'MomHienDai';
  if (tierValue === 2 || tierValue === 'SuperMomVip') return 'SuperMomVip';
  return 'Free';
};

export const useAuthController = create((set, get) => ({
  // ─── State ───
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  tier: localStorage.getItem('tier') || 'Free',
  isAuthenticated: !!localStorage.getItem('token'),

  // ─── Actions ───

  login: async (email, password) => {
    const res = await authService.login(email, password);
    if (res.isSuccess && res.data) {
      const { token, refreshToken, user } = res.data;
      const tierName = mapTier(user.tier);

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('tier', tierName);

      set({
        token,
        refreshToken,
        user,
        tier: tierName,
        isAuthenticated: true,
      });
    }
    return res;
  },

  register: async (email, password, fullName) => {
    return await authService.register(email, password, fullName);
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout request failed, clearing local state anyway', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tier');

    set({
      token: null,
      refreshToken: null,
      user: null,
      tier: 'Free',
      isAuthenticated: false,
    });
  },

  setTokens: (token, refreshToken, user = null) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);

    const updates = { token, refreshToken, isAuthenticated: true };

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      const tierName = mapTier(user.tier);
      localStorage.setItem('tier', tierName);
      updates.user = user;
      updates.tier = tierName;
    }

    set(updates);
  },

  upgradeTier: async (targetTier) => {
    let tierVal = targetTier;
    if (targetTier === 'MomHienDai') tierVal = 1;
    if (targetTier === 'SuperMomVip') tierVal = 2;

    const response = await axiosClient.post(`/api/user-profile/upgrade?tier=${tierVal}`);
    if (response.data.isSuccess && response.data.data) {
      const userRes = response.data.data;
      const tierName = mapTier(userRes.tier);

      const currentUser = get().user || {};
      const updatedUser = { ...currentUser, id: userRes.id, email: userRes.email, tier: userRes.tier };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('tier', tierName);

      set({
        user: updatedUser,
        tier: tierName,
      });
    }
    return response.data;
  },

  // Tải user hiện tại từ token (thay thế AuthContext.loadUser)
  loadUser: async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const data = await authService.getMe();
        if (data.user) {
          set({ user: data.user });
        }
      } catch (err) {
        localStorage.removeItem("token");
        set({ user: null, isAuthenticated: false });
      }
    }
  },

  // Thực hiện làm mới token âm thầm
  refreshTokenAction: async () => {
    const storedRefreshToken = get().refreshToken;
    if (!storedRefreshToken) {
      await get().logout();
      return null;
    }
    try {
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5265'}/api/auth/refresh`;
      const refreshResponse = await axios.post(url, {
        refreshToken: storedRefreshToken,
      });

      const resData = refreshResponse.data;
      const isSuccessful = resData && (resData.isSuccess || resData.success || resData.Success);
      if (isSuccessful && resData.data) {
        const { token, refreshToken, user } = resData.data;
        get().setTokens(token, refreshToken, user);
        return token;
      }
    } catch (err) {
      console.error('Silent token refresh in authController failed:', err);
    }
    await get().logout();
    return null;
  },
}));

injectAuthStore(useAuthController);
