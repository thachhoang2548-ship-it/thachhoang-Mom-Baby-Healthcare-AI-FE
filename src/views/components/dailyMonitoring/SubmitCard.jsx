import React from "react";
import { Save } from "lucide-react";

export const SubmitCard = ({ loading, onSubmit }) => {
  return (
    <div className="pt-2 flex justify-end">
      <button
        type="button"
        disabled={loading}
        onClick={onSubmit}
        className="w-full sm:w-auto min-h-[52px] inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-base font-bold bg-theme-brand text-theme-surface hover:bg-theme-ink shadow-sm transition-colors disabled:bg-theme-line disabled:text-theme-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
      >
        <Save className="w-5 h-5" aria-hidden="true" />
        <span>{loading ? "Đang lưu nhật ký..." : "Lưu nhật ký hôm nay"}</span>
      </button>
    </div>
  );
};
