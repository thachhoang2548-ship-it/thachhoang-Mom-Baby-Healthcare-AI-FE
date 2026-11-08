import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import postpartumService from '../../../models/services/postpartumService';
import TierGate from '../../components/layout/TierGate';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Heart,
  Loader2,
  PhoneCall,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function EpdsPage() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  // Khóa nhận đáp án trong lúc chuyển câu hoặc đang gửi: mỗi câu chỉ nhận MỘT lựa chọn
  const lockRef = useRef(false);
  const timerRef = useRef(null);

  // Hủy bộ đếm chuyển câu khi rời trang
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const questions = [
    {
      text: 'Tôi có thể cười và nhìn thấy mặt tốt của mọi thứ...',
      options: [
        { label: 'Như thường lệ', score: 0 },
        { label: 'Ít hơn trước một chút', score: 1 },
        { label: 'Chắc chắn ít hơn trước nhiều', score: 2 },
        { label: 'Không hề', score: 3 },
      ],
    },
    {
      text: 'Tôi mong đợi mọi việc một cách vui vẻ...',
      options: [
        { label: 'Như trước đây', score: 0 },
        { label: 'Ít hơn trước đây một chút', score: 1 },
        { label: 'Chắc chắn ít hơn trước đây nhiều', score: 2 },
        { label: 'Hầu như không', score: 3 },
      ],
    },
    {
      text: 'Tôi đổ lỗi cho bản thân một cách không cần thiết khi mọi việc diễn ra không thuận lợi...',
      options: [
        { label: 'Phần lớn thời gian', score: 3 },
        { label: 'Đôi khi', score: 2 },
        { label: 'Hiếm khi', score: 1 },
        { label: 'Không bao giờ', score: 0 },
      ],
    },
    {
      text: 'Tôi lo lắng hoặc băn khoăn mà không có lý do chính đáng...',
      options: [
        { label: 'Không hề', score: 0 },
        { label: 'Đôi khi', score: 1 },
        { label: 'Thường xuyên', score: 2 },
        { label: 'Rất thường xuyên', score: 3 },
      ],
    },
    {
      text: 'Tôi cảm thấy sợ hãi hoặc hoảng sợ mà không có lý do chính đáng...',
      options: [
        { label: 'Có, khá nhiều', score: 3 },
        { label: 'Có, đôi khi', score: 2 },
        { label: 'Không, không nhiều lắm', score: 1 },
        { label: 'Không, không hề', score: 0 },
      ],
    },
    {
      text: 'Mọi việc dường như quá tải đối với tôi...',
      options: [
        { label: 'Có, hầu hết thời gian tôi không thể đối phó', score: 3 },
        { label: 'Có, đôi khi tôi không thể đối phó tốt như trước', score: 2 },
        { label: 'Không, hầu hết thời gian tôi đều đối phó tốt', score: 1 },
        { label: 'Không, tôi vẫn đối phó tốt như trước đây', score: 0 },
      ],
    },
    {
      text: 'Tôi cảm thấy không hạnh phúc đến mức khó ngủ...',
      options: [
        { label: 'Có, hầu hết thời gian', score: 3 },
        { label: 'Có, thường xuyên', score: 2 },
        { label: 'Hiếm khi', score: 1 },
        { label: 'Không hề', score: 0 },
      ],
    },
    {
      text: 'Tôi cảm thấy buồn bã hoặc tồi tệ...',
      options: [
        { label: 'Có, hầu hết thời gian', score: 3 },
        { label: 'Có, khá thường xuyên', score: 2 },
        { label: 'Thỉnh thoảng', score: 1 },
        { label: 'Không hề', score: 0 },
      ],
    },
    {
      text: 'Tôi cảm thấy không hạnh phúc đến mức khóc...',
      options: [
        { label: 'Có, hầu hết thời gian', score: 3 },
        { label: 'Có, khá thường xuyên', score: 2 },
        { label: 'Chỉ thỉnh thoảng', score: 1 },
        { label: 'Không hề', score: 0 },
      ],
    },
    {
      text: 'Ý nghĩ làm hại bản thân đã xuất hiện trong tâm trí tôi...',
      options: [
        { label: 'Có, khá thường xuyên', score: 3 },
        { label: 'Đôi khi', score: 2 },
        { label: 'Hầu như không bao giờ', score: 1 },
        { label: 'Không bao giờ', score: 0 },
      ],
    },
  ];

  const handleSelectOption = async (score) => {
    // Bỏ qua lần bấm thứ hai khi đang chuyển câu hoặc đang gửi (bấm nhanh, nhấn giữ phím)
    if (lockRef.current || loading) return;
    lockRef.current = true;

    const nextAnswers = [...answers];
    nextAnswers[currentIdx] = score;
    setAnswers(nextAnswers);

    if (currentIdx < 9) {
      timerRef.current = setTimeout(() => {
        setCurrentIdx((prev) => prev + 1);
        lockRef.current = false;
      }, 200);
      return;
    }

    // Câu cuối: chỉ gửi khi đã trả lời đủ 10 câu; không bao giờ gửi giá trị mặc định cho câu bỏ trống
    const firstMissing = nextAnswers.findIndex((a) => a === null);
    if (firstMissing !== -1) {
      setCurrentIdx(firstMissing);
      toast.error('Mẹ vui lòng trả lời đủ 10 câu trước khi gửi.');
      lockRef.current = false;
      return;
    }

    try {
      await submitSurvey(nextAnswers);
    } finally {
      lockRef.current = false;
    }
  };

  const submitSurvey = async (finalAnswers) => {
    setLoading(true);
    try {
      const res = await postpartumService.submitEpds(finalAnswers);
      if (res && res.isSuccess && res.data) {
        setResult(res.data);
      } else {
        toast.error('Gửi khảo sát không thành công');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối khi gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TierGate requiredTier="MomHienDai">
      <div className="font-display rounded-3xl bg-theme-page p-4 sm:p-6 border border-theme-line min-h-[85vh] flex flex-col justify-between space-y-6">
        {/* Nút quay lại đầu trang */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/postpartum')}
            className="inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-2xl border border-theme-line bg-theme-surface hover:bg-theme-sidebar text-xs sm:text-sm font-semibold text-theme-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Quay lại trang Sức khỏe của mẹ</span>
          </button>
        </div>

        {/* Khung nội dung chính */}
        <div className="flex-1 flex items-center justify-center py-4">
          <div className="max-w-xl w-full">
            {/* 1. Màn hình trả lời 10 câu hỏi */}
            {!result && (
              <div className="bg-theme-surface rounded-2xl p-6 sm:p-8 border border-theme-line shadow-sm space-y-6">
                {/* Header tiến độ */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-bold text-theme-muted">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-theme-brand" aria-hidden="true" />
                      <span>Khảo sát tâm lý EPDS</span>
                    </span>
                    <span>Câu {currentIdx + 1} / 10</span>
                  </div>
                  <div className="w-full h-2 bg-theme-sidebar rounded-full overflow-hidden border border-theme-line">
                    <div
                      className="h-full bg-theme-brand rounded-full transition-all duration-300 motion-reduce:transition-none"
                      style={{ width: `${((currentIdx + 1) / 10) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Tiêu đề câu hỏi */}
                <div className="min-h-[80px] flex items-center pt-1">
                  <h2 className="text-base sm:text-lg font-bold text-theme-ink leading-relaxed">
                    {questions[currentIdx].text}
                  </h2>
                </div>

                {/* Danh sách 4 lựa chọn */}
                <div className="grid grid-cols-1 gap-2.5">
                  {questions[currentIdx].options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSelectOption(opt.score)}
                      onKeyDown={(e) => {
                        // Giữ Enter/Space (auto-repeat) không được tự chọn câu kế tiếp: mỗi câu cần một lần nhấn mới
                        if (e.repeat) e.preventDefault();
                      }}
                      disabled={loading}
                      className="w-full text-left px-4 py-3.5 border border-theme-line bg-theme-page hover:bg-theme-sidebar hover:border-theme-brand rounded-2xl text-xs sm:text-sm font-semibold text-theme-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand flex justify-between items-center min-h-[48px] disabled:opacity-50"
                    >
                      <span className="leading-snug pr-3">{opt.label}</span>
                      <ArrowRight className="w-4 h-4 text-theme-muted shrink-0" aria-hidden="true" />
                    </button>
                  ))}
                </div>

                {loading && (
                  <div className="flex items-center justify-center gap-2 pt-2 text-xs font-bold text-theme-muted">
                    <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    <span>Đang tổng hợp kết quả đánh giá...</span>
                  </div>
                )}

                <p className="text-xs text-theme-muted font-medium text-center leading-relaxed">
                  * Mami vui lòng chọn câu trả lời đúng nhất với cảm xúc trong suốt 7 ngày qua.
                </p>
              </div>
            )}

            {/* 2. Màn hình kết quả đánh giá EPDS */}
            {result && (
              <div className="bg-theme-surface rounded-2xl p-6 sm:p-8 border border-theme-line shadow-sm space-y-6">
                <div className="text-center space-y-2">
                  <span className="inline-block text-xs font-bold bg-theme-brand-soft text-theme-brand px-3.5 py-1 rounded-full">
                    Kết quả đánh giá
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-theme-ink">
                    Điểm số EPDS: {result.score} / 30
                  </h2>
                </div>

                {/* Phân nhánh điểm số: < 10 (tốt) vs >= 10 (cần lưu ý) */}
                {result.score < 10 ? (
                  <div className="rounded-2xl border border-status-ok/30 bg-theme-page p-5 text-theme-ink space-y-2.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-status-ok shrink-0" aria-hidden="true" />
                      <h3 className="text-sm sm:text-base font-bold text-theme-ink">
                        Bạn đang làm rất tốt
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed text-theme-muted">
                      Sức khỏe tinh thần của bạn đang ở trạng thái tốt. Hãy tiếp tục duy trì việc nghỉ ngơi hợp lý, vận động nhẹ nhàng và chia sẻ cảm xúc với người thân nhé!
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-status-warn-line bg-status-warn-bg p-5 text-status-warn-text space-y-4">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-status-warn-text shrink-0" aria-hidden="true" />
                      <h3 className="text-sm sm:text-base font-bold">
                        Bạn đang rất dũng cảm khi chia sẻ điều này
                      </h3>
                    </div>

                    {result.aiMessage && (
                      <div className="text-xs sm:text-sm font-medium leading-relaxed bg-theme-surface p-4 rounded-2xl border border-theme-line text-theme-ink">
                        &ldquo;{result.aiMessage}&rdquo;
                      </div>
                    )}

                    <div className="p-3.5 bg-theme-surface/70 rounded-2xl border border-status-warn-line flex items-center gap-3">
                      <PhoneCall className="w-5 h-5 text-status-warn-text shrink-0" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-bold text-status-warn-text">Hotline Hỗ Trợ Sức Khỏe Tâm Thần</p>
                        <p className="text-sm font-bold text-theme-ink">1800 599 920 (Miễn phí)</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        toast.success('Đang kết nối lịch hẹn tư vấn telehealth với Bác sĩ sản phụ khoa...');
                      }}
                      className="w-full min-h-[44px] py-3 bg-theme-ink hover:bg-theme-brand text-theme-surface text-xs sm:text-sm font-bold rounded-2xl shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                    >
                      Kết nối với chuyên gia ngay
                    </button>
                  </div>
                )}

                {/* Khuyến nghị tự chăm sóc tâm lý */}
                <div className="space-y-2.5 pt-2 border-t border-theme-line">
                  <h3 className="text-xs font-bold text-theme-ink">Khuyến nghị tự chăm sóc tâm lý:</h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-theme-muted font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-theme-brand font-bold">•</span>
                      <span>Dành ít nhất 15 phút mỗi ngày làm điều mami thích (nghe nhạc, tắm nước ấm).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-theme-brand font-bold">•</span>
                      <span>Hãy nhờ người thân chia sẻ công việc chăm bé hoặc thay tã ban đêm để mami có giấc ngủ sâu hơn.</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/postpartum')}
                  className="w-full min-h-[44px] py-3 border border-theme-line bg-theme-surface hover:bg-theme-sidebar text-xs sm:text-sm font-bold text-theme-ink rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                >
                  Quay lại Trang Hậu Sản
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </TierGate>
  );
}
