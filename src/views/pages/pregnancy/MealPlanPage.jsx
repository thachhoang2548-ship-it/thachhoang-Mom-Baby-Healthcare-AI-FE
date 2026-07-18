import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileController } from '../../../controllers/profileController';
import pregnancyService from '../../../models/services/pregnancyService';
import TierGate from '../../components/layout/TierGate';
import { ArrowLeft, Utensils, Award, Smile, CheckCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MealPlanPage() {
  const navigate = useNavigate();
  const { momProfile } = useProfileController();
  const [mealPlan, setMealPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    loadMealPlan();
  }, [momProfile]);

  const loadMealPlan = async () => {
    setLoading(true);
    try {
      const week = momProfile?.pregnancyWeek || 12;
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
            <Utensils className="w-5 h-5 text-momPink" />
            Thực Đơn Dinh Dưỡng 7 Ngày
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Thực đơn mẹ bầu chuẩn Việt Nam giàu Folate, Sắt và Canxi theo tuần thai
          </p>
        </div>
      </div>

      <TierGate requiredTier="MomHienDai">
        <div className="space-y-6">
          
          {loading ? (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-pink-100/50 dark:border-gray-700 animate-pulse flex flex-col gap-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ) : mealPlan.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Day selection tabs */}
              <div className="lg:col-span-1 flex flex-row lg:flex-col overflow-x-auto gap-2 pb-2 lg:pb-0">
                {mealPlan.map((plan, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveDay(idx)}
                    className={`px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                      activeDay === idx
                        ? 'bg-momPink text-white shadow-md'
                        : 'bg-white hover:bg-pink-50/50 text-gray-500 border border-pink-100/50'
                    }`}
                  >
                    {plan.day || `Ngày ${idx + 1}`}
                  </button>
                ))}
              </div>

              {/* Day detailed menus */}
              <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-pink-100/50 dark:border-gray-700 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-800 dark:text-white flex items-center gap-1">
                    🍴 Chi tiết thực đơn {mealPlan[activeDay].day}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                    Thực phẩm tuyển chọn, nấu chín kỹ để bảo vệ bé yêu
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Sáng */}
                  <div className="p-4 bg-pink-50/20 rounded-xl border border-pink-100/35">
                    <span className="text-[9px] bg-pink-100 text-momPink-dark px-2 py-0.5 rounded font-extrabold uppercase">Bữa Sáng</span>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-2">
                      {mealPlan[activeDay].breakfast}
                    </p>
                  </div>

                  {/* Trưa */}
                  <div className="p-4 bg-purple-50/20 rounded-xl border border-purple-100/35">
                    <span className="text-[9px] bg-purple-100 text-momPurple-dark px-2 py-0.5 rounded font-extrabold uppercase">Bữa Trưa</span>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-2">
                      {mealPlan[activeDay].lunch}
                    </p>
                  </div>

                  {/* Chiều */}
                  <div className="p-4 bg-amber-50/20 rounded-xl border border-amber-100/35">
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-extrabold uppercase">Bữa Xế</span>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-2">
                      {mealPlan[activeDay].snack}
                    </p>
                  </div>

                  {/* Tối */}
                  <div className="p-4 bg-green-50/20 rounded-xl border border-green-100/35">
                    <span className="text-[9px] bg-green-100 text-momGreen-dark px-2 py-0.5 rounded font-extrabold uppercase">Bữa Tối</span>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-2">
                      {mealPlan[activeDay].dinner}
                    </p>
                  </div>

                </div>

                {/* Nutrients indicators */}
                {mealPlan[activeDay].dailyNutrients && (
                  <div className="pt-4 border-t border-pink-50 dark:border-gray-700">
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-2">Chất dinh dưỡng tổng quan trong ngày:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                      <div className="bg-gray-50 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-100 dark:border-gray-750">
                        <span className="text-[9px] text-gray-450 block font-bold">Năng lượng</span>
                        <span className="text-xs font-extrabold text-momPink-dark">{mealPlan[activeDay].dailyNutrients.calories || mealPlan[activeDay].dailyNutrients.Calories} Kcal</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-100 dark:border-gray-750">
                        <span className="text-[9px] text-gray-450 block font-bold">Chất đạm (Pro)</span>
                        <span className="text-xs font-extrabold text-momPurple-dark">{mealPlan[activeDay].dailyNutrients.protein || mealPlan[activeDay].dailyNutrients.Protein}</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-100 dark:border-gray-750">
                        <span className="text-[9px] text-gray-450 block font-bold">Chất xơ / Tinh bột</span>
                        <span className="text-xs font-extrabold text-momGreen-dark">{mealPlan[activeDay].dailyNutrients.carbs || mealPlan[activeDay].dailyNutrients.Carbs}</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-100 dark:border-gray-750">
                        <span className="text-[9px] text-gray-450 block font-bold">Chất béo (Fat)</span>
                        <span className="text-xs font-extrabold text-momAmber-dark">{mealPlan[activeDay].dailyNutrients.fat || mealPlan[activeDay].dailyNutrients.Fat}</span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-100 dark:border-gray-750">
                        <span className="text-[9px] text-gray-450 block font-bold">Sắt (Iron)</span>
                        <span className="text-xs font-extrabold text-red-500">{mealPlan[activeDay].dailyNutrients.iron || mealPlan[activeDay].dailyNutrients.Iron || '15mg'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-pink-100">
              <span className="text-3xl mb-2">🍽️</span>
              <p className="text-xs text-gray-500 font-semibold">
                Không thể lấy dữ liệu thực đơn thai kỳ lúc này. Vui lòng quay lại sau!
              </p>
            </div>
          )}

        </div>
      </TierGate>

    </div>
  );
}
