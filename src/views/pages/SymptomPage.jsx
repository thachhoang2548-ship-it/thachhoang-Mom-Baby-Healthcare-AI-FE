import React, { useEffect, useRef } from "react";
import { useSymptomController } from "../../controllers/symptomController";
import ImageDropzone from "../components/Symptom/ImageDropzone";
import AnalysisResult from "../components/Symptom/AnalysisResult";
import DoctorConsultationCard from "../components/Symptom/DoctorConsultationCard";
import { Link } from "react-router-dom";
import { Stethoscope, History, RefreshCw } from "lucide-react";

export default function SymptomPage() {
  const {
    currentAnalysis,
    isAnalyzing,
    uploadedImage,
    textDescription,
    history,
    setTextDescription,
    setUploadedImage,
    removeImage,
    submitAnalysis,
    clearCurrent,
  } = useSymptomController();

  const resultRef = useRef(null);

  useEffect(() => {
    if (currentAnalysis && resultRef.current) {
      const prefersReducedMotion =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const behavior = prefersReducedMotion ? "auto" : "smooth";
      const scrollableParent = resultRef.current.closest(".overflow-y-auto");
      if (scrollableParent) {
        scrollableParent.scrollTo({
          top: resultRef.current.offsetTop - 24,
          behavior,
        });
      } else {
        resultRef.current.scrollIntoView({ behavior, block: "start" });
      }
    }
  }, [currentAnalysis]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitAnalysis();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-8 font-display text-theme-ink">
      {/* Header Section */}
      <header className="flex flex-col justify-between gap-4 border-b border-theme-line pb-5 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-theme-brand-soft px-3.5 py-1 text-xs font-semibold text-theme-ink">
            <Stethoscope className="h-3.5 w-3.5 text-theme-brand" />
            Sàng lọc ban đầu
          </span>
          <h1 className="mt-2 text-2xl font-bold text-theme-ink sm:text-3xl">
            Kiểm tra triệu chứng
          </h1>
          <p className="mt-1 text-sm text-theme-muted">
            Mô tả biểu hiện của mẹ hoặc bé (kèm ảnh chụp nếu có) để nhận hướng dẫn theo dõi tham khảo.
          </p>
        </div>

        <Link
          to="/symptoms/history"
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 self-start rounded-full border border-theme-line bg-theme-surface px-4 py-2 text-sm font-bold text-theme-ink transition-colors hover:border-theme-brand/40 hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:self-center"
        >
          <History className="h-4 w-4 text-theme-brand" />
          <span>Lịch sử ({history?.length ? history.length : "Xem"})</span>
        </Link>
      </header>

      {/* Doctor Advisory Banner */}
      <DoctorConsultationCard variant="banner" />

      {/* Input Form Card */}
      <section className="space-y-5 rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm sm:p-7">
        <div className="flex items-center justify-between gap-3 border-b border-theme-line pb-4">
          <h2 className="text-lg font-bold text-theme-ink">Mô tả biểu hiện cần kiểm tra</h2>
          {currentAnalysis && (
            <button
              type="button"
              onClick={clearCurrent}
              className="inline-flex min-h-[38px] items-center rounded-full border border-theme-line bg-theme-page px-3.5 py-1 text-xs font-bold text-theme-ink hover:border-theme-brand/40 hover:text-theme-brand"
            >
              Nhập trường hợp mới
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label htmlFor="symptom-description" className="text-sm font-semibold text-theme-ink">
                Chi tiết triệu chứng (ít nhất 10 ký tự)
              </label>
              <span className="text-xs font-medium text-theme-muted">
                {textDescription.length}/1000
              </span>
            </div>
            <textarea
              id="symptom-description"
              rows={4}
              maxLength={1000}
              placeholder="Ví dụ: Bé 8 tháng tuổi nổi mẩn hồng nhỏ ở hai bên má từ sáng nay, không sốt, vẫn bú bình thường..."
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
              className="w-full rounded-2xl border border-theme-line bg-theme-page/50 p-4 text-sm font-medium leading-relaxed text-theme-ink placeholder:text-theme-muted/70 focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
            />
          </div>

          <div>
            <p className="mb-1.5 text-sm font-semibold text-theme-ink">
              Hình ảnh chụp vùng biểu hiện (không bắt buộc)
            </p>
            <ImageDropzone
              value={uploadedImage}
              onChange={setUploadedImage}
              onRemove={removeImage}
            />
          </div>

          <button
            type="submit"
            disabled={isAnalyzing || textDescription.trim().length < 10}
            className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-theme-brand px-6 py-3 text-base font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-theme-line disabled:text-theme-muted"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Đang phân tích triệu chứng...</span>
              </>
            ) : (
              <>
                <Stethoscope className="h-5 w-5" />
                <span>Gửi phân tích tham khảo</span>
              </>
            )}
          </button>
        </form>
      </section>

      {/* Results Section */}
      {currentAnalysis && (
        <section ref={resultRef} className="scroll-mt-6 space-y-4 pt-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-theme-ink">Kết quả phân tích tham khảo</h2>
            <span className="rounded-full bg-status-ok/15 px-3 py-1 text-xs font-bold text-status-ok">
              Vừa cập nhật
            </span>
          </div>

          <AnalysisResult analysis={currentAnalysis} />
        </section>
      )}
    </div>
  );
}
