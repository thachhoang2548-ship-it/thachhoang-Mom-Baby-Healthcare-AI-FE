import React, { useEffect, useState } from "react";
import NotificationFilters from "../components/Notification/NotificationFilters";
import NotificationsList from "../components/Notification/NotificationsList";
import { useAlertController } from "../../controllers/alertController";
import { BellRing, CheckCheck, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const NotificationsPage = () => {
  const { alerts, loading, fetchAlerts, markAllAsResolved } = useAlertController();
  const [filters, setFilters] = useState({ type: "all", status: "" });

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const unreadCount = alerts.filter((a) => a.status !== "resolved").length;

  const filteredAlerts = alerts.filter((a) => {
    if (filters.type === "resolved") return a.status === "resolved";
    if (a.status === "resolved") return false;
    const typeMatch = filters.type === "all" || a.type?.toLowerCase() === filters.type;
    const statusMatch = !filters.status || a.status === filters.status;
    return typeMatch && statusMatch;
  });

  return (
    <div className="font-display max-w-5xl mx-auto space-y-6 pb-10 text-theme-ink">
      <header className="bg-theme-surface rounded-3xl border border-theme-line p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-theme-brand-soft text-theme-ink px-3.5 py-1 text-xs font-bold border border-theme-brand/20">
              <BellRing className="w-3.5 h-3.5 text-theme-brand" aria-hidden="true" />
              <span>Hộp thư nhắc nhở & tư vấn</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-theme-ink">
              Thông báo của mẹ
            </h1>
            <p className="text-sm text-theme-muted font-medium">
              Hiện có{" "}
              <span className="font-bold text-theme-ink">
                {unreadCount} thông báo chưa đọc
              </span>{" "}
              từ lịch thuốc, cảnh báo triệu chứng và đội ngũ chăm sóc.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                fetchAlerts();
                toast.success("Đã cập nhật danh sách thông báo!");
              }}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-theme-line bg-theme-page px-4 py-2.5 text-sm font-bold text-theme-ink hover:border-theme-brand transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
            >
              <RefreshCw className={`w-4 h-4 text-theme-brand ${loading ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true" />
              <span>Làm mới</span>
            </button>

            <button
              type="button"
              onClick={markAllAsResolved}
              disabled={unreadCount === 0}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-theme-brand px-4 sm:px-5 py-2.5 text-sm font-bold text-theme-surface hover:bg-theme-ink transition-colors disabled:bg-theme-line disabled:text-theme-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
            >
              <CheckCheck className="w-4 h-4" aria-hidden="true" />
              <span>Đánh dấu tất cả đã đọc</span>
            </button>
          </div>
        </div>
      </header>

      <NotificationFilters
        filters={filters}
        setFilters={setFilters}
        unreadCount={unreadCount}
      />

      {loading ? (
        <div className="rounded-3xl bg-theme-surface border border-theme-line p-8 text-center text-sm font-semibold text-theme-muted">
          Đang tải thông báo...
        </div>
      ) : (
        <NotificationsList alerts={filteredAlerts} />
      )}
    </div>
  );
};

export default NotificationsPage;
