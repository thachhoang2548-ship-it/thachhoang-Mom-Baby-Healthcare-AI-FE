import React, { useState } from "react";
import api from "../services/api";

const EPDS_QUESTIONS = [
  { id: 1, text: "Tôi có thể cười và nhìn thấy khía cạnh hài hước của mọi việc:", options: ["Luôn luôn", "Không nhiều lắm", "Thỉnh thoảng", "Hoàn toàn không"] },
  { id: 2, text: "Tôi cảm thấy mong đợi được thưởng thức các sự việc sắp tới:", options: ["Nhiều như trước đây", "Ít hơn một chút", "Chắc chắn ít hơn", "Hầu như không"] },
  { id: 3, text: "Tôi đổ lỗi cho bản thân một cách vô cớ khi mọi việc không suôn sẻ:", options: ["Không bao giờ", "Thỉnh thoảng", "Hầu như luôn luôn", "Luôn luôn"] },
  { id: 4, text: "Tôi hay lo lắng hoặc băn khoăn mà không có lý do chính đáng:", options: ["Không, hoàn toàn không", "Thỉnh thoảng", "Có, thường xuyên", "Rất thường xuyên"] },
  { id: 5, text: "Tôi cảm thấy hoảng sợ hoặc lo sợ không có lý do chính đáng:", options: ["Không bao giờ", "Hiếm khi", "Thỉnh thoảng", "Rất thường xuyên"] },
  { id: 6, text: "Mọi việc dường như quá sức đối với tôi:", options: ["Không, tôi giải quyết tốt", "Thỉnh thoảng tôi giải quyết tốt", "Có, hầu như tôi không giải quyết nổi", "Luôn luôn như vậy"] },
  { id: 7, text: "Tôi không vui đến mức mất ngủ:", options: ["Không, hoàn toàn không", "Thỉnh thoảng", "Có, khá thường xuyên", "Rất thường xuyên"] },
  { id: 8, text: "Tôi cảm thấy buồn bã hoặc thảm hại:", options: ["Không bao giờ", "Thỉnh thoảng", "Khá thường xuyên", "Hầu như luôn luôn"] },
  { id: 9, text: "Tôi không vui đến mức khóc lóc:", options: ["Không bao giờ", "Thỉnh thoảng", "Khá thường xuyên", "Hầu như luôn luôn"] },
  { id: 10, text: "Ý nghĩ làm hại bản thân xuất hiện trong đầu tôi:", options: ["Không bao giờ", "Hiếm khi", "Thỉnh thoảng", "Thường xuyên"] }
];

export default function PostpartumCarePage() {
  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [simAlerts, setSimAlerts] = useState([]);

  const handleSelectOption = (qIdx, optIdx) => {
    const nextAnswers = [...answers];
    nextAnswers[qIdx] = optIdx;
    setAnswers(nextAnswers);
  };

  const calculateEpds = async () => {
    // Check if all questions are answered
    if (answers.includes(null)) {
      alert("Mẹ vui lòng trả lời đầy đủ 10 câu hỏi để nhận kết quả chính xác nhất.");
      return;
    }

    // Standard scoring: 0-3 points per question.
    // For simplicity, we sum the indices (which represent 0 to 3 points).
    const totalScore = answers.reduce((sum, val) => sum + val, 0);
    setScore(totalScore);
    setSubmitted(true);

    try {
      // Post score to daily monitoring
      const payload = {
        date: new Date(),
        steps: 6000,
        epdsScore: totalScore,
        mood: { score: 3, note: `Làm bài test EPDS sàng lọc trầm cảm: ${totalScore} điểm` }
      };

      await api.post("/daily-monitoring", payload);

      // Fetch alerts to see if BR05 triggers warning
      const res = await api.get("/daily-monitoring/lifestyle-alerts");
      setSimAlerts(res.data.alerts || []);
    } catch (err) {
      console.error("EPDS submission failed", err);
    }
  };

  const resetForm = () => {
    setAnswers(Array(10).fill(null));
    setSubmitted(false);
    setScore(0);
    setSimAlerts([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 font-display">
      <header className="mb-8 bg-gradient-to-r from-pink-400 to-indigo-400 text-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-extrabold">Sức Khỏe Tinh Thần Sau Sinh</h1>
        <p className="mt-2 text-indigo-50 max-w-xl text-sm leading-relaxed">
          Tầm soát trầm cảm sau sinh định kỳ bằng thang đo EPDS quốc tế. Hãy chia sẻ thật lòng trạng thái cảm xúc của mẹ để được bảo vệ kịp thời.
        </p>
      </header>

      {!submitted ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-150 dark:border-gray-700 space-y-6">
          <div className="border-b border-gray-150 pb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Bảng tự đánh giá EPDS</h2>
            <p className="text-xs text-gray-500 mt-1">Vui lòng chọn phương án mô tả đúng nhất cảm xúc của mẹ trong 7 ngày qua.</p>
          </div>

          <div className="space-y-6">
            {EPDS_QUESTIONS.map((q, qIdx) => (
              <div key={q.id} className="space-y-2">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Câu {q.id}: {q.text}
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(qIdx, optIdx)}
                      className={`text-left text-xs py-2.5 px-4 rounded-lg border transition-all ${
                        answers[qIdx] === optIdx
                          ? "bg-primary border-primary text-white font-bold"
                          : "border-gray-250 hover:bg-gray-50 dark:border-gray-750 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={calculateEpds}
            className="w-full py-3 bg-primary text-white font-extrabold rounded-lg hover:bg-pink-600 transition shadow-md mt-8"
          >
            Hoàn tất đánh giá
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-150 dark:border-gray-700 space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-950 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl text-primary">assessment</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kết quả đánh giá: {score} / 30 điểm</h2>
            <p className="text-xs text-gray-500 mt-1">Đã được ghi nhận vào biểu đồ tâm lý của mẹ.</p>
          </div>

          {/* Trigger Alert warning if score >= 13 */}
          {score >= 13 ? (
            <div className="p-5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-left max-w-lg mx-auto">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-red-650 mt-0.5">warning</span>
                <div>
                  <h3 className="text-sm font-bold text-red-700 dark:text-red-400">Cảnh báo Trầm cảm Sau sinh (BR05)</h3>
                  <p className="text-xs text-red-800 dark:text-red-300 mt-1 leading-relaxed">
                    Điểm EPDS của mẹ đạt mức <strong>{score} điểm (ngưỡng nguy cơ cao &ge; 13)</strong>. Điều này cho thấy mẹ đang chịu đựng áp lực tâm lý quá mức cần được hỗ trợ.
                  </p>
                  <p className="text-xs text-red-750 dark:text-red-300 mt-2 font-bold">
                    Khuyến nghị: Mẹ nên chia sẻ ngay với người thân, hạn chế ở một mình và đặt lịch tham vấn tâm lý hoặc gặp bác sĩ tâm thần tại viện sản/nhi gần nhất.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <a href="tel:19001234" className="px-3 py-1.5 bg-red-600 hover:bg-red-750 text-white rounded text-[11px] font-bold shadow-sm transition">
                      Gọi Tổng đài Hỗ trợ Sức khỏe
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl text-left max-w-lg mx-auto">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
                <div>
                  <h3 className="text-sm font-bold text-green-700 dark:text-green-400">Tâm lý ổn định</h3>
                  <p className="text-xs text-green-850 dark:text-green-300 mt-1 leading-relaxed">
                    Điểm EPDS của mẹ là <strong>{score} điểm (an toàn &lt; 13)</strong>. Mẹ đang kiểm soát căng thẳng tốt. Hãy tiếp tục dành thời gian nghỉ ngơi và trò chuyện cùng trợ lý AI khi cần nhé.
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={resetForm}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 rounded-lg text-xs font-semibold"
          >
            Làm lại bài kiểm tra
          </button>
        </div>
      )}
    </div>
  );
}
