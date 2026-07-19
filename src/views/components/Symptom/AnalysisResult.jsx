import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Leaf, Stethoscope, Info, ArrowRight, ShieldAlert } from "lucide-react";

export default function AnalysisResult({ analysis }) {
  if (!analysis) return null;

  const doc = analysis.analysis || analysis;
  const result = doc.analysisResult;
  if (!result) return null;

  const {
    urgencyLevel,
    urgencyReason,
    possibleConditions = [],
    lifestyleConnection,
    recommendations = [],
    dietarySuggestions = [],
    shouldSeeDoctor,
    specialistType,
    disclaimer
  } = result;

  // Backend trả enum tiếng Anh (Low/Medium/High/Critical) — đổi sang nhãn tiếng Việt để hiển thị.
  const URGENCY_LABELS = {
    Low: "Thấp",
    Medium: "Trung bình",
    High: "Cao",
    Critical: "Khẩn cấp"
  };
  const urgencyText = URGENCY_LABELS[urgencyLevel] || urgencyLevel;

  // 1. Color coding for Urgency level banner
  let urgencyStyles = "bg-green-50 border-green-200 text-green-800";
  let urgencyIcon = "✅";

  if (urgencyText === "Khẩn cấp") {
    urgencyStyles = "bg-red-100 border-red-300 text-red-900 animate-pulse";
    urgencyIcon = "🚨";
  } else if (urgencyText === "Cao") {
    urgencyStyles = "bg-orange-50 border-orange-200 text-orange-900";
    urgencyIcon = "⚠️";
  } else if (urgencyText === "Trung bình") {
    urgencyStyles = "bg-yellow-50 border-yellow-200 text-yellow-900";
    urgencyIcon = "ℹ️";
  }

  // Khi AI không trả được phân tích, mọi mục chi tiết đều rỗng -> báo rõ cho người dùng
  // thay vì chỉ hiện mỗi banner mức độ khẩn cấp.
  const hasAiDetails =
    Boolean(urgencyReason) ||
    possibleConditions.length > 0 ||
    recommendations.length > 0 ||
    dietarySuggestions.length > 0 ||
    Boolean(lifestyleConnection);

  // 2. Color coding for probability tags
  const getProbabilityBadge = (prob) => {
    switch (prob) {
      case "Có thể":
        return "bg-orange-100 text-orange-800 border-orange-200/50";
      case "Cần kiểm tra":
        return "bg-yellow-100 text-yellow-800 border-yellow-200/50";
      case "Ít khả năng":
      default:
        return "bg-gray-100 text-gray-600 border-gray-200/50";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Section A: Urgency Banner */}
      <div className={`p-5 rounded-3xl border ${urgencyStyles} flex items-start gap-3.5 shadow-sm`}>
        <span className="text-2xl select-none leading-none mt-0.5">{urgencyIcon}</span>
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider">Mức độ khẩn cấp: {urgencyText}</h3>
          <p className="text-xs font-semibold leading-relaxed mt-1 opacity-90">{urgencyReason}</p>
        </div>
      </div>

      {/* Thông báo khi AI chưa phân tích được (bản ghi cũ hoặc AI lỗi) */}
      {!hasAiDetails && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-start gap-3.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-sm text-amber-900">Chưa có phân tích chi tiết từ AI</h4>
            <p className="text-xs text-amber-800 font-semibold mt-1 leading-relaxed">
              Bản ghi này chưa có dữ liệu phân tích (có thể được tạo trước khi AI hoạt động, hoặc AI
              tạm thời không phản hồi). Vui lòng gửi lại mô tả triệu chứng để nhận lời khuyên và các
              biện pháp chăm sóc.
            </p>
          </div>
        </div>
      )}

      {/* Section F: See Doctor Referral */}
      {shouldSeeDoctor && (
        <div className="bg-red-50/50 border-2 border-red-200/60 rounded-3xl p-5 flex items-start gap-3.5 shadow-sm">
          <Stethoscope className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-sm text-red-900">Khuyến nghị gặp chuyên gia y tế</h4>
            <p className="text-xs text-red-800 font-semibold mt-1">
              Bạn nên sắp xếp lịch khám hoặc tư vấn trực tiếp với bác sĩ chuyên khoa:{" "}
              <span className="underline font-bold text-red-950">{specialistType || "Đa khoa / Phù hợp"}</span>
            </p>
          </div>
        </div>
      )}

      {/* Section B: Possible Conditions */}
      {possibleConditions.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="font-black text-sm text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-500" />
            Tình trạng có thể xảy ra
          </h4>
          <div className="space-y-3">
            {possibleConditions.map((cond, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100/50 space-y-2">
                <div className="flex justify-between items-start gap-3">
                  <h5 className="font-bold text-sm text-gray-900 leading-tight">{cond.name}</h5>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getProbabilityBadge(cond.probability)}`}>
                    {cond.probability}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  {cond.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section C: Lifestyle Connection */}
      {lifestyleConnection && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 shadow-sm space-y-2">
          <h4 className="font-black text-sm text-blue-900 uppercase tracking-wide flex items-center gap-2">
            🌱 Liên hệ với lối sống của bạn
          </h4>
          <p className="text-xs text-blue-800 font-semibold leading-relaxed">
            {lifestyleConnection}
          </p>
        </div>
      )}

      {/* Grid for recommendations and dietary suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Section D: Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-3">
            <h4 className="font-black text-sm text-gray-900 uppercase tracking-wide flex items-center gap-1.5 border-b border-gray-50 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Khuyến nghị chăm sóc
            </h4>
            <ul className="space-y-2">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-2 text-xs text-gray-600 font-semibold leading-relaxed">
                  <span className="text-emerald-500 font-bold select-none">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Section E: Dietary Suggestions */}
        {dietarySuggestions.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="font-black text-sm text-gray-900 uppercase tracking-wide flex items-center gap-1.5 border-b border-gray-50 pb-2">
                <Leaf className="w-4 h-4 text-amber-500" />
                Gợi ý chế độ ăn uống
              </h4>
              <ul className="space-y-2">
                {dietarySuggestions.map((diet, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-gray-600 font-semibold leading-relaxed">
                    <span className="text-amber-500 font-bold select-none">•</span>
                    <span>{diet}</span>
                  </li>
                ))}
              </ul>
            </div>


          </div>
        )}

      </div>

      {/* Section G: Disclaimer */}
      {disclaimer && (
        <div className="bg-gray-100 rounded-2xl p-4 border border-gray-200/40">
          <p className="text-[10px] text-gray-400 font-bold leading-relaxed flex gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="italic">{disclaimer}</span>
          </p>
        </div>
      )}

    </div>
  );
}
