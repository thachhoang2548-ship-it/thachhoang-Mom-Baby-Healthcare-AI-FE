import React, { useEffect, useState } from "react";
import NotificationFilters from "../components/Notification/NotificationFilters";
import NotificationsList from "../components/Notification/NotificationsList";
import { useAlertController } from "../../controllers/alertController";
import { CheckCheck, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const NotificationsPage = () => {
  const { alerts, loading, fetchAlerts, markAllAsResolved } = useAlertController();
  const [filters, setFilters] = useState({ type: "all", status: "" });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter((a) => {
    if (filters.type === "resolved") return a.status === "resolved";
    if (a.status === "resolved") return false;
    const typeMatch = filters.type === "all" || a.type?.toLowerCase() === filters.type;
    const statusMatch = !filters.status || a.status === filters.status;
    return typeMatch && statusMatch;
  });

  return (
    <main className="px-4 py-6 sm:px-6 md:py-8 lg:px-8 xl:px-12 w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-6 sm:gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Thông báo
            </p>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Bạn có{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {alerts.filter(a => a.status !== "resolved").length} thông báo mới
              </span>.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => {
                fetchAlerts();
                toast.success("Đã cập nhật danh sách thông báo!");
              }}
              className="flex h-10 sm:h-11 items-center justify-center gap-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 px-4 text-sm font-bold transition-all active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="whitespace-nowrap">Làm mới</span>
            </button>

            <button
              onClick={markAllAsResolved}
              className="w-full sm:w-auto flex h-10 sm:h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 sm:px-6 text-sm font-bold text-white transition-transform active:scale-95 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <CheckCheck className="w-5 h-5" />
              <span className="whitespace-nowrap">Đánh dấu tất cả là đã đọc</span>
            </button>
          </div>
        </div>

        <NotificationFilters filters={filters} setFilters={setFilters} />

        {loading ? (
          <p>Đang tải thông báo...</p>
        ) : (
          <NotificationsList alerts={filteredAlerts} />
        )}
      </div>
    </main>
  );
};

export default NotificationsPage;
