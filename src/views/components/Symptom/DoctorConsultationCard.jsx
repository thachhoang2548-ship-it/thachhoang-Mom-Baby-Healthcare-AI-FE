import React from "react";
import { Link } from "react-router-dom";
import { Mascot } from "page-mascot";
import { PhoneIncoming, Phone, Crown, Stethoscope } from "lucide-react";
import { ADVISOR_DOCTOR, EMERGENCY_NUMBER } from "../../../config/advisor";
import { useAuthController } from "../../../controllers/authController";
import { checkTierUnlocked } from "../../../utils/tierHelpers";
import { CALLBACK_FEE } from "../../../models/services/doctorCallbackService";

const NURSE_DIRECTIONS = "/mascots/nurse-directions.png";
const NURSE_REACTIONS = "/mascots/nurse-reactions.png";

const feeText = `${CALLBACK_FEE.toLocaleString("vi-VN")}đ`;

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

function ContactActions({ isVip, urgent, concern, large = false }) {
  const padClass = large ? "px-5 py-3 text-sm sm:text-base" : "px-4 py-2.5 text-sm";
  return (
    <div className="flex flex-wrap gap-2.5">
      {isVip ? (
        <Link
          to="/doctor-callback"
          state={concern ? { concern } : undefined}
          className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-status-ok font-bold text-theme-surface transition-colors hover:bg-status-ok-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-ok focus-visible:ring-offset-2 ${padClass}`}
        >
          <PhoneIncoming className="h-4 w-4 shrink-0" />
          <span>Yêu cầu bác sĩ gọi lại</span>
        </Link>
      ) : (
        <Link
          to="/upgrade"
          state={{ targetTier: "SuperMomVip" }}
          className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-theme-brand font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2 ${padClass}`}
        >
          <Crown className="h-4 w-4 shrink-0" />
          <span>Nâng cấp Super Mom VIP</span>
        </Link>
      )}
      {urgent && (
        <a
          href={`tel:${EMERGENCY_NUMBER}`}
          className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-red-700 font-bold text-white transition-colors hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-danger-text focus-visible:ring-offset-2 ${padClass}`}
        >
          <Phone className="h-4 w-4 shrink-0" />
          <span>Cấp cứu {EMERGENCY_NUMBER}</span>
        </a>
      )}
    </div>
  );
}

function Description({ isVip }) {
  return isVip ? (
    <>
      Mẹ để lại số điện thoại, bác sĩ sẽ gọi lại tư vấn. Phí {feeText}/cuộc, chỉ tính khi bác sĩ tư vấn thành công.
    </>
  ) : (
    <>
      Hội viên <strong className="text-theme-ink">Super Mom VIP</strong> được bác sĩ gọi lại tư vấn trực tiếp
      ({feeText}/cuộc, chỉ tính khi tư vấn thành công).
    </>
  );
}

/**
 * Thẻ liên hệ bác sĩ cố vấn. Không hiển thị số bác sĩ:
 * - Super Mom VIP: nút "Yêu cầu bác sĩ gọi lại".
 * - Gói khác: lời mời nâng cấp.
 * - Trường hợp khẩn: luôn kèm nút gọi 115 miễn phí cho mọi gói.
 */
export default function DoctorConsultationCard({ variant = "full", urgent = false, concern = "" }) {
  const tier = useAuthController((state) => state.tier);
  const isVip = checkTierUnlocked(tier, "SuperMomVip");
  const { displayName, role } = ADVISOR_DOCTOR;

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
              <Description isVip={isVip} />
            </p>
          </div>
        </div>
        <ContactActions isVip={isVip} urgent={urgent} concern={concern} />
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
          <span>Mẹ nên hỏi ý kiến bác sĩ sớm. Nếu nguy cấp, gọi ngay {EMERGENCY_NUMBER}.</span>
        </p>
      )}

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <NurseMascot size={76} className="h-20 w-20 shrink-0" />
          <div>
            <p className="text-xs font-bold text-status-ok-text">{role}</p>
            <p className="text-xl font-bold text-theme-ink sm:text-2xl">{displayName}</p>
            <p className="mt-1 max-w-md text-sm text-theme-ink sm:text-base">
              <Description isVip={isVip} />
            </p>
          </div>
        </div>

        <ContactActions isVip={isVip} urgent={urgent} concern={concern} large />
      </div>
    </section>
  );
}
