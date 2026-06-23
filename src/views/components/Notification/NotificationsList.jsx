import React from "react";
import NotificationItem from "./NotificationItem";

const NotificationsList = ({ alerts }) => {
  return (
    <div className="flex flex-col gap-4">
      {alerts.length === 0 ? (
        <p className="text-gray-500 dark:text-white/50 text-sm">Không tìm thấy thông báo nào.</p>
      ) : (
        alerts.map(alert => (
          <NotificationItem key={alert._id} alert={alert} />
        ))
      )}
    </div>
  );
};

export default NotificationsList;
