import React, { useState } from "react";
import { Mascot } from "page-mascot";
import { PhoneCall, Copy, Check, Stethoscope, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { ADVISOR_DOCTOR } from "../../../config/advisor";

const NURSE_DIRECTIONS = "/mascots/nurse-directions.png";
const NURSE_REACTIONS = "/mascots/nurse-reactions.png";

function NurseMascot({ size = 76, className = "" }) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl border border-theme-line bg-theme-surface shadow-sm ${className}`}
    >
      <Mascot
        directions={NURSE_DIRECTIONS}
        reactions={NURSE_REACTIONS}
        size={size}
        label="nurse"
      />
    </div>
  );
}

function ContactButtons({ large = false }) {
  const { phone, phoneDisplay } = ADVISOR_DOCTOR;
  const padClass = large ? "px-5 py-3 text-sm sm:text-base" : "px-4 py-2.5 text-sm";
  return (
    <div className="flex flex-wrap gap-2.5">
      <a
        href={`tel:${phone}`}
        className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-status-ok font-bold text-theme-surface transition-colors hover:bg-status-ok-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-ok focus-visible:ring-offset-2 ${padClass}`}
      >
        <PhoneCall className="h-4 w-4 shrink-0" />
        <span>Gọi {phoneDisplay}</span>
      </a>
      <a
        href={`https://zalo.me/${phone}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-sky-700 font-bold text-white transition-colors hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-ink focus-visible:ring-offset-2 ${padClass}`}
      >
        <MessageCircle className="h-4 w-4 shrink-0" />
        <span>Nhắn Zalo</span>
      </a>
    </div>
  );
}

export default function DoctorConsultationCard({ variant = "full", urgent = false }) {
  const [copied, setCopied] = useState(false);
  const { displayName, role, phone, phoneDisplay } = ADVISOR_DOCTOR;

  const handleCopyPhone = () => {
    navigator.clipboard
      .writeText(phone)
      .then(() => {
        setCopied(true);
        toast.success(`Đã sao chép số của ${displayName}: ${phoneDisplay}`);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        toast.error("Không thể sao chép số điện thoại.");
      });
  };

  if (variant === "banner") {
    return (
      <section
        aria-label="Bác sĩ cố vấn"
        className="flex flex-col justify-between gap-4 rounded-3xl border border-theme-line bg-theme-surface p-5 font-display shadow-sm md:flex-row md:items-center"
      >
        <div className="flex items-center gap-4">
          <NurseMascot size={60} className="h-16 w-16 shrink-0" />
          <div>
            <p className="text-xs font-bold text-status-ok-text">{role}</p>
            <p className="text-lg font-bold text-theme-ink sm:text-xl">{displayName}</p>
            <p className="mt-0.5 text-sm text-theme-muted">
              Cần hỏi thêm, mẹ có thể gọi trực tiếp hoặc nhắn Zalo cho bác sĩ.
            </p>
          </div>
        </div>
        <ContactButtons />
      </section>
    );
  }

  return (
    <section
      aria-label="Liên hệ bác sĩ cố vấn"
      className={`space-y-5 rounded-3xl border p-5 font-display sm:p-6 ${
        urgent
          ? "border-status-danger-line bg-status-danger-bg"
          : "border-theme-line bg-theme-surface shadow-sm"
      }`}
    >
      {urgent && (
        <p className="flex items-center gap-2 text-base font-bold text-status-danger-text sm:text-lg">
          <Stethoscope className="h-5 w-5 shrink-0" />
          <span>Mẹ nên hỏi ý kiến bác sĩ sớm</span>
        </p>
      )}

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <NurseMascot size={76} className="h-20 w-20 shrink-0" />
          <div>
            <p className="text-xs font-bold text-status-ok-text">{role}</p>
            <p className="text-xl font-bold text-theme-ink sm:text-2xl">{displayName}</p>
            <p className="mt-1 text-sm text-theme-ink sm:text-base">
              Điện thoại / Zalo: <strong className="tracking-wide">{phoneDisplay}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <ContactButtons large />
          <button
            type="button"
            onClick={handleCopyPhone}
            className="inline-flex min-h-[44px] items-center gap-2 self-start rounded-full px-3 text-sm font-semibold text-theme-ink hover:bg-theme-page hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
          >
            {copied ? (
              <Check className="h-4 w-4 text-status-ok" />
            ) : (
              <Copy className="h-4 w-4 text-theme-muted" />
            )}
            <span>{copied ? "Đã sao chép số" : "Sao chép số điện thoại"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
