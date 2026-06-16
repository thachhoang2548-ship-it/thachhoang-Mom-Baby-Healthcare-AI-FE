import React from "react";
import { AlertTriangle } from "lucide-react";
import "../../styles/SymptomEntryPage.css";

const severityColors = {
  low: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  medium: "bg-orange-100 text-orange-700 border border-orange-300",
  high: "bg-red-100 text-red-700 border border-red-300",
};

const ResultCard = ({ result }) => {
  if (!result) return null;

  const severity = result?.severity_level || "low";
  const condition = result?.predicted_condition || "Tình trạng chưa xác định";
  const baseUrl = import.meta.env.VITE_NODE_API_URL || "http://localhost:5000";
  const imageUrl = result.images && result.images.length > 0 
    ? `${baseUrl}/${result.images[0]}` 
    : null;

  return (
    <div className="bg-surface-light rounded-DEFAULT shadow-soft p-5 sm:p-6">
      <h2 className="text-xl font-bold mb-4">Kết quả phân tích từ AI</h2>

      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide ${severityColors[severity] || severityColors.low}`}>
        {severity === "high" ? "🚨" : severity === "medium" ? "⚠️" : "✅"}{" "}
        {severity === "high" ? "MỨC ĐỘ NGUY HIỂM CAO" : severity === "medium" ? "MỨC ĐỘ TRUNG BÌNH" : "MỨC ĐỘ THẤP"}
      </div>

      {severity === "high" && (
        <div className="flex items-center gap-2 bg-red-100 text-red-700 border border-red-300 p-3 rounded-md mt-3 mb-3 animate-pulse">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm font-semibold">
            Triệu chứng này có thể cần được thăm khám y tế ngay lập tức.
          </p>
        </div>
      )}

      <div className="mt-4">
        <h3 className="font-semibold">Tình trạng dự đoán:</h3>
        <p>{condition}</p>
      </div>

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Symptom"
          className="mt-4 w-full rounded-lg border shadow-sm"
        />
      )}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-background-light rounded-lg">
          <h4 className="font-semibold text-sm mb-1">Gợi ý chế độ ăn uống</h4>
          <ul className="list-disc ml-5 text-gray-600">
            {result.recommendations?.diet?.length
              ? result.recommendations.diet.map((item, i) => <li key={i}>{item}</li>)
              : <li>Không có gợi ý ăn uống.</li>}
          </ul>
        </div>
        <div className="p-4 bg-background-light rounded-lg">
          <h4 className="font-semibold text-sm mb-1">Lối sống & Thói quen</h4>
          <ul className="list-disc ml-5 text-gray-600">
            {result.recommendations?.habits?.length
              ? result.recommendations.habits.map((item, i) => <li key={i}>{item}</li>)
              : <li>Không có gợi ý lối sống.</li>}
          </ul>
        </div>
        <div className="p-4 bg-background-light rounded-lg">
          <h4 className="font-semibold text-sm mb-1">Lời khuyên từ bác sĩ</h4>
          <p className="text-gray-600">
            {result.recommendations?.doctor || "Không có lời khuyên cụ thể từ bác sĩ."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
