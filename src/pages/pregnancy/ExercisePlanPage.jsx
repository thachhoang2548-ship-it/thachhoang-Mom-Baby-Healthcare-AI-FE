import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../../store/profileStore';
import { pregnancyApi } from '../../api/pregnancyApi';
import TierGate from '../../components/layout/TierGate';
import { ArrowLeft, Footprints, AlertCircle, Dumbbell, ShieldAlert, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExercisePlanPage() {
  const navigate = useNavigate();
  const { momProfile } = useProfileStore();
  const [exercisePlan, setExercisePlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExercisePlan();
  }, [momProfile]);

  const loadExercisePlan = async () => {
    setLoading(true);
    try {
      const res = await pregnancyApi.getExercisePlan();
      if (res.isSuccess && res.data) {
        setExercisePlan(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải bài tập khuyến nghị');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/pregnancy')}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại nhật ký thai kỳ
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-pink-50 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Dumbbell className="w-5 h-5 text-momGreen" />
            Luyện Tập An Toàn Mẹ Bầu
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Các bài tập yoga nhẹ nhàng, giãn cơ cơ bản theo tam cá nguyệt đề xuất bởi chuyên gia y tế
          </p>
        </div>
      </div>

      <TierGate requiredTier="MomHienDai">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main exercise plan list */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-pink-100/50 dark:border-gray-700 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-extrabold text-gray-800 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-momGreen" />
                Lộ trình tập của mami (Tam cá nguyệt {exercisePlan?.trimester || 1})
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                Nhịp độ chậm rãi, giữ thở đều, không nín thở hoặc căng cơ quá mức
              </p>
            </div>

            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-14 bg-gray-200 dark:bg-gray-755 rounded-xl"></div>
                <div className="h-14 bg-gray-200 dark:bg-gray-755 rounded-xl"></div>
              </div>
            ) : exercisePlan?.exercises ? (
              <div className="space-y-3">
                {exercisePlan.exercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-green-50/20 dark:bg-gray-850 rounded-2xl border border-green-100/30 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-800 dark:text-gray-200">
                        {idx + 1}. {ex.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">
                        Khuyến nghị: {ex.reps} • Thời gian: {ex.duration}
                      </p>
                    </div>
                    <span className="text-xl">🧘‍♀️</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-gray-400 italic">
                Không tìm thấy bài tập thích hợp cho giai đoạn này.
              </div>
            )}
          </div>

          {/* Safe workouts advice */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-pink-100/50 dark:border-gray-700 shadow-sm space-y-4 self-start">
            <h3 className="text-xs font-bold text-gray-850 dark:text-white flex items-center gap-1.5 pb-2 border-b border-pink-50 dark:border-gray-700">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Nguyên Tắc Luyện Tập An Toàn
            </h3>

            <ul className="text-[11px] text-gray-600 dark:text-gray-300 space-y-2.5 leading-relaxed font-semibold">
              <li className="flex items-start gap-1.5">
                <span className="text-red-500 font-bold">•</span>
                <span>Luôn luôn uống nước trước, trong và sau khi tập để tránh mất nước, tăng thân nhiệt.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-red-500 font-bold">•</span>
                <span>Tránh các tư thế nằm ngửa sau tuần thai thứ 16 để không ép vào tĩnh mạch chủ dưới cản lưu thông máu lên tim.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-red-500 font-bold">•</span>
                <span>Dừng tập ngay lập tức nếu xuất hiện các triệu chứng: chóng mặt, đau đầu, co thắt tử cung, hoặc rỉ nước ối.</span>
              </li>
            </ul>

            <div className="bg-red-50/50 p-3.5 rounded-xl border border-red-100 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-red-800 font-bold leading-normal">
                Tham khảo ý kiến của bác sĩ phụ khoa trước khi thực hiện bất cứ bài tập vận động thể chất nào trong thai kỳ.
              </p>
            </div>
          </div>

        </div>
      </TierGate>

    </div>
  );
}
