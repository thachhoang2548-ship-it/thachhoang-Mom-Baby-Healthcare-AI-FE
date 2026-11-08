import React from "react";

const FILTER_LABELS = {
  all: "Tất cả chưa đọc",
  symptom: "Triệu chứng",
  medication: "Nhắc thuốc",
  resolved: "Đã xử lý",
};

const NotificationFilters = ({ filters, setFilters, unreadCount = 0 }) => {
  const types = ["all", "symptom", "medication", "resolved"];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap" role="tablist" aria-label="Bộ lọc thông báo">
      {types.map((type) => {
        const active = filters.type === type;
        return (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setFilters((prev) => ({ ...prev, type }))}
            className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2 ${
              active
                ? "bg-theme-brand text-theme-surface shadow-sm"
                : "bg-theme-surface text-theme-ink border border-theme-line hover:bg-theme-brand-soft"
            }`}
          >
            <span>{FILTER_LABELS[type]}</span>
            {type === "all" && (
              <span
                className={`inline-flex min-w-[22px] h-[22px] px-1.5 items-center justify-center rounded-full text-xs font-extrabold ${
                  active
                    ? "bg-theme-surface text-theme-ink"
                    : "bg-theme-brand-soft text-theme-ink"
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default NotificationFilters;
