import React from "react";
import { BellOff } from "lucide-react";
import NotificationItem from "./NotificationItem";

const NotificationsList = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <div className="rounded-3xl bg-theme-surface border border-theme-line p-10 text-center space-y-2 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center mx-auto">
          <BellOff className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-base font-bold text-theme-ink">Không có thông báo nào trong mục này</h2>
        <p className="text-xs sm:text-sm text-theme-muted font-medium max-w-md mx-auto">
          Khi có nhắc lịch uống thuốc, cảnh báo sức khỏe hoặc phản hồi từ đội ngũ chăm sóc, thông báo sẽ hiển thị tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {alerts.map((alert) => (
        <NotificationItem key={alert._id || alert.id} alert={alert} />
      ))}
    </div>
  );
};

export default NotificationsList;
