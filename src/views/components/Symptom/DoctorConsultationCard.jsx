import React, { useState } from "react";
import { Mascot } from "page-mascot";
import { PhoneCall, ShieldCheck, Copy, Check, Stethoscope, MessageCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const DOCTOR_NAME = "BS. THU";
const DOCTOR_PHONE = "0985544534";
const DOCTOR_PHONE_DISPLAY = "0985 544 534";
const NURSE_DIRECTIONS = "/mascots/nurse-directions.png";
const NURSE_REACTIONS = "/mascots/nurse-reactions.png";

function NurseMascot({ size = 76, className = "" }) {
  return (
    <div className={`relative flex items-center justify-center rounded-2xl border border-emerald-100 bg-white/85 shadow-sm ${className}`}>
      <Mascot
        directions={NURSE_DIRECTIONS}
        reactions={NURSE_REACTIONS}
        size={size}
        label="nurse"
      />
    </div>
  );
}

export default function DoctorConsultationCard({ variant = "full", urgent = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(DOCTOR_PHONE).then(() => {
      setCopied(true);
      toast.success(`Đã sao chép số điện thoại ${DOCTOR_NAME}: ${DOCTOR_PHONE_DISPLAY}`);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      toast.error("Không thể sao chép số điện thoại!");
    });
  };

  if (variant === "banner") {
    return (
      <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-amber-50 border border-emerald-200/80 rounded-2xl p-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <NurseMascot size={54} className="w-14 h-14 flex-shrink-0 overflow-hidden" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                Cố vấn chuyên môn y tế: <strong className="text-emerald-700">{DOCTOR_NAME}</strong>
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/60">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Xác thực
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
              Phân tích AI chỉ là gợi ý tham khảo. Vui lòng liên hệ bác sĩ khi cần thăm khám hoặc điều trị.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
          <a
            href={`tel:${DOCTOR_PHONE}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-full shadow-sm shadow-emerald-600/20 transition-all"
            title="Gọi ngay cho bác sĩ"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
            <span>Gọi {DOCTOR_PHONE_DISPLAY}</span>
          </a>
          <a
            href={`https://zalo.me/${DOCTOR_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white text-xs font-bold rounded-full shadow-sm transition-all"
            title="Nhắn tin qua Zalo"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Zalo</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl border ${
      urgent
        ? "bg-gradient-to-br from-red-50/80 via-white to-amber-50/60 border-red-200/90 shadow-md shadow-red-500/5"
        : "bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 border-emerald-200/80 shadow-sm"
    } p-5 sm:p-6 space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-emerald-100 text-emerald-800 border border-emerald-300/70 shadow-2xs">
          <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
          Bác sĩ cố vấn & hỗ trợ chuyên môn
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-white/80 px-2.5 py-1 rounded-full border border-emerald-100 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Đang nhận tư vấn trực tiếp
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-start gap-3.5">
          <div className="relative flex-shrink-0">
            <NurseMascot size={86} className="w-24 h-24 overflow-hidden" />
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base sm:text-lg font-black text-gray-900 leading-none">
                {DOCTOR_NAME}
              </h4>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
                Bác sĩ chuyên môn
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-600">
              Cố vấn y tế & đồng hành sức khỏe mẹ và bé
            </p>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-xs font-bold text-gray-400">Hotline tư vấn:</span>
              <span className="text-sm font-extrabold text-emerald-700 tracking-wide font-mono">
                {DOCTOR_PHONE_DISPLAY}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <a
            href={`tel:${DOCTOR_PHONE}`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs font-black rounded-2xl shadow-md shadow-emerald-600/20 transition-all"
          >
            <PhoneCall className="w-4 h-4 animate-pulse" />
            <span>Gọi {DOCTOR_PHONE_DISPLAY}</span>
          </a>

          <a
            href={`https://zalo.me/${DOCTOR_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-sm transition-all"
            title="Nhắn tin qua Zalo"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Zalo</span>
          </a>

          <button
            type="button"
            onClick={handleCopyPhone}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-gray-50 active:scale-95 text-gray-700 border border-gray-200 text-xs font-bold rounded-2xl shadow-2xs transition-all"
            title="Sao chép số điện thoại"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-500" />
                <span>Sao chép</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white/90 rounded-2xl p-3.5 border border-emerald-100 shadow-2xs flex items-start gap-2.5">
        <AlertCircle className="w-4.5 h-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600 font-medium leading-relaxed">
          <strong className="text-gray-800 font-bold">Lưu ý quan trọng: </strong>
          Chủ đề sức khỏe mẹ và bé là lĩnh vực nhạy cảm. Mọi kết quả phân tích từ AI{" "}
          <span className="text-amber-700 font-bold">chỉ mang tính chất gợi ý và tham khảo định hướng</span>,
          không thay thế cho chẩn đoán y khoa chính thức. Khi triệu chứng kéo dài hoặc bất thường,
          hãy liên hệ trực tiếp với <strong>{DOCTOR_NAME} ({DOCTOR_PHONE_DISPLAY})</strong> để được thăm khám và hướng dẫn an toàn.
        </p>
      </div>
    </div>
  );
}
