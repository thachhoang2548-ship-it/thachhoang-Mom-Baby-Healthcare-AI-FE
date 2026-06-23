import React, { useEffect, useRef } from "react";
import { useSymptomController } from "../../controllers/symptomController";
import ImageDropzone from "../components/symptom/ImageDropzone";
import AnalysisResult from "../components/symptom/AnalysisResult";
import { Link } from "react-router-dom";
import { Stethoscope, History, Sparkles, RefreshCw, ArrowRight } from "lucide-react";

export default function SymptomPage() {
  const {
    currentAnalysis,
    isAnalyzing,
    uploadedImage,
    textDescription,
    error,
    setTextDescription,
    setUploadedImage,
    removeImage,
    submitAnalysis,
    clearCurrent
  } = useSymptomController();

  const resultRef = useRef(null);

  // Smooth scroll to result section when currentAnalysis becomes available
  useEffect(() => {
    if (currentAnalysis && resultRef.current) {
      const scrollableParent = resultRef.current.closest('.overflow-y-auto');
      if (scrollableParent) {
        scrollableParent.scrollTo({
          top: resultRef.current.offsetTop - 24,
          behavior: "smooth"
        });
      } else {
        resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [currentAnalysis]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Keep history but clean current draft if wanted, or keep it. Let's keep it clean
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitAnalysis();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Header Section */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Stethoscope className="w-7 h-7 text-amber-500" />
              Phân tích triệu chứng
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
              Nhập triệu chứng của bạn và tải lên hình ảnh để AI phân tích.
            </p>
          </div>

          <Link
            to="/symptoms/history"
            className="px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <History className="w-4 h-4 text-gray-400" />
            Lịch sử ({useSymptomController.getState().history.length || "Xem"})
          </Link>
        </header>

        {/* Input Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <h2 className="font-bold text-base text-gray-900">Form Nhập Triệu Chứng</h2>
            {currentAnalysis && (
              <button
                type="button"
                onClick={clearCurrent}
                className="text-xs font-black text-amber-500 hover:text-amber-600 flex items-center gap-1"
              >
                Làm mới form
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Field 1: Text Description */}
            <div className="space-y-1.5 relative">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500">Mô tả triệu chứng của bạn</label>
                <span className="text-[10px] text-gray-400 font-semibold">{textDescription.length}/1000</span>
              </div>
              <textarea
                rows={4}
                maxLength={1000}
                placeholder="Ví dụ: Tôi bị phát ban dài dẳng trên cánh tay kèm ngứa ngáy dữ dội sau khi tiếp xúc với cỏ khô..."
                value={textDescription}
                onChange={(e) => setTextDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300 placeholder-gray-300"
              />
            </div>

            {/* Field 2: Image Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">Tải lên hình ảnh chụp triệu chứng (Nếu có)</label>
              <ImageDropzone
                value={uploadedImage}
                onChange={setUploadedImage}
                onRemove={removeImage}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAnalyzing || textDescription.trim().length < 10}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 disabled:bg-gray-100 text-white disabled:text-gray-400 font-extrabold rounded-full text-base transition-colors shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gửi phân tích
                </>
              )}
            </button>

          </form>
        </div>

        {/* Results Section */}
        {currentAnalysis && (
          <div ref={resultRef} className="pt-4 scroll-mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider">
                Kết quả phân tích y khoa AI
              </h3>
              <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                Mới nhất
              </span>
            </div>
            
            <AnalysisResult analysis={currentAnalysis} />
          </div>
        )}

      </div>
    </div>
  );
}
