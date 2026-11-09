import React from "react";
import { BellRing, CheckCircle2, XCircle } from "lucide-react";

const NextDoseCard = ({ nextDose, onMarkTaken, onSkip }) => {
  if (!nextDose) return null;

  return (
    <aside
      aria-label="Nhắc liều thuốc tiếp theo"
      className="fixed bottom-24 lg:bottom-6 right-4 sm:right-6 z-30 w-[calc(100vw-2rem)] sm:w-80"
    >
      <div className="rounded-3xl bg-theme-surface border-2 border-theme-brand/30 p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-ink">
            <BellRing className="w-4 h-4 text-theme-brand" aria-hidden="true" />
            <span>Liều tiếp theo sau</span>
          </span>
          <span className="font-mono text-lg font-extrabold text-theme-brand">
            {nextDose.time}
          </span>
        </div>

        <div>
          <p className="text-base font-bold text-theme-ink">
            {nextDose.medName}
          </p>
          <p className="text-xs font-semibold text-theme-muted">
            Liều lượng: {nextDose.dosage}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onMarkTaken}
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-2xl bg-status-ok text-theme-surface text-xs sm:text-sm font-bold hover:bg-status-ok-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>Đã uống</span>
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-2xl bg-status-warn-bg border border-status-warn-line/50 text-status-warn-text text-xs sm:text-sm font-bold hover:bg-status-warn-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
          >
            <XCircle className="w-4 h-4" aria-hidden="true" />
            <span>Bỏ qua</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default NextDoseCard;
