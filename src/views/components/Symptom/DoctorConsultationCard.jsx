import React, { useState } from "react";
import { Mascot } from "page-mascot";
import { PhoneCall, Copy, Check, Stethoscope, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { ADVISOR_DOCTOR } from "../../../config/advisor";

const NURSE_DIRECTIONS = "/mascots/nurse-directions.png";
const NURSE_REACTIONS = "/mascots/nurse-reactions.png";

function NurseMascot({ size = 76, className = "" }) {
  return (
    <div className={`relative flex items-center justify-center rounded-2xl border border-emerald-100 bg-white shadow-sm overflow-hidden ${className}`}>
      <Mascot directions={NURSE_DIRECTIONS} reactions={NURSE_REACTIONS} size={size} label="nurse" />
    </div>
  );
}

function ContactButtons({ large = false }) {
  const { phone, phoneDisplay } = ADVISOR_DOCTOR;
  const size = large ? "px-5 py-3 text-base" : "px-4 py-2.5 text-base";
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`tel:${phone}`}
        className={`inline-flex items-center justify-center gap-2 ${size} bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full`}
      >
        <PhoneCall className="w-5 h-5" /> Gọi {phoneDisplay}
      </a>
      <a
        href={`https://zalo.me/${phone}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center gap-2 ${size} bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full`}
      >
        <MessageCircle className="w-5 h-5" /> Nhắn Zalo
      </a>
    </div>
  );
}

export default function DoctorConsultationCard({ variant = "full", urgent = false }) {
  const [copied, setCopied] = useState(false);
  const { displayName, role, phone, phoneDisplay } = ADVISOR_DOCTOR;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phone).then(() => {
      setCopied(true);
      toast.success(`Đã chép số của ${displayName}: ${phoneDisplay}`);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      toast.error("Không thể chép số điện thoại!");
    });
  };

  // Dải trên đầu trang Kiểm tra triệu chứng
  if (variant === "banner") {
    return (
      <section
        aria-label="Bác sĩ cố vấn"
        className="bg-white border-2 border-emerald-200 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <NurseMascot size={60} className="w-16 h-16 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-700">{role}</p>
            <p className="text-xl font-extrabold text-gray-900">{displayName}</p>
            <p className="text-base text-gray-600 mt-0.5">Cần hỏi thêm, mẹ có thể gọi hoặc nhắn Zalo cho bác sĩ.</p>
          </div>
        </div>
        <ContactButtons />
      </section>
    );
  }

  // Thẻ đầy đủ, hiện sau kết quả phân tích
  return (
    <section
      aria-label="Liên hệ bác sĩ cố vấn"
      className={`rounded-3xl border-2 p-5 sm:p-6 space-y-5 ${
        urgent ? "bg-red-50 border-red-200" : "bg-emerald-50/60 border-emerald-200"
      }`}
    >
      {urgent && (
        <p className="text-lg font-bold text-red-800 flex items-center gap-2">
          <Stethoscope className="w-6 h-6" /> Mẹ nên hỏi ý kiến bác sĩ sớm
        </p>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <NurseMascot size={80} className="w-20 h-20 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-700">{role}</p>
            <p className="text-2xl font-extrabold text-gray-900">{displayName}</p>
            <p className="text-base text-gray-700 mt-1">
              Điện thoại / Zalo: <strong className="tracking-wide">{phoneDisplay}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <ContactButtons large />
          <button
            type="button"
            onClick={handleCopyPhone}
            className="self-start inline-flex items-center gap-2 px-4 py-2 text-base font-semibold text-gray-700 hover:underline"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
            {copied ? "Đã chép số" : "Chép số điện thoại"}
          </button>
        </div>
      </div>
    </section>
  );
}
