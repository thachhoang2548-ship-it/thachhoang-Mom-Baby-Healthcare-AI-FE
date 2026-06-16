import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLifestyleStore } from "../store/lifestyleStore";
import AlertCard from "../components/alerts/AlertCard";
import { ArrowLeft, Bell, Filter } from "lucide-react";

const AlertsPage = () => {
  const { alerts, fetchTodayData, isLoading } = useLifestyleStore();

  useEffect(() => {
    fetchTodayData();
  }, []);

  // Sort alerts: HIGH -> MEDIUM -> POSITIVE
  const severityOrder = { HIGH: 1, MEDIUM: 2, POSITIVE: 3 };
  const sortedAlerts = [...alerts].sort((a, b) => {
    return (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99);
  });

  if (isLoading && alerts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <header className="flex items-center space-x-4">
        <Link
          to="/dashboard-lifestyle"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Cảnh báo Lối sống Sinh viên
          </h1>
          <p className="text-sm text-gray-500">
            Tất cả các khuyến nghị và huy hiệu tích lũy trong ngày của bạn
          </p>
        </div>
      </header>

      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 border-b pb-2">
          <span>Tổng số: {sortedAlerts.length} phản hồi</span>
          <span className="flex items-center gap-1">
            <Filter className="h-4 w-4" /> Sắp xếp theo mức độ nghiêm trọng
          </span>
        </div>

        {sortedAlerts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-850 border rounded-xl text-gray-400 dark:text-gray-500">
            Không có cảnh báo hoạt động nào. Lối sống của bạn đang ở trạng thái tốt!
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAlerts.map((alert) => (
              <AlertCard key={alert._id || alert.ruleId} alert={alert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
