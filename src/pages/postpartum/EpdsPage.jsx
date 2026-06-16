import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postpartumApi } from '../../api/postpartumApi';
import TierGate from '../../components/layout/TierGate';
import { Sparkles, Heart, Award, ArrowRight, Shield, PhoneCall, HelpCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EpdsPage() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const questions = [
    {
      text: 'Tôi có thể cười và nhìn thấy mặt tốt của mọi thứ...',
      options: [
        { label: 'Như thường lệ', score: 0 },
        { label: 'Ít hơn trước một chút', score: 1 },
        { label: 'Chắc chắn ít hơn trước nhiều', score: 2 },
        { label: 'Không hề', score: 3 }
      ]
    },
    {
      text: 'Tôi mong đợi mọi việc một cách vui vẻ...',
      options: [
        { label: 'Như trước đây', score: 0 },
        { label: 'Ít hơn trước đây một chút', score: 1 },
        { label: 'Chắc chắn ít hơn trước đây nhiều', score: 2 },
        { label: 'Hầu như không', score: 3 }
      ]
    },
    {
      text: 'Tôi đổ lỗi cho bản thân một cách không cần thiết khi mọi việc diễn ra không thuận lợi...',
      options: [
        { label: 'Phần lớn thời gian', score: 3 },
        { label: 'Đôi khi', score: 2 },
        { label: 'Hiếm khi', score: 1 },
        { label: 'Không bao giờ', score: 0 }
      ]
    },
    {
      text: 'Tôi lo lắng hoặc băn khoăn mà không có lý do chính đáng...',
      options: [
        { label: 'Không hề', score: 0 },
        { label: 'Đôi khi', score: 1 },
        { label: 'Thường xuyên', score: 2 },
        { label: 'Rất thường xuyên', score: 3 }
      ]
    },
    {
      text: 'Tôi cảm thấy sợ hãi hoặc hoảng sợ mà không có lý do chính đáng...',
      options: [
        { label: 'Có, khá nhiều', score: 3 },
        { label: 'Có, đôi khi', score: 2 },
        { label: 'Không, không nhiều lắm', score: 1 },
        { label: 'Không, không hề', score: 0 }
      ]
    },
    {
      text: 'Mọi việc dường như quá tải đối với tôi...',
      options: [
        { label: 'Có, hầu hết thời gian tôi không thể đối phó', score: 3 },
        { label: 'Có, đôi khi tôi không thể đối phó tốt như trước', score: 2 },
        { label: 'Không, hầu hết thời gian tôi đều đối phó tốt', score: 1 },
        { label: 'Không, tôi vẫn đối phó tốt như trước đây', score: 0 }
      ]
    },
    {
      text: 'Tôi cảm thấy không hạnh phúc đến mức khó ngủ...',
      options: [
        { label: 'Có, hầu hết thời gian', score: 3 },
        { label: 'Có, thường xuyên', score: 2 },
        { label: 'Hiếm khi', score: 1 },
        { label: 'Không hề', score: 0 }
      ]
    },
    {
      text: 'Tôi cảm thấy buồn bã hoặc tồi tệ...',
      options: [
        { label: 'Có, hầu hết thời gian', score: 3 },
        { label: 'Có, khá thường xuyên', score: 2 },
        { label: 'Thỉnh thoảng', score: 1 },
        { label: 'Không hề', score: 0 }
      ]
    },
    {
      text: 'Tôi cảm thấy không hạnh phúc đến mức khóc...',
      options: [
        { label: 'Có, hầu hết thời gian', score: 3 },
        { label: 'Có, khá thường xuyên', score: 2 },
        { label: 'Chỉ thỉnh thoảng', score: 1 },
        { label: 'Không hề', score: 0 }
      ]
    },
    {
      text: 'Ý nghĩ làm hại bản thân đã xuất hiện trong tâm trí tôi...',
      options: [
        { label: 'Có, khá thường xuyên', score: 3 },
        { label: 'Đôi khi', score: 2 },
        { label: 'Hầu như không bao giờ', score: 1 },
        { label: 'Không bao giờ', score: 0 }
      ]
    }
  ];

  const handleSelectOption = async (score) => {
    const nextAnswers = [...answers];
    nextAnswers[currentIdx] = score;
    setAnswers(nextAnswers);

    if (currentIdx < 9) {
      // Short delay for user to register their click, then advance
      setTimeout(() => {
        setCurrentIdx((prev) => prev + 1);
      }, 250);
    } else {
      // Submit immediately on final question selection
      await submitSurvey(nextAnswers);
    }
  };

  const submitSurvey = async (finalAnswers) => {
    setLoading(true);
    try {
      const res = await postpartumApi.submitEpds(finalAnswers);
      if (res.isSuccess && res.data) {
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
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-2 sm:p-4 bg-gradient-to-tr from-pink-50/20 via-purple-50/30 to-indigo-50/20">
        <div className="max-w-xl w-full">
          
          {/* Active Question screen */}
          {!result && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-pink-100/50 dark:border-gray-750 shadow-sm space-y-6">
              
              {/* Step indicator */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  <span>Khảo sát tâm lý EPDS</span>
                  <span>Câu {currentIdx + 1} / 10</span>
                </div>
                <div className="w-full h-1.5 bg-pink-100/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-momPink to-momPurple transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Progress question text */}
              <div className="min-h-[90px] flex items-center pt-2">
                <h3 className="text-base sm:text-lg font-black text-gray-850 dark:text-white leading-relaxed">
                  {questions[currentIdx].text}
                </h3>
              </div>

              {/* Options list */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                {questions[currentIdx].options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(opt.score)}
                    disabled={loading}
                    className="w-full text-left px-5 py-4 border border-pink-50 dark:border-gray-700 hover:border-momPink hover:bg-momPink-light/20 dark:bg-gray-750 rounded-2xl text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-250 transition-all duration-200 active:scale-98 shadow-sm flex justify-between items-center min-h-[50px]"
                  >
                    <span>{opt.label}</span>
                    <ArrowRight className="w-4.5 h-4.5 text-gray-300 hover:text-momPink shrink-0" />
                  </button>
                ))}
              </div>

              {/* Bottom Muted Notice */}
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold text-center italic leading-relaxed">
                * Mami vui lòng chọn câu trả lời đúng nhất với cảm xúc trong suốt 7 ngày qua.
              </p>
            </div>
          )}

          {/* Results screen */}
          {result && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-pink-100/50 dark:border-gray-750 shadow-sm space-y-6 animate-fade-in">
              <div className="text-center">
                <span className="text-[10px] font-black uppercase bg-pink-100/60 text-momPink-dark px-3 py-1 rounded-full">
                  Kết quả đánh giá
                </span>
                <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-wider mt-3">
                  Điểm số EPDS: {result.score} / 30
                </h2>
              </div>

              {/* Result card categorization */}
              {result.score < 10 ? (
                // Safe state
                <div className="bg-green-50/70 border border-green-200 p-5 rounded-2xl text-green-900 space-y-2 dark:bg-green-950/20 dark:border-green-900/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h3 className="text-sm font-black uppercase">Tuyệt vời! Bạn đang làm rất tốt 💚</h3>
                  </div>
                  <p className="text-xs leading-relaxed font-semibold text-green-800 dark:text-green-300">
                    Sức khỏe tinh thần của bạn đang ở trạng thái tốt. Hãy tiếp tục duy trì việc nghỉ ngơi hợp lý, vận động nhẹ nhàng và chia sẻ cảm xúc với người thân nhé!
                  </p>
                </div>
              ) : result.score <= 12 ? (
                // Watch state
                <div className="bg-amber-50/70 border border-amber-250 p-5 rounded-2xl text-amber-900 space-y-2 dark:bg-amber-950/20 dark:border-amber-900/30">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-600" />
                    <h3 className="text-sm font-black uppercase">Hãy chú ý đến cảm xúc của bạn 💛</h3>
                  </div>
                  <p className="text-xs leading-relaxed font-semibold text-amber-850 dark:text-amber-300">
                    Điểm số của mami nằm ở mức cận biên lo âu. Hãy dành thêm thời gian thư giãn bản thân, tham gia các buổi đi bộ thư thái và thử đánh giá lại sau 1 tuần.
                  </p>
                </div>
              ) : (
                // Critical state (EPDS >= 13) - Trauma informed design: soft pink layout, no harsh red.
                <div className="bg-pink-50/80 border border-pink-200 p-5 rounded-2xl text-pink-900 space-y-4 dark:bg-pink-950/20 dark:border-pink-900/35">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500 animate-pulse shrink-0" />
                    <h3 className="text-sm font-black uppercase text-pink-700 dark:text-pink-300">
                      Bạn đang rất dũng cảm khi chia sẻ điều này 💙
                    </h3>
                  </div>
                  
                  {/* AI Empathetic message */}
                  <div className="text-xs font-semibold leading-relaxed text-pink-850 dark:text-pink-200 italic bg-white/50 dark:bg-gray-900/30 p-3.5 rounded-xl border border-pink-100/30">
                    "{result.aiMessage}"
                  </div>

                  {/* Hotlines */}
                  <div className="p-3 bg-pink-100/50 dark:bg-pink-900/20 rounded-xl border border-pink-200/40 flex items-center gap-3">
                    <PhoneCall className="w-5 h-5 text-pink-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-pink-800 dark:text-pink-300 font-bold uppercase">Hotline Hỗ Trợ Sức Khỏe Tâm Thần</p>
                      <p className="text-sm font-extrabold text-pink-950 dark:text-white">1800 599 920 (Miễn phí)</p>
                    </div>
                  </div>

                  {/* Telehealth booking */}
                  <button
                    onClick={() => {
                      toast.success('Đang kết nối lịch hẹn tư vấn telehealth với Bác sĩ sản phụ khoa... 🩺');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-momPurple text-white text-xs font-extrabold rounded-xl transition hover:opacity-95 shadow-md active:scale-95"
                  >
                    Kết nối với chuyên gia ngay
                  </button>
                </div>
              )}

              {/* Tips for all levels */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Khuyến nghị tự chăm sóc tâm lý:</h4>
                <ul className="space-y-2 text-xs text-gray-650 dark:text-gray-300 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-momPink mt-0.5">•</span>
                    <span>Dành ít nhất 15 phút mỗi ngày làm điều mami thích (nghe nhạc, tắm nước ấm).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-momPink mt-0.5">•</span>
                    <span>Hãy nhờ người thân chia sẻ công việc chăm bé hoặc thay tã ban đêm để mami có giấc ngủ sâu hơn.</span>
                  </li>
                </ul>
              </div>

              {/* Exit button */}
              <button
                onClick={() => navigate('/postpartum')}
                className="w-full py-3 border border-pink-150 text-momPink hover:bg-pink-50 text-xs font-bold rounded-xl transition duration-300 text-center block"
              >
                Quay lại Trang Hậu Sản
              </button>
            </div>
          )}
          
        </div>
      </div>
    </TierGate>
  );
}
