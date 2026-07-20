import React, { useState } from "react";
import { useAlertController } from "../../../controllers/alertController";
import { Stethoscope, Bell, AlertTriangle, CheckCircle } from "lucide-react";

const severityColors = {
  low: { border: "border-green-500", bg: "bg-green-100", text: "text-green-600", label: "Thấp" },
  medium: { border: "border-yellow-500", bg: "bg-yellow-100", text: "text-yellow-600", label: "Trung bình" },
  high: { border: "border-red-500", bg: "bg-red-100", text: "text-red-600", label: "Cao" },
  50: { border: "border-yellow-500", bg: "bg-yellow-100", text: "text-yellow-600", label: "Trung bình" },
  100: { border: "border-red-500", bg: "bg-red-100", text: "text-red-600", label: "Cao" },
};

const NotificationItem = ({ alert, setAlerts }) => {
  const [expanded, setExpanded] = useState(false);

  const isStaffConsult = alert.message?.includes("TƯ VẤN TỪ CARE STAFF") || alert.message?.includes("BÁC SĨ");

  let sevKey = typeof alert.severity === "string" ? alert.severity.toLowerCase() : alert.severity;
  if (alert.type === "symptom") sevKey = "high";
  if (isStaffConsult) sevKey = "low";

  const sev = severityColors[sevKey] || severityColors.low;

  const markAsResolved = useAlertController((state) => state.markAsResolved);

  const markResolved = async () => {
    try {
      await markAsResolved(alert.id || alert._id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={`group flex flex-col cursor-pointer rounded-xl border-l-4 ${isStaffConsult ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20' : `${sev.border} bg-white dark:bg-gray-800/50`} p-4 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4" onClick={() => setExpanded((prev) => !prev)}>
        <div className="flex flex-grow items-start gap-3 sm:gap-4">
          <div className={`flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-lg ${isStaffConsult ? 'bg-emerald-100 text-emerald-600' : `${sev.bg} ${sev.text}`}`}>
            {isStaffConsult ? (
              <Stethoscope className="w-6 h-6" />
            ) : alert.type === "medication" ? (
              <Bell className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>

          <div className="flex flex-1 flex-col justify-center gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                {isStaffConsult ? "Lời khuyên từ Care Staff 🩺" : `Cảnh báo ${alert.type === "medication" ? "uống thuốc" : "triệu chứng"}`}
              </p>
              <div className={`inline-flex rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isStaffConsult ? 'bg-emerald-100 text-emerald-700' : `${sev.bg} ${sev.text}`}`}>
                {isStaffConsult ? "Tư vấn Y tế" : sev.label}
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line font-medium leading-relaxed">{alert.message}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'Vừa xong'}</p>
          </div>
        </div>

        {alert.status !== "resolved" && (
          <div className="flex sm:shrink-0 pl-[52px] sm:pl-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                markResolved();
              }}
              className="flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white px-3 sm:px-4 text-xs sm:text-sm font-bold transition-colors duration-200"
            >
              <CheckCircle className="w-4 h-4" />
              Đã đọc
            </button>
          </div>
        )}
      </div>

      {expanded && alert.details && (
        <div className="mt-3 pl-[52px] sm:pl-[64px] flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Chi tiết:</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{alert.details}</p>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
