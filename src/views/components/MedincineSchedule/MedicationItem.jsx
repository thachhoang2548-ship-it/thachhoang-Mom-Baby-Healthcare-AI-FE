import React from "react";
import { CheckCircle2, Clock, Pencil, Trash2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import medicationService from "../../../models/services/medicationService";

const STATUS_META = {
  taken: {
    dot: "bg-status-ok",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    label: "Đã uống",
  },
  skipped: {
    dot: "bg-status-warn-line",
    badge: "bg-status-warn-bg text-status-warn-text border-status-warn-line/40",
    label: "Đã bỏ qua",
  },
  pending: {
    dot: "bg-theme-brand",
    badge: "bg-theme-brand-soft text-theme-ink border-theme-brand/25",
    label: "Chờ uống",
  },
  future: {
    dot: "bg-theme-muted",
    badge: "bg-theme-page text-theme-ink border-theme-line",
    label: "Chưa tới giờ",
  },
};

const MedicationItem = ({ med, onUpdate, onDelete }) => {
  const statusKey = med.status || "future";
  const meta = STATUS_META[statusKey] || STATUS_META.future;

  const handleStatus = async (status) => {
    try {
      await medicationService.updateAdherence(med._id, { date: new Date(), status });
      onUpdate(med._id, status);
    } catch (err) {
      console.error("Error updating adherence:", err);
      toast.error("Chưa cập nhật được trạng thái uống thuốc.");
    }
  };

  return (
    <article className="rounded-2xl border border-theme-line bg-theme-page/50 p-4 sm:p-5 transition-colors hover:border-theme-brand/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <span
            className={`w-3 h-3 rounded-full shrink-0 mt-2 ${meta.dot}`}
            aria-hidden="true"
          />
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-theme-ink">{med.medName}</h3>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.badge}`}
              >
                {meta.label}
              </span>
            </div>
            <p className="text-sm text-theme-muted font-medium flex flex-wrap items-center gap-2">
              <span>Liều: {med.dosage}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-theme-ink font-semibold">
                <Clock className="w-3.5 h-3.5 text-theme-brand" aria-hidden="true" />
                {(med.times || []).map((t) => t.slice(0, 5)).join(", ")}
              </span>
            </p>
            {med.notes && (
              <p className="text-xs text-theme-muted font-medium pt-0.5">{med.notes}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={med.status === "taken"}
            onClick={() => handleStatus("taken")}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-bold bg-status-ok text-white hover:bg-emerald-800 disabled:bg-theme-line disabled:text-theme-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>Đã uống</span>
          </button>

          <button
            type="button"
            disabled={med.status === "skipped"}
            onClick={() => handleStatus("skipped")}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-bold bg-status-warn-bg border border-status-warn-line/50 text-status-warn-text hover:bg-amber-100 disabled:bg-theme-line disabled:text-theme-muted disabled:border-theme-line transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
          >
            <XCircle className="w-4 h-4" aria-hidden="true" />
            <span>Bỏ qua</span>
          </button>

          <button
            type="button"
            onClick={() => toast("Tính năng chỉnh sửa lịch thuốc sẽ sớm được cập nhật.")}
            aria-label={`Chỉnh sửa ${med.medName}`}
            className="w-11 h-11 inline-flex items-center justify-center rounded-2xl border border-theme-line bg-theme-surface text-theme-ink hover:bg-theme-brand-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(med._id)}
            aria-label={`Xóa ${med.medName}`}
            className="w-11 h-11 inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default MedicationItem;
