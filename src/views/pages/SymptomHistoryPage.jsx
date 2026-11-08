import React, { useEffect, useState } from "react";
import { useSymptomController } from "../../controllers/symptomController";
import { Link } from "react-router-dom";
import { ChevronLeft, Calendar, FileImage, FolderOpen } from "lucide-react";
import DoctorConsultationCard from "../components/Symptom/DoctorConsultationCard";

const ASSET_BASE_URL =
  import.meta.env.VITE_NODE_API_URL || "https://momoi-api-production.up.railway.app";

const URGENCY_LABELS = {
  Low: "Thấp",
  Medium: "Trung bình",
  High: "Cao",
  Critical: "Khẩn cấp",
};

function formatDateRelative(dateStr, nowMs) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const diffMs = nowMs - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getUrgencyBadge(urgency) {
  const label = URGENCY_LABELS[urgency] || urgency;
  switch (label) {
    case "Khẩn cấp":
      return { label, cls: "border-red-300 bg-red-50 text-red-900" };
    case "Cao":
      return { label, cls: "border-red-200 bg-red-50/75 text-red-800" };
    case "Trung bình":
      return { label, cls: "border-status-warn-line bg-status-warn-bg text-status-warn-text" };
    case "Thấp":
    default:
      return { label, cls: "border-status-ok/35 bg-status-ok/15 text-status-ok" };
  }
}

export default function SymptomHistoryPage() {
  const { history, fetchHistory } = useSymptomController();
  const [now] = useState(() => Date.now());

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    return `${ASSET_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-8 font-display text-theme-ink">
      {/* Header */}
      <header className="space-y-3 border-b border-theme-line pb-5">
        <Link
          to="/symptoms"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-theme-muted transition-colors hover:bg-theme-surface hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Quay lại kiểm tra triệu chứng</span>
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-theme-ink sm:text-3xl">
            Lịch sử kiểm tra triệu chứng
          </h1>
          <span className="rounded-full border border-theme-line bg-theme-surface px-3.5 py-1 text-xs font-bold text-theme-ink">
            Tổng số: {history.length} bản ghi
          </span>
        </div>
      </header>

      {/* Doctor Advisory Banner */}
      <DoctorConsultationCard variant="banner" />

      {/* History List */}
      {history.length === 0 ? (
        <div className="space-y-4 rounded-3xl border border-theme-line bg-theme-surface p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-theme-brand-soft text-theme-brand">
            <FolderOpen className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-theme-ink">Chưa có lịch sử kiểm tra</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-theme-muted">
              Các lần mẹ mô tả triệu chứng sẽ được lưu lại tại đây để tiện theo dõi diễn biến và trao đổi khi đi khám.
            </p>
          </div>
          <Link
            to="/symptoms"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-theme-brand px-6 py-2.5 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink"
          >
            Kiểm tra triệu chứng ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {history.map((item) => {
            const result = item.analysisResult;
            const hasImage = Boolean(item.imageUrl);
            const urgency = result?.urgencyLevel ? getUrgencyBadge(result.urgencyLevel) : null;

            return (
              <article
                key={item._id}
                className="flex flex-col justify-between gap-4 rounded-3xl border border-theme-line bg-theme-surface p-5 shadow-sm md:flex-row md:items-center"
              >
                <div className="flex flex-1 items-start gap-4 overflow-hidden">
                  {hasImage ? (
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-theme-line bg-theme-page">
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt="Ảnh triệu chứng"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-theme-line bg-theme-page text-theme-brand">
                      <FileImage className="h-6 w-6" />
                    </div>
                  )}

                  <div className="space-y-1.5 overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-theme-muted">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDateRelative(item.createdAt, now)}
                      </span>
                      {urgency && (
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${urgency.cls}`}>
                          {urgency.label}
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-sm font-semibold leading-relaxed text-theme-ink">
                      {item.textDescription}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/symptoms/${item._id}`}
                  className="inline-flex min-h-[44px] shrink-0 items-center justify-center self-end rounded-full border border-theme-line bg-theme-page px-4 py-2 text-xs font-bold text-theme-ink transition-colors hover:border-theme-brand/40 hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:text-sm md:self-center"
                >
                  Xem chi tiết
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
