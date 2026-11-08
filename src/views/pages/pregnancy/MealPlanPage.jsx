import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileController } from '../../../controllers/profileController';
import pregnancyService from '../../../models/services/pregnancyService';
import TierGate from '../../components/layout/TierGate';
import ScientificEvidenceFooter from '../../components/common/ScientificEvidenceFooter';
import { ArrowLeft, Utensils, Sun, Coffee, Moon, Soup } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MealPlanPage() {
  const navigate = useNavigate();
  const { momProfile } = useProfileController();
  const [mealPlan, setMealPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  const loadMealPlan = useCallback(async () => {
    setLoading(true);
    try {
      // Không có tuần trong hồ sơ thì để server tự tính từ ngày kinh cuối
      const week = momProfile?.pregnancyWeek || null;
      const res = await pregnancyService.getMealPlan(week);
      // ApiResponse của backend trả về "success" (không phải "isSuccess")
      if ((res.success || res.isSuccess) && res.data) {
        setMealPlan(res.data);
      } else if (res.message) {
        toast.error(res.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải thực đơn dinh dưỡng thai kỳ');
    } finally {
      setLoading(false);
    }
  }, [momProfile?.pregnancyWeek]);

  useEffect(() => {
    loadMealPlan();
  }, [loadMealPlan]);

  const currentPlan = mealPlan[activeDay];
  const nutrients = currentPlan?.dailyNutrients;

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
        <span className="inline-flex items-center gap-1.5 rounded-full bg-theme-brand-soft px-3.5 py-1 text-xs font-semibold text-theme-ink">
          <Utensils className="h-3.5 w-3.5 text-theme-brand" />
          Dinh dưỡng thai kỳ
        </span>
        <h1 className="mt-2 text-2xl font-bold text-theme-ink sm:text-3xl">
          Thực đơn dinh dưỡng 7 ngày
        </h1>
        <p className="mt-1 text-sm text-theme-muted">
          Thực đơn món Việt gần gũi, giàu Folate, Sắt và Canxi theo tuần thai của mẹ.
        </p>
      </div>

      <TierGate requiredTier="MomHienDai">
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4 rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm sm:p-8">
              <div className="h-6 w-1/3 rounded-md bg-theme-page" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="h-28 rounded-2xl bg-theme-page" />
                <div className="h-28 rounded-2xl bg-theme-page" />
                <div className="h-28 rounded-2xl bg-theme-page" />
                <div className="h-28 rounded-2xl bg-theme-page" />
              </div>
            </div>
          ) : mealPlan.length > 0 && currentPlan ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Day selection tabs */}
              <div
                className="flex flex-row gap-2 overflow-x-auto pb-1 lg:col-span-3 lg:flex-col lg:pb-0"
                role="tablist"
                aria-label="Chọn ngày trong tuần"
              >
                {mealPlan.map((plan, idx) => {
                  const selected = activeDay === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setActiveDay(idx)}
                      className={`min-h-[46px] shrink-0 rounded-2xl border px-4 py-2.5 text-left text-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                        selected
                          ? 'border-theme-brand bg-theme-brand text-theme-surface shadow-sm'
                          : 'border-theme-line bg-theme-surface text-theme-ink hover:border-theme-brand/40 hover:bg-theme-brand-soft'
                      }`}
                    >
                      {plan.day || `Ngày ${idx + 1}`}
                    </button>
                  );
                })}
              </div>

              {/* Day detailed menus */}
              <div className="space-y-6 rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm sm:p-8 lg:col-span-9">
                <div className="border-b border-theme-line pb-4">
                  <h2 className="text-xl font-bold text-theme-ink">
                    Chi tiết thực đơn {currentPlan.day || `Ngày ${activeDay + 1}`}
                  </h2>
                  <p className="mt-1 text-xs font-medium text-theme-muted sm:text-sm">
                    Thực phẩm tươi sạch, chế biến chín kỹ để đảm bảo an toàn cho mẹ và thai nhi.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-theme-line bg-theme-page/60 p-4 sm:p-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-theme-brand-soft px-3 py-1 text-xs font-bold text-theme-ink">
                      <Sun className="h-3.5 w-3.5 text-theme-brand" />
                      Bữa sáng
                    </span>
                    <p className="mt-3 text-sm font-semibold leading-relaxed text-theme-ink sm:text-base">
                      {currentPlan.breakfast}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-theme-line bg-theme-page/60 p-4 sm:p-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-status-ok/15 px-3 py-1 text-xs font-bold text-status-ok">
                      <Soup className="h-3.5 w-3.5" />
                      Bữa trưa
                    </span>
                    <p className="mt-3 text-sm font-semibold leading-relaxed text-theme-ink sm:text-base">
                      {currentPlan.lunch}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-theme-line bg-theme-page/60 p-4 sm:p-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-status-warn-bg px-3 py-1 text-xs font-bold text-status-warn-text">
                      <Coffee className="h-3.5 w-3.5" />
                      Bữa phụ chiều
                    </span>
                    <p className="mt-3 text-sm font-semibold leading-relaxed text-theme-ink sm:text-base">
                      {currentPlan.snack}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-theme-line bg-theme-page/60 p-4 sm:p-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-theme-sidebar px-3 py-1 text-xs font-bold text-theme-ink border border-theme-line">
                      <Moon className="h-3.5 w-3.5 text-theme-brand" />
                      Bữa tối
                    </span>
                    <p className="mt-3 text-sm font-semibold leading-relaxed text-theme-ink sm:text-base">
                      {currentPlan.dinner}
                    </p>
                  </div>
                </div>

                {/* Nutrients indicators */}
                {nutrients && (
                  <div className="border-t border-theme-line pt-5">
                    <h3 className="mb-3 text-xs font-bold text-theme-muted sm:text-sm">
                      Tổng quan dinh dưỡng ước tính trong ngày
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                      <div className="rounded-2xl border border-theme-line bg-theme-page/50 p-3 text-center">
                        <span className="block text-xs font-medium text-theme-muted">Năng lượng</span>
                        <span className="mt-1 block text-sm font-bold text-theme-ink">
                          {nutrients.calories || nutrients.Calories} kcal
                        </span>
                      </div>
                      <div className="rounded-2xl border border-theme-line bg-theme-page/50 p-3 text-center">
                        <span className="block text-xs font-medium text-theme-muted">Chất đạm</span>
                        <span className="mt-1 block text-sm font-bold text-theme-ink">
                          {nutrients.protein || nutrients.Protein}
                        </span>
                      </div>
                      <div className="rounded-2xl border border-theme-line bg-theme-page/50 p-3 text-center">
                        <span className="block text-xs font-medium text-theme-muted">Tinh bột &amp; xơ</span>
                        <span className="mt-1 block text-sm font-bold text-theme-ink">
                          {nutrients.carbs || nutrients.Carbs}
                        </span>
                      </div>
                      <div className="rounded-2xl border border-theme-line bg-theme-page/50 p-3 text-center">
                        <span className="block text-xs font-medium text-theme-muted">Chất béo</span>
                        <span className="mt-1 block text-sm font-bold text-theme-ink">
                          {nutrients.fat || nutrients.Fat}
                        </span>
                      </div>
                      <div className="col-span-2 rounded-2xl border border-theme-brand/25 bg-theme-brand-soft/60 p-3 text-center sm:col-span-1">
                        <span className="block text-xs font-medium text-theme-ink">Sắt (Iron)</span>
                        <span className="mt-1 block text-sm font-bold text-theme-brand">
                          {nutrients.iron || nutrients.Iron || '15mg'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-theme-line bg-theme-surface px-6 py-14 text-center shadow-sm">
              <Utensils className="mb-3 h-8 w-8 text-theme-muted" />
              <p className="text-sm font-semibold text-theme-ink">
                Chưa tải được dữ liệu thực đơn thai kỳ lúc này
              </p>
              <p className="mt-1 text-xs text-theme-muted">
                Mẹ hãy kiểm tra lại tuần thai trong Hồ sơ của mẹ hoặc thử lại sau ít phút.
              </p>
            </div>
          )}
        </div>
      </TierGate>

      {/* Bảo chứng khoa học thực đơn thai kỳ (WHO & USDA) */}
      <ScientificEvidenceFooter variant="menu-addon" />
    </div>
  );
}
