import React, { useState } from "react";
import ideaIcon from "../../assets/DashboardAssets/alarm.png"; // reusing or using standard png if needed

const LifestyleAlertsCard = ({ alerts, onResolve }) => {
  const [expandedId, setExpandedId] = useState(null);

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "HIGH":
        return {
          bg: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50",
          text: "text-red-800 dark:text-red-200",
          iconColor: "text-red-500",
          icon: "warning",
          badge: "Cảnh báo cao",
          badgeBg: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
        };
      case "MEDIUM":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50",
          text: "text-amber-800 dark:text-amber-200",
          iconColor: "text-amber-500",
          icon: "info",
          badge: "Khuyến nghị",
          badgeBg: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
        };
      case "POSITIVE":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50",
          text: "text-emerald-800 dark:text-emerald-200",
          iconColor: "text-emerald-500",
          icon: "verified",
          badge: "Tích cực",
          badgeBg: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700",
          text: "text-gray-800 dark:text-gray-200",
          iconColor: "text-gray-500",
          icon: "notifications",
          badge: "Thông báo",
          badgeBg: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
        };
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-DEFAULT shadow-soft overflow-hidden transition-all duration-300">
      <div className="p-6 border-b border-border-light flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">insights</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
              Cân bằng Lối sống Sinh viên
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Đánh giá từ 12 quy tắc cân bằng học tập & sức khỏe
            </p>
          </div>
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
          {alerts.length}
        </span>
      </div>

      <div className="p-6 space-y-4 max-h-[450px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <span className="material-symbols-outlined text-5xl mb-2 text-gray-300 dark:text-gray-600">
              check_circle_outline
            </span>
            <p className="font-semibold text-sm">Lối sống của bạn đang ở trạng thái tốt!</p>
            <p className="text-xs text-gray-400 mt-1">Hãy tiếp tục ghi nhận thông số hàng ngày.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);
            const isExpanded = expandedId === alert._id;

            return (
              <div
                key={alert._id}
                className={`border rounded-xl p-4 transition-all duration-300 hover:shadow-sm ${style.bg}`}
              >
                <div
                  className="flex items-start justify-between cursor-pointer gap-3"
                  onClick={() => toggleExpand(alert._id)}
                >
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <span className={`material-symbols-outlined mt-0.5 text-2xl ${style.iconColor} select-none`}>
                      {style.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                          {alert.title}
                        </h3>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${style.badgeBg}`}>
                          {style.badge}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {alert.message}
                      </p>
                    </div>
                  </div>

                  <span className="material-symbols-outlined text-gray-400 select-none transition-transform duration-200">
                    {isExpanded ? "expand_less" : "expand_more"}
                  </span>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-700/50 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">
                        💡 Lời khuyên hành động:
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-black/10 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                        {alert.suggestion}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 pt-1">
                      <span>Cập nhật: {new Date(alert.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(alert.triggeredAt).toLocaleDateString()}</span>
                      {onResolve && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onResolve(alert._id);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white hover:bg-primary-dark transition-all active:scale-95 font-bold shadow-sm"
                        >
                          <span className="material-symbols-outlined text-sm">done</span>
                          Đã hiểu
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LifestyleAlertsCard;
