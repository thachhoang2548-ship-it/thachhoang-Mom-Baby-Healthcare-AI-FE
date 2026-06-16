import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../../store/profileStore';
import { Heart, Calendar, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JourneySetupPage() {
  const navigate = useNavigate();
  const { setupPregnancyJourney, updateProfile } = useProfileStore();
  const [step, setStep] = useState(1);
  const [selectedStage, setSelectedStage] = useState(null); // 'PrePregnancy', 'Pregnant', 'Postpartum'
  const [lmpDate, setLmpDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStageSelect = (stage) => {
    setSelectedStage(stage);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedStage === 'Pregnant') {
        if (!lmpDate) {
          toast.error('Vui lòng chọn ngày đầu kỳ kinh cuối cùng (LMP)');
          setLoading(false);
          return;
        }
        await setupPregnancyJourney(lmpDate);
        toast.success('Thiết lập hành trình thai kỳ thành công! 🤰');
        navigate('/pregnancy');
      } else if (selectedStage === 'PrePregnancy') {
        if (!lmpDate) {
          toast.error('Vui lòng chọn ngày kinh gần nhất');
          setLoading(false);
          return;
        }
        await updateProfile({
          stage: 0,
          lastPeriodDate: lmpDate,
          avgCycleLength: Number(cycleLength),
        });
        toast.success('Thiết lập mục tiêu chuẩn bị mang thai thành công! 🌸');
        navigate('/fertility');
      } else if (selectedStage === 'Postpartum') {
        if (!deliveryDate) {
          toast.error('Vui lòng nhập ngày sinh em bé');
          setLoading(false);
          return;
        }
        await updateProfile({
          stage: 2,
          deliveryDate: deliveryDate,
        });
        toast.success('Chúc mừng mami và bé yêu! 👶');
        navigate('/baby-nutrition');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi thiết lập hành trình');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-pink-100 via-pink-50 to-purple-100 p-4 font-sans">
      <div className="w-full max-w-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/50">
        
        {/* Progress Bar */}
        <div className="w-full bg-pink-100 dark:bg-gray-700 h-1.5 rounded-full mb-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-momPink to-momPurple h-full transition-all duration-500"
            style={{ width: step === 1 ? '50%' : '100%' }}
          ></div>
        </div>

        {step === 1 ? (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-xl font-extrabold bg-gradient-to-r from-momPink-dark to-momPurple-dark bg-clip-text text-transparent uppercase tracking-wide">
                Hành trình của Mami
              </h2>
              <p className="text-xs text-gray-505 dark:text-gray-400 font-bold mt-1">
                Lựa chọn cột mốc hiện tại để nhận các gợi ý sức khỏe tối ưu
              </p>
            </div>

            {/* Stage selection cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Pre-Pregnancy Card */}
              <button
                type="button"
                onClick={() => handleStageSelect('PrePregnancy')}
                className="group p-5 bg-white border border-pink-100 hover:border-momPink rounded-2xl text-center shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-momPink flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🌸
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-800">Chuẩn Bị</h3>
                  <p className="text-[10px] text-gray-400 mt-1 font-semibold leading-relaxed">
                    Theo dõi lịch rụng trứng và tính ngày thụ thai thụ động
                  </p>
                </div>
              </button>

              {/* Pregnant Card */}
              <button
                type="button"
                onClick={() => handleStageSelect('Pregnant')}
                className="group p-5 bg-white border border-pink-100 hover:border-momPink rounded-2xl text-center shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-momPurple flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🤰
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-800">Đang Mang Thai</h3>
                  <p className="text-[10px] text-gray-400 mt-1 font-semibold leading-relaxed">
                    Theo dõi bé phát triển theo tuần, dinh dưỡng, vận động
                  </p>
                </div>
              </button>

              {/* Postpartum Card */}
              <button
                type="button"
                onClick={() => handleStageSelect('Postpartum')}
                className="group p-5 bg-white border border-pink-100 hover:border-momPink rounded-2xl text-center shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-green-50 text-momGreen flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  👶
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-800">Sau Sinh</h3>
                  <p className="text-[10px] text-gray-400 mt-1 font-semibold leading-relaxed">
                    Chăm sóc mẹ sau sinh, trầm cảm EPDS, theo dõi chỉ số bé
                  </p>
                </div>
              </button>

            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Back Arrow */}
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-gray-600 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>

            <div className="text-center mb-4">
              <h3 className="text-base font-extrabold text-gray-800">
                {selectedStage === 'PrePregnancy' && '🌸 Thông tin Chuẩn Bị Mang Thai'}
                {selectedStage === 'Pregnant' && '🤰 Thông tin Thai Kỳ'}
                {selectedStage === 'Postpartum' && '👶 Thông tin Sau Sinh'}
              </h3>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Các chỉ số này giúp AI tính toán lịch trình chăm sóc chính xác nhất
              </p>
            </div>

            {/* Sub-Forms depending on selected stage */}
            {selectedStage === 'PrePregnancy' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Ngày đầu kỳ kinh gần nhất
                  </label>
                  <input
                    type="date"
                    required
                    value={lmpDate}
                    onChange={(e) => setLmpDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-momPink/30 focus:border-momPink text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Chu kỳ kinh trung bình (ngày)
                  </label>
                  <select
                    value={cycleLength}
                    onChange={(e) => setCycleLength(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-momPink/30 focus:border-momPink text-xs font-semibold"
                  >
                    {[...Array(23)].map((_, i) => (
                      <option key={i} value={20 + i}>
                        {20 + i} ngày
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {selectedStage === 'Pregnant' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Ngày đầu kỳ kinh cuối cùng (LMP)
                  </label>
                  <input
                    type="date"
                    required
                    value={lmpDate}
                    onChange={(e) => setLmpDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-momPink/30 focus:border-momPink text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {selectedStage === 'Postpartum' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Ngày sinh bé yêu
                  </label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-momPink/30 focus:border-momPink text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-momPink/25 transform active:scale-95 transition-all duration-300 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  Bắt đầu ngay <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>
        )}
      </div>
    </div>
  );
}
