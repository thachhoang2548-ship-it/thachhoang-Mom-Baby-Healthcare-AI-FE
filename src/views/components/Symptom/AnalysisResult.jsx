import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Leaf,
  Stethoscope,
  Info,
  ShieldAlert,
  PhoneIncoming,
  Sprout,
  AlertOctagon,
} from "lucide-react";
import { Link } from "react-router-dom";
import DoctorConsultationCard from "./DoctorConsultationCard";
import { ADVISOR_DOCTOR, EMERGENCY_NUMBER } from "../../../config/advisor";

export default function AnalysisResult({ analysis }) {
  if (!analysis) return null;

  const doc = analysis.analysis || analysis;
  const result = doc.analysisResult;
  if (!result) return null;

  // Mô tả triệu chứng mẹ đã nhập — điền sẵn vào form "bác sĩ gọi lại".
  const symptomText = (doc.textDescription || "").slice(0, 1000);

  const {
    urgencyLevel,
    urgencyReason,
    possibleConditions = [],
    lifestyleConnection,
    recommendations = [],
    dietarySuggestions = [],
    shouldSeeDoctor,
    specialistType,
    disclaimer,
  } = result;

  const URGENCY_LABELS = {
    Low: "Thấp",
    Medium: "Trung bình",
    High: "Cao",
    Critical: "Khẩn cấp",
  };
  const urgencyText = URGENCY_LABELS[urgencyLevel] || urgencyLevel;

  // Trang y tế giữ tĩnh và rõ (không dùng animate-pulse)
  let urgencyStyles = "border-status-ok/40 bg-status-ok/10 text-theme-ink";
  let UrgencyIcon = CheckCircle2;
  let iconColor = "text-status-ok";

  if (urgencyText === "Khẩn cấp") {
    urgencyStyles = "border-status-danger-text bg-status-danger-bg text-status-danger-text";
    UrgencyIcon = AlertOctagon;
    iconColor = "text-status-danger-text";
  } else if (urgencyText === "Cao") {
    urgencyStyles = "border-status-danger-line bg-status-danger-bg/75 text-status-danger-text";
    UrgencyIcon = AlertTriangle;
    iconColor = "text-status-danger-text";
  } else if (urgencyText === "Trung bình") {
    urgencyStyles = "border-status-warn-line bg-status-warn-bg text-status-warn-text";
    UrgencyIcon = Info;
    iconColor = "text-status-warn-text";
  }

  const hasAiDetails =
    Boolean(urgencyReason) ||
    possibleConditions.length > 0 ||
    recommendations.length > 0 ||
    dietarySuggestions.length > 0 ||
    Boolean(lifestyleConnection);

  const getProbabilityBadge = (prob) => {
    switch (prob) {
      case "Có thể":
        return "border-status-warn-line bg-status-warn-bg text-status-warn-text";
      case "Cần kiểm tra":
        return "border-theme-brand/30 bg-theme-brand-soft text-theme-ink";
      case "Ít khả năng":
      default:
        return "border-theme-line bg-theme-page text-theme-muted";
    }
  };

  return (
    <div className="space-y-5 font-display text-theme-ink">
      {/* Section A: Urgency Banner (Static, high-contrast) */}
      <div className={`flex items-start gap-3.5 rounded-3xl border p-5 sm:p-6 ${urgencyStyles}`}>
        <UrgencyIcon className={`mt-0.5 h-6 w-6 shrink-0 ${iconColor}`} />
        <div>
          <h3 className="text-base font-bold sm:text-lg">
            Mức độ cần lưu ý: {urgencyText}
          </h3>
          {urgencyReason && (
            <p className="mt-1 text-sm leading-relaxed">{urgencyReason}</p>
          )}
        </div>
      </div>

      {/* Uploaded Symptom Image Preview */}
      {(doc.imageUrl || (doc.images && doc.images.length > 0)) && (
        <div className="flex items-center gap-4 rounded-3xl border border-theme-line bg-theme-surface p-4 shadow-sm">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-theme-line bg-theme-page">
            <img
              src={doc.imageUrl || doc.images[0]}
              alt="Hình ảnh triệu chứng"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <span className="inline-block rounded-full bg-theme-brand-soft px-3 py-0.5 text-xs font-bold text-theme-ink">
              Hình ảnh triệu chứng đã phân tích
            </span>
            <p className="mt-1 truncate text-sm font-medium text-theme-muted">
              {doc.textDescription || "Ảnh chụp triệu chứng"}
            </p>
          </div>
        </div>
      )}

      {/* Fallback when AI has no detail */}
      {!hasAiDetails && (
        <div className="flex items-start gap-3.5 rounded-3xl border border-status-warn-line bg-status-warn-bg p-5 text-status-warn-text">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h4 className="text-sm font-bold sm:text-base">Chưa có phân tích chi tiết từ AI</h4>
            <p className="mt-1 text-sm leading-relaxed text-theme-ink">
              Bản ghi này chưa có dữ liệu phân tích chi tiết. Mẹ vui lòng gửi lại mô tả triệu chứng để nhận hướng dẫn chăm sóc tham khảo.
            </p>
          </div>
        </div>
      )}

      {/* Section F: See Doctor Referral */}
      {shouldSeeDoctor && (
        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-status-danger-line bg-status-danger-bg p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-start gap-3.5">
            <Stethoscope className="mt-0.5 h-6 w-6 shrink-0 text-status-danger-text" />
            <div>
              <h4 className="text-base font-bold text-status-danger-text">Khuyến nghị gặp chuyên gia y tế</h4>
              <p className="mt-1 text-sm leading-relaxed text-status-danger-text">
                Mẹ nên sắp xếp lịch khám hoặc trao đổi trực tiếp với bác sĩ chuyên khoa:{" "}
                <strong className="underline">{specialistType || "Sản - Nhi / Đa khoa"}</strong>
              </p>
            </div>
          </div>
          <Link
            to="/doctor-callback"
            state={symptomText ? { concern: symptomText } : undefined}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 self-start rounded-full bg-red-700 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-danger-text focus-visible:ring-offset-2 sm:self-center"
          >
            <PhoneIncoming className="h-4 w-4" />
            <span>Nhờ {ADVISOR_DOCTOR.displayName} gọi lại</span>
          </Link>
        </div>
      )}

      {/* Section B: Possible Conditions */}
      {possibleConditions.length > 0 && (
        <section className="space-y-4 rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm">
          <h4 className="flex items-center gap-2 text-base font-bold text-theme-ink sm:text-lg">
            <Info className="h-5 w-5 text-theme-brand" />
            <span>Tình trạng có thể liên quan</span>
          </h4>
          <div className="space-y-3">
            {possibleConditions.map((cond, idx) => (
              <div
                key={idx}
                className="space-y-1.5 rounded-2xl border border-theme-line bg-theme-page/60 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h5 className="text-sm font-bold text-theme-ink sm:text-base">{cond.name}</h5>
                  <span
                    className={`rounded-full border px-3 py-0.5 text-xs font-bold ${getProbabilityBadge(
                      cond.probability
                    )}`}
                  >
                    {cond.probability}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-theme-muted">{cond.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section C: Lifestyle Connection */}
      {lifestyleConnection && (
        <section className="space-y-2 rounded-3xl border border-theme-line bg-theme-sidebar/65 p-6">
          <h4 className="flex items-center gap-2 text-base font-bold text-theme-ink">
            <Sprout className="h-5 w-5 text-status-ok" />
            <span>Liên hệ với sinh hoạt hằng ngày</span>
          </h4>
          <p className="text-sm leading-relaxed text-theme-ink/90">{lifestyleConnection}</p>
        </section>
      )}

      {/* Grid for recommendations and dietary suggestions */}
      {(recommendations.length > 0 || dietarySuggestions.length > 0) && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {recommendations.length > 0 && (
            <section className="space-y-3 rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm">
              <h4 className="flex items-center gap-2 border-b border-theme-line pb-3 text-base font-bold text-theme-ink">
                <CheckCircle2 className="h-5 w-5 text-status-ok" />
                <span>Hướng dẫn theo dõi &amp; chăm sóc</span>
              </h4>
              <ul className="space-y-2.5">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed text-theme-ink/90">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-status-ok" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {dietarySuggestions.length > 0 && (
            <section className="space-y-3 rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm">
              <h4 className="flex items-center gap-2 border-b border-theme-line pb-3 text-base font-bold text-theme-ink">
                <Leaf className="h-5 w-5 text-theme-brand" />
                <span>Gợi ý ăn uống hỗ trợ</span>
              </h4>
              <ul className="space-y-2.5">
                {dietarySuggestions.map((diet, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed text-theme-ink/90">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-theme-brand" />
                    <span>{diet}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* Doctor Consultation Card */}
      <DoctorConsultationCard
        variant="full"
        urgent={shouldSeeDoctor || urgencyText === "Khẩn cấp" || urgencyText === "Cao"}
        concern={symptomText}
      />

      {/* Section G: Disclaimer riêng cho kết quả AI */}
      <div className="rounded-3xl border border-theme-line bg-theme-sidebar/70 p-5 sm:p-6">
        <div className="flex items-start gap-3.5">
          <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-status-warn-text" />
          <p className="text-sm leading-relaxed text-theme-ink sm:text-base">
            <strong>Kết quả này do AI gợi ý, không phải chẩn đoán của bác sĩ. </strong>
            {disclaimer && <span>{disclaimer} </span>}
            Hãy hỏi <strong>{ADVISOR_DOCTOR.displayName}</strong> hoặc đến cơ sở y tế
            để được khám và điều trị đúng. Trường hợp khẩn cấp, gọi ngay <strong>{EMERGENCY_NUMBER}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
