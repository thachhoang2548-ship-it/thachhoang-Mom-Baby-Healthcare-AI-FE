import { create } from 'zustand';
import { authApi } from '../api/authApi';
import api from '../api/axios';

const mapTier = (tierValue) => {
  if (tierValue === 1 || tierValue === 'MomHienDai') return 'MomHienDai';
  if (tierValue === 2 || tierValue === 'SuperMomVip') return 'SuperMomVip';
  return 'Free';
};

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  tier: localStorage.getItem('tier') || 'Free', // 'Free', 'MomHienDai', 'SuperMomVip'
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (email, password) => {
    const res = await authApi.login(email, password);
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
    return await authApi.register(email, password, fullName);
  },

  logout: async () => {
    try {
      await authApi.logout();
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

    const response = await api.post(`/api/user-profile/upgrade?tier=${tierVal}`);
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
}));
