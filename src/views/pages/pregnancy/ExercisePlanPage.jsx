import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileController } from '../../../controllers/profileController';
import { useAuthController } from '../../../controllers/authController';
import { checkTierUnlocked } from '../../../utils/tierHelpers';
import pregnancyService from '../../../models/services/pregnancyService';
import TierGate from '../../components/layout/TierGate';
import { ArrowLeft, AlertCircle, Dumbbell, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExercisePlanPage() {
  const navigate = useNavigate();
  const { momProfile, fetchProfile } = useProfileController();
  const { tier } = useAuthController();
  const [exercisePlan, setExercisePlan] = useState(null);
  const [emptyMessage, setEmptyMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadExercisePlan = useCallback(async () => {
    setLoading(true);
    try {
      if (!checkTierUnlocked(tier, 'MomHienDai')) {
        setExercisePlan(null);
        setEmptyMessage('');
        return;
      }

      const profile = momProfile || (await fetchProfile());
      const isPregnant = profile?.stage === 'Pregnant' || profile?.stage === 1;
      if (!isPregnant) {
        setExercisePlan(null);
        setEmptyMessage(
          'Vui lòng chuyển hồ sơ sang giai đoạn đang mang thai để xem bài tập phù hợp.'
        );
        return;
      }

      const res = await pregnancyService.getExercisePlan();
      if (res.isSuccess && res.data) {
        setExercisePlan(res.data);
        setEmptyMessage('');
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải bài tập khuyến nghị');
    } finally {
      setLoading(false);
    }
  }, [tier, momProfile, fetchProfile]);

  useEffect(() => {
    loadExercisePlan();
  }, [loadExercisePlan]);

  return (
    <div className="space-y-6 pb-8 font-display text-theme-ink">
      <button
        type="button"
        onClick={() => navigate('/pregnancy')}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 text-sm font-semibold text-theme-muted transition-colors hover:bg-theme-surface hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Quay lại nhật ký thai kỳ</span>
      </button>

      <div className="border-b border-theme-line pb-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-status-ok/15 px-3.5 py-1 text-xs font-semibold text-status-ok">
          <Dumbbell className="h-3.5 w-3.5" />
          Vận động thai kỳ
        </span>
        <h1 className="mt-2 text-2xl font-bold text-theme-ink sm:text-3xl">
          Luyện tập an toàn cho mẹ bầu
        </h1>
        <p className="mt-1 text-sm text-theme-muted">
          Các bài tập giãn cơ và hít thở nhẹ nhàng được gợi ý theo từng tam cá nguyệt.
        </p>
      </div>

      <TierGate requiredTier="MomHienDai">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main exercise plan list */}
          <section className="space-y-5 rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm sm:p-8 lg:col-span-8">
            <div className="border-b border-theme-line pb-4">
              <h2 className="flex items-center gap-2 text-xl font-bold text-theme-ink">
                <Sparkles className="h-5 w-5 text-theme-brand" />
                <span>Lộ trình vận động (Tam cá nguyệt {exercisePlan?.trimester || 1})</span>
              </h2>
              <p className="mt-1 text-xs font-medium text-theme-muted sm:text-sm">
                Tập với nhịp độ chậm rãi, hít thở đều đặn, không nín thở hoặc căng cơ quá mức.
              </p>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-16 rounded-2xl bg-theme-page" />
                <div className="h-16 rounded-2xl bg-theme-page" />
                <div className="h-16 rounded-2xl bg-theme-page" />
              </div>
            ) : exercisePlan?.exercises?.length ? (
              <div className="space-y-3">
                {exercisePlan.exercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-theme-line bg-theme-page/60 p-4 sm:p-5"
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-theme-brand-soft text-sm font-bold text-theme-ink">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-theme-ink">{ex.name}</h3>
                        <p className="mt-1 text-xs font-semibold text-theme-muted sm:text-sm">
                          Khuyến nghị: {ex.reps} · Thời gian: {ex.duration}
                        </p>
                      </div>
                    </div>
                    <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-status-ok/15 text-status-ok sm:flex">
                      <Activity className="h-5 w-5" />
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 rounded-2xl border border-dashed border-theme-line bg-theme-page/40 px-6 py-10 text-center">
                <p className="mx-auto max-w-md text-sm font-medium text-theme-muted">
                  {emptyMessage || 'Chưa tìm thấy bài tập phù hợp cho giai đoạn hiện tại.'}
                </p>
                {emptyMessage && (
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-theme-brand px-6 py-2.5 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                  >
                    Cập nhật hồ sơ thai kỳ
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Safe workouts advice */}
          <aside className="space-y-4 self-start rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm lg:col-span-4">
            <div className="flex items-center gap-2 border-b border-theme-line pb-3.5">
              <ShieldAlert className="h-5 w-5 shrink-0 text-status-warn-text" />
              <h2 className="text-base font-bold text-theme-ink sm:text-lg">
                Nguyên tắc luyện tập an toàn
              </h2>
            </div>

            <ul className="space-y-3 text-sm leading-relaxed text-theme-ink/90">
              <li className="flex items-start gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-theme-brand" />
                <span>
                  Luôn uống đủ nước trước, trong và sau khi tập để tránh mất nước hoặc tăng thân nhiệt.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-theme-brand" />
                <span>
                  Tránh các tư thế nằm ngửa phẳng sau tuần thai thứ 16 để không chèn ép tĩnh mạch chủ dưới.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-theme-brand" />
                <span>
                  Dừng tập ngay nếu xuất hiện dấu hiệu chóng mặt, đau đầu, khó thở, co thắt tử cung hoặc rỉ ối.
                </span>
              </li>
            </ul>

            <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />
              <p className="text-xs font-semibold leading-relaxed text-red-900 sm:text-sm">
                Tham khảo ý kiến bác sĩ sản khoa trước khi bắt đầu bất kỳ bài tập vận động thể chất nào trong thai kỳ.
              </p>
            </div>
          </aside>
        </div>
      </TierGate>
    </div>
  );
}
