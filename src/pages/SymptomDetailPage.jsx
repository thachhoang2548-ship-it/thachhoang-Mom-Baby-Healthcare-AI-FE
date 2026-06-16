import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSymptomStore } from "../store/symptomStore";
import AnalysisResult from "../components/symptom/AnalysisResult";
import { ChevronLeft, Calendar, FileText, RefreshCw, AlertCircle } from "lucide-react";

export default function SymptomDetailPage() {
  const { id } = useParams();
  const { fetchAnalysisById } = useSymptomStore();
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const baseUrl = import.meta.env.VITE_NODE_API_URL || "http://localhost:5000";
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  useEffect(() => {
    const loadAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAnalysisById(id);
        if (data) {
          setAnalysis(data);
        } else {
          setError("Không thể tìm thấy kết quả phân tích này.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải chi tiết phân tích triệu chứng.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadAnalysis();
    }
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Back Link Header */}
        <header className="space-y-2">
          <Link
            to="/symptoms/history"
            className="inline-flex items-center gap-1 text-xs font-black text-amber-500 hover:text-amber-600 transition-colors"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
            Quay lại lịch sử
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Chi tiết phân tích triệu chứng
          </h1>
        </header>

        {isLoading ? (
          /* Loading indicator */
          <div className="bg-white border border-gray-100 rounded-3xl p-12 shadow-sm text-center">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-500">Đang tải báo cáo phân tích...</p>
          </div>
        ) : error ? (
          /* Error display */
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">Lỗi tải dữ liệu</h3>
              <p className="text-xs text-gray-500 mt-1">{error}</p>
              <Link
                to="/symptoms/history"
                className="inline-block mt-4 text-xs font-black text-amber-500 underline"
              >
                Quay lại lịch sử
              </Link>
            </div>
          </div>
        ) : (
          /* Report Body */
          <div className="space-y-6">
            
            {/* Symptom Input Recap */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Được gửi vào: {formatDate(analysis.createdAt)}
                </span>
                <span className="text-[10px] font-black text-amber-500 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full uppercase">
                  Báo cáo y khoa
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-semibold text-gray-700 leading-relaxed">
                    {analysis.textDescription}
                  </p>
                </div>

                {analysis.imageUrl && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-gray-400 block mb-2">Hình ảnh đính kèm:</span>
                    <div className="max-w-sm rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                      <img
                        src={getImageUrl(analysis.imageUrl)}
                        alt="Symptom visual"
                        className="w-full h-auto object-cover max-h-[300px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Result Visualizer */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider">
                Kết quả chẩn đoán sơ bộ
              </h3>
              <AnalysisResult analysis={analysis} />
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
