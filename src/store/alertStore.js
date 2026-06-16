import { create } from 'zustand';

export const useAlertStore = create((set) => ({
  alerts: [],
  unreadCount: 0,
  signalRConnected: false,

  setSignalRConnected: (connected) => set({ signalRConnected: connected }),

  addAlert: (alert) => {
    // Generate a unique ID if not present
    const newAlert = {
      id: alert.id || alert.ruleId || `alert-${Date.now()}-${Math.random()}`,
      ruleId: alert.ruleId,
      title: alert.title || alert.titleVi || 'Cảnh báo sức khỏe',
      message: alert.message || alert.messageVi || '',
      suggestion: alert.suggestion || alert.suggestionVi || '',
      severity: alert.severity || 'info', // 'info', 'warning', 'critical'
      timestamp: alert.timestamp || new Date().toISOString(),
      read: false,
    };

    set((state) => {
      // Avoid duplicate alerts for the same ruleId in a short time if needed,
      // or simply append to the list.
      const filteredAlerts = state.alerts.filter((a) => a.ruleId !== alert.ruleId);
      const updatedAlerts = [newAlert, ...filteredAlerts];
      
      return {
        alerts: updatedAlerts,
        unreadCount: updatedAlerts.filter((a) => !a.read).length,
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
    set({
      alerts: [],
      unreadCount: 0,
    });
  },
}));
