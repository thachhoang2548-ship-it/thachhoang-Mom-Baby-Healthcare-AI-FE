/**
 * ===================================================================
 * [CONTROLLER] Alert Controller
 * ===================================================================
 * Quản lý cảnh báo sức khỏe real-time (SignalR) và notification.
 * Gộp từ alertStore + NotificationContext.
 * 
 * Zustand Store Hook: useAlertController()
 * ===================================================================
 */
import { create } from 'zustand';
import axiosClient from '../models/api/axiosClient';
import toast from 'react-hot-toast';

export const useAlertController = create((set) => ({
  // ─── State ───
  alerts: [],
  unreadCount: 0,
  signalRConnected: false,
  loading: true,

  // ─── Actions ───

  setSignalRConnected: (connected) => set({ signalRConnected: connected }),

  addAlert: (alert) => {
    const newAlert = {
      id: alert.id || alert.ruleId || `alert-${Date.now()}-${Math.random()}`,
      _id: alert.id || alert.ruleId || `alert-${Date.now()}-${Math.random()}`,
      ruleId: alert.ruleId,
      title: alert.title || alert.titleVi || 'Cảnh báo sức khỏe',
      message: alert.message || alert.messageVi || '',
      suggestion: alert.suggestion || alert.suggestionVi || '',
      severity: alert.severity || 'info',
      timestamp: alert.timestamp || new Date().toISOString(),
      read: false,
      status: alert.status === 2 || alert.status === 'resolved' ? 'resolved' : 'pending'
    };

    set((state) => {
      const filteredAlerts = state.alerts.filter((a) => a.ruleId !== alert.ruleId);
      const updatedAlerts = [newAlert, ...filteredAlerts];

      return {
        alerts: updatedAlerts,
        unreadCount: updatedAlerts.filter((a) => a.status !== 'resolved').length,
      };
    });
  },

  markRead: (alertId) => {
    set((state) => {
      const updatedAlerts = state.alerts.map((a) =>
        a.id === alertId || a.ruleId === alertId ? { ...a, read: true } : a
      );
      return {
        alerts: updatedAlerts,
        unreadCount: updatedAlerts.filter((a) => !a.read).length,
      };
    });
  },

  clearAll: () => {
    set({ alerts: [], unreadCount: 0 });
  },

  // Lấy cảnh báo từ server (thay thế NotificationContext)
  fetchAlerts: async () => {
    try {
      const res = await axiosClient.get("/api/alerts");
      const rawAlerts = res.data?.data || [];
      const alerts = rawAlerts.map(a => ({
        ...a,
        _id: a.id,
        status: a.status === 2 ? "resolved" : "pending"
      }));
      set({
        alerts,
        unreadCount: alerts.filter((a) => a.status !== "resolved").length,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch alerts", err);
      set({ loading: false });
    }
  },

  markAsResolved: async (id) => {
    try {
      // Gọi PATCH lên .NET và truyền status 2 (Resolved)
      await axiosClient.patch(`/api/alerts/${id}/status`, { status: 2 });
      set((state) => {
        const updatedAlerts = state.alerts.map((a) =>
          a._id === id ? { ...a, status: "resolved" } : a
        );
        return {
          alerts: updatedAlerts,
          unreadCount: updatedAlerts.filter((a) => a.status !== "resolved").length,
        };
      });
      toast.success("Đã xử lý cảnh báo");
    } catch (err) {
      console.error(err);
      toast.error("Không thể xử lý cảnh báo");
    }
  },

  markAllAsResolved: async () => {
    try {
      const state = useAlertController.getState();
      const pending = state.alerts.filter((a) => a.status !== "resolved");
      await Promise.all(
        pending.map((a) => axiosClient.patch(`/api/alerts/${a._id}/status`, { status: 2 }))
      );
      set((state) => ({
        alerts: state.alerts.map((a) => ({ ...a, status: "resolved" })),
        unreadCount: 0,
      }));
      toast.success("Đã xử lý tất cả cảnh báo");
    } catch (err) {
      console.error(err);
      toast.error("Không thể xử lý tất cả cảnh báo");
    }
  },
}));
