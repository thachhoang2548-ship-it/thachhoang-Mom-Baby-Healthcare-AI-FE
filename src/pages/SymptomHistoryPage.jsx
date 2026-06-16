import React, { useEffect } from "react";
import { useSymptomStore } from "../store/symptomStore";
import { Link } from "react-router-dom";
import { ChevronLeft, Calendar, FileImage, ShieldAlert } from "lucide-react";

export default function SymptomHistoryPage() {
  const { history, fetchHistory } = useSymptomStore();

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const baseUrl = import.meta.env.VITE_NODE_API_URL || "http://localhost:5000";
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Format date relative or simple local date
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    
    // Relative formatting fallback
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  // Urgency badge colors
  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case "Khẩn cấp":
        return "bg-red-50 text-red-700 border-red-200";
      case "Cao":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Trung bình":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "Thấp":
      default:
        return "bg-green-50 text-green-700 border-green-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Back Link Header */}
        <header className="space-y-2">
          <Link
            to="/symptoms"
            className="inline-flex items-center gap-1 text-xs font-black text-amber-500 hover:text-amber-600 transition-colors"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
            Quay lại phân tích
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Lịch sử phân tích triệu chứng
            </h1>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-black text-gray-500 border border-gray-200/50">
              Tổng số: {history.length}
            </span>
          </div>
        </header>

        {/* History List */}
        {history.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-3xl select-none">
              📁
            </div>
            <div>
              <h3 className="font-extrabold text-gray-800 text-base">Chưa có lịch sử phân tích</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Tất cả các triệu chứng y khoa bạn gửi phân tích sẽ được lưu trữ an toàn tại đây để theo dõi dài hạn.
              </p>
            </div>
            <Link
              to="/symptoms"
              className="inline-block px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-white font-bold text-xs rounded-full shadow-sm hover:shadow"
            >
              Thực hiện phân tích ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => {
              const result = item.analysisResult;
              const hasImage = item.imageUrl ? true : false;
              
              return (
                <div 
                  key={item._id}
                  className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex gap-4 items-start flex-grow overflow-hidden">
                    {/* Image Thumbnail if exists */}
                    {hasImage ? (
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                        <img 
                          src={getImageUrl(item.imageUrl)} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-500 border border-amber-100/55">
                        <FileImage className="w-6 h-6" />
                      </div>
                    )}

                    <div className="space-y-1 overflow-hidden">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(item.createdAt)}
                        </span>
                        {result?.urgencyLevel && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${getUrgencyBadge(result.urgencyLevel)}`}>
                            {result.urgencyLevel}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-relaxed">
                        {item.textDescription}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/symptoms/${item._id}`}
                    className="self-end md:self-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-full border border-gray-200/50 transition-colors shadow-sm whitespace-nowrap"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
