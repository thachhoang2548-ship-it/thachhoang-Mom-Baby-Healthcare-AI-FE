import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSymptomController } from "../../controllers/symptomController";
import AnalysisResult from "../components/Symptom/AnalysisResult";
import { ChevronLeft, Calendar, FileText, RefreshCw, AlertCircle } from "lucide-react";

const ASSET_BASE_URL =
  import.meta.env.VITE_NODE_API_URL || "https://momoi-api-production.up.railway.app";

export default function SymptomDetailPage() {
  const { id } = useParams();
  const { fetchAnalysisById } = useSymptomController();
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    return `${ASSET_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
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
          setError("Không tìm thấy kết quả phân tích này.");
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
  }, [id, fetchAnalysisById]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-8 font-display text-theme-ink">
      <header className="space-y-3 border-b border-theme-line pb-5">
        <Link
          to="/symptoms/history"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-theme-muted transition-colors hover:bg-theme-surface hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Quay lại lịch sử</span>
        </Link>
        <h1 className="text-2xl font-bold text-theme-ink sm:text-3xl">
          Chi tiết bản ghi triệu chứng
        </h1>
      </header>

      {isLoading ? (
        <div className="rounded-3xl border border-theme-line bg-theme-surface p-12 text-center shadow-sm">
          <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-theme-brand" />
          <p className="text-sm font-semibold text-theme-muted">Đang tải bản ghi triệu chứng...</p>
        </div>
      ) : error ? (
        <div className="flex items-start gap-3.5 rounded-3xl border border-status-danger-line bg-status-danger-bg p-6">
          <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-status-danger-text" />
          <div>
            <h2 className="text-base font-bold text-status-danger-text">Không thể mở bản ghi</h2>
            <p className="mt-1 text-sm text-status-danger-text">{error}</p>
            <Link
              to="/symptoms/history"
              className="mt-4 inline-flex min-h-[40px] items-center text-sm font-bold text-status-danger-text underline"
            >
              Quay lại danh sách lịch sử
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Symptom Input Recap */}
          <section className="space-y-4 rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-theme-line pb-3.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-muted sm:text-sm">
                <Calendar className="h-4 w-4 text-theme-brand" />
                Ghi nhận lúc: {formatDate(analysis.createdAt)}
              </span>
              <span className="rounded-full bg-theme-brand-soft px-3 py-1 text-xs font-bold text-theme-ink">
                Hồ sơ triệu chứng
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-theme-muted" />
                <p className="text-sm font-medium leading-relaxed text-theme-ink sm:text-base">
                  {analysis.textDescription}
                </p>
              </div>

              {analysis.imageUrl && (
                <div className="pt-1">
                  <span className="mb-2 block text-xs font-bold text-theme-muted">
                    Hình ảnh đính kèm:
                  </span>
                  <div className="max-w-sm overflow-hidden rounded-2xl border border-theme-line bg-theme-page">
                    <img
                      src={getImageUrl(analysis.imageUrl)}
                      alt="Hình ảnh triệu chứng"
                      className="max-h-[300px] w-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Analysis Result */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-theme-ink">Kết quả phân tích tham khảo</h2>
            <AnalysisResult analysis={analysis} />
          </section>
        </div>
      )}
    </div>
  );
}
