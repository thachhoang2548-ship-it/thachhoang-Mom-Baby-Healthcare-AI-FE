import React, { useState } from "react";
import {
  HelpCircle,
  X,
  ShieldAlert,
  Flame,
  BookOpen,
  Zap,
  Sprout,
  Sparkles,
} from "lucide-react";

export default function ProfileBadge({ profile }) {
  const [showExplanation, setShowExplanation] = useState(false);

  if (!profile) return null;

  const { profileId, profileName, nutritionNeeds, description } = profile;

  let toneStyles = "bg-theme-brand-soft text-theme-brand";
  let ProfileIcon = Sparkles;

  if (profileId === "burned-out") {
    toneStyles = "bg-status-warn-bg text-status-warn-text";
    ProfileIcon = Flame;
  } else if (profileId === "couch-scholar") {
    toneStyles = "bg-theme-sidebar text-theme-ink";
    ProfileIcon = BookOpen;
  } else if (profileId === "overachiever") {
    toneStyles = "bg-theme-brand-soft text-theme-brand";
    ProfileIcon = Zap;
  } else if (profileId === "balanced") {
    toneStyles = "bg-status-ok/15 text-status-ok";
    ProfileIcon = Sprout;
  }

  return (
    <section className="flex flex-col justify-between gap-4 rounded-3xl border border-theme-line bg-theme-surface p-5 font-display shadow-sm sm:p-6 md:flex-row md:items-center">
      <div className="flex items-start gap-3.5">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${toneStyles}`}>
          <ProfileIcon className="h-6 w-6" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-theme-ink sm:text-lg">
              Hồ sơ thể trạng: {profileName}
            </h2>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-theme-muted">
            {description || "Hồ sơ dinh dưỡng đã được phân tích tự động dựa trên chỉ số của mẹ."}
          </p>
          {nutritionNeeds && nutritionNeeds.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {nutritionNeeds.map((need, idx) => (
                <span
                  key={idx}
                  className="rounded-full border border-theme-line bg-theme-page px-3 py-1 text-xs font-semibold text-theme-ink"
                >
                  {need}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowExplanation(true)}
        className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 self-start rounded-full border border-theme-line bg-theme-page px-4 py-2 text-xs font-bold text-theme-ink transition-colors hover:border-theme-brand/40 hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:text-sm md:self-center"
      >
        <HelpCircle className="h-4 w-4 text-theme-brand" />
        <span>Giải thích nhóm này</span>
      </button>

      {showExplanation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-theme-ink/45 p-4 backdrop-blur-[2px]"
          onClick={() => setShowExplanation(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-badge-modal-title"
          >
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-theme-line pb-4">
              <div className="flex items-center gap-2.5">
                <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneStyles}`}>
                  <ProfileIcon className="h-5 w-5" />
                </span>
                <h3 id="profile-badge-modal-title" className="text-lg font-bold text-theme-ink">
                  Chi tiết nhóm {profileName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExplanation(false)}
                aria-label="Đóng"
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-theme-line bg-theme-page text-theme-ink hover:bg-theme-brand-soft"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-5 text-sm leading-relaxed text-theme-muted">{description}</p>

            <div className="mb-6 rounded-2xl border border-theme-line bg-theme-page/60 p-4">
              <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-theme-ink sm:text-sm">
                <ShieldAlert className="h-4 w-4 text-status-warn-text" />
                <span>Tiêu chuẩn phân loại tự động</span>
              </h4>
              <ul className="space-y-2 text-xs leading-relaxed text-theme-muted sm:text-sm">
                <li className="flex items-start gap-2">
                  <span className="min-w-[96px] font-bold text-theme-ink">Burned Out:</span>
                  <span>Căng thẳng cao, ngủ dưới 6.5 giờ, làm việc trên 8 giờ/ngày.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="min-w-[96px] font-bold text-theme-ink">Couch Scholar:</span>
                  <span>Căng thẳng vừa, ít vận động dưới 1 giờ/ngày.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="min-w-[96px] font-bold text-theme-ink">Overachiever:</span>
                  <span>Cường độ hoạt động cao, căng thẳng cao, ngủ dưới 7 giờ.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="min-w-[96px] font-bold text-theme-ink">Balanced:</span>
                  <span>Căng thẳng thấp/vừa, ngủ đủ 7–9 giờ, vận động đều đặn.</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowExplanation(false)}
              className="flex min-h-[48px] w-full items-center justify-center rounded-full bg-theme-brand px-5 py-2.5 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
