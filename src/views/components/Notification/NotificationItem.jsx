import React, { useState } from "react";
import { useAlertController } from "../../../controllers/alertController";
import { Stethoscope, Bell, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

const severityStyles = {
  low: {
    accent: "border-l-status-ok",
    iconBox: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    badge: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    label: "Mức thấp",
  },
  medium: {
    accent: "border-l-status-warn-line",
    iconBox: "bg-status-warn-bg text-status-warn-text border border-status-warn-line/40",
    badge: "bg-status-warn-bg text-status-warn-text border border-status-warn-line/40",
    label: "Trung bình",
  },
  high: {
    accent: "border-l-red-600",
    iconBox: "bg-red-50 text-red-800 border border-red-200",
    badge: "bg-red-50 text-red-800 border border-red-200",
    label: "Ưu tiên cao",
  },
};

severityStyles[50] = severityStyles.medium;
severityStyles[100] = severityStyles.high;

const NotificationItem = ({ alert }) => {
  const [expanded, setExpanded] = useState(false);

  const isStaffConsult =
    alert.message?.includes("TƯ VẤN TỪ CARE STAFF") || alert.message?.includes("BÁC SĨ");

  let sevKey = typeof alert.severity === "string" ? alert.severity.toLowerCase() : alert.severity;
  if (alert.type === "symptom") sevKey = "high";
  if (isStaffConsult) sevKey = "low";

  const sev = severityStyles[sevKey] || severityStyles.low;
  const markAsResolved = useAlertController((state) => state.markAsResolved);

  const markResolved = async () => {
    try {
      await markAsResolved(alert.id || alert._id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <article
      className={`flex flex-col rounded-3xl border border-theme-line border-l-4 ${
        isStaffConsult ? "border-l-status-ok bg-emerald-50/30" : `${sev.accent} bg-theme-surface`
      } p-4 sm:p-5 shadow-sm transition-colors`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex flex-1 items-start gap-3.5 min-w-0">
          <div
            className={`flex w-11 h-11 shrink-0 items-center justify-center rounded-2xl ${
              isStaffConsult
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : sev.iconBox
            }`}
          >
            {isStaffConsult ? (
              <Stethoscope className="w-5 h-5" aria-hidden="true" />
            ) : alert.type === "medication" ? (
              <Bell className="w-5 h-5" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-theme-ink">
                {isStaffConsult
                  ? "Lời khuyên từ Care Staff"
                  : `Cảnh báo ${alert.type === "medication" ? "uống thuốc" : "triệu chứng"}`}
              </h3>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  isStaffConsult
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : sev.badge
                }`}
              >
                {isStaffConsult ? "Tư vấn y tế" : sev.label}
              </span>
            </div>

            <p className="text-sm text-theme-ink whitespace-pre-line font-medium leading-relaxed">
              {alert.message}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-0.5">
              <p className="text-xs text-theme-muted font-medium">
                {alert.createdAt ? new Date(alert.createdAt).toLocaleString("vi-VN") : "Vừa xong"}
              </p>

              {alert.details && (
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => !prev)}
                  aria-expanded={expanded}
                  className="inline-flex items-center gap-1 text-xs font-bold text-theme-brand hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand rounded-md px-1.5 py-0.5"
                >
                  <span>{expanded ? "Thu gọn chi tiết" : "Xem chi tiết"}</span>
                  {expanded ? (
                    <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {alert.status !== "resolved" && (
          <div className="flex sm:shrink-0 pl-14 sm:pl-0">
            <button
              type="button"
              onClick={markResolved}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl bg-theme-brand-soft border border-theme-brand/25 text-theme-ink hover:bg-theme-brand hover:text-theme-surface px-4 py-2 text-xs sm:text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
            >
              <CheckCircle className="w-4 h-4" aria-hidden="true" />
              <span>Đã đọc</span>
            </button>
          </div>
        )}
      </div>

      {expanded && alert.details && (
        <div className="mt-3.5 ml-0 sm:ml-14 rounded-2xl bg-theme-page border border-theme-line p-4 space-y-1">
          <p className="text-xs font-bold text-theme-ink">Chi tiết bổ sung</p>
          <p className="text-sm text-theme-muted leading-relaxed">{alert.details}</p>
        </div>
      )}
    </article>
  );
};

export default NotificationItem;
