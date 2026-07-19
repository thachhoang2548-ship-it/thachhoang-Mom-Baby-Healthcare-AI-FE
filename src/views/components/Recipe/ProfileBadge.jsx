import React, { useState } from "react";
import { HelpCircle, X, ShieldAlert } from "lucide-react";

export default function ProfileBadge({ profile }) {
  const [showExplanation, setShowExplanation] = useState(false);

  if (!profile) return null;

  const { profileId, profileName, nutritionNeeds, description } = profile;

  // Design styles based on profileId
  let badgeStyles = "bg-amber-50 border-amber-200 text-amber-800";
  let icon = "🍳";

  if (profileId === "burned-out") {
    badgeStyles = "bg-red-50 border-red-200 text-red-800";
    icon = "🔥";
  } else if (profileId === "couch-scholar") {
    badgeStyles = "bg-blue-50 border-blue-200 text-blue-800";
    icon = "📚";
  } else if (profileId === "overachiever") {
    badgeStyles = "bg-purple-50 border-purple-200 text-purple-800";
    icon = "⚡";
  } else if (profileId === "balanced") {
    badgeStyles = "bg-green-50 border-green-200 text-green-800";
    icon = "🌱";
  }

  return (
    <div className={`p-4 rounded-2xl border ${badgeStyles} flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300`}>
      <div className="flex items-start gap-3">
        <span className="text-3xl select-none leading-none">{icon}</span>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg leading-tight">Nhóm: {profileName}</h3>
            <button
              onClick={() => setShowExplanation(true)}
              className="text-current opacity-70 hover:opacity-100 transition-opacity"
              title="Giải thích phân loại"
            >
              <HelpCircle className="w-4.5 h-4.5" />
            </button>
          </div>
          <p className="text-sm mt-1 text-current opacity-90 font-medium">
            {description || "Hồ sơ lối sống đã được phân tích tự động."}
          </p>
          {nutritionNeeds && nutritionNeeds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {nutritionNeeds.map((need, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/60 border border-current/10 shadow-sm"
                >
                  {need}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setShowExplanation(true)}
        className="self-start md:self-center px-4 py-2 rounded-full bg-white/80 hover:bg-white text-sm font-semibold transition-colors duration-200 shadow-sm flex items-center gap-1.5 whitespace-nowrap text-current"
      >
        <HelpCircle className="w-4 h-4" />
        Tại sao tôi thuộc nhóm này?
      </button>

      {/* Explanation Modal */}
      {showExplanation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowExplanation(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-2xl">{icon}</span>
              <h2 className="text-xl font-bold text-gray-900">Chi tiết nhóm {profileName}</h2>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              {description}
            </p>

            <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100">
              <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                Tiêu chuẩn phân loại tự động
              </h4>
              <ul className="space-y-2 text-xs text-gray-600">
                <li className="flex items-start gap-1.5">
                  <span className="font-semibold text-gray-800 min-w-[90px]">Burned Out:</span>
                  <span>Căng thẳng Cao, Ngủ &lt; 6.5h, Học tập &gt; 8h/ngày.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-semibold text-gray-800 min-w-[90px]">Couch Scholar:</span>
                  <span>Căng thẳng Vừa, Vận động &lt; 1h, GPA &lt; 3.0.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-semibold text-gray-800 min-w-[90px]">Overachiever:</span>
                  <span>GPA &gt;= 3.5, Học tập &gt; 7h, Căng thẳng Cao, Ngủ &lt; 7h.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-semibold text-gray-800 min-w-[90px]">Balanced:</span>
                  <span>Căng thẳng Thấp/Vừa, Ngủ 7-9h, Vận động &gt;= 1h.</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowExplanation(false)}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl text-sm transition-colors shadow-lg shadow-gray-900/10"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
