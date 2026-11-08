import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileController } from '../../../controllers/profileController';
import { Heart, Calendar, Baby, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import momOiLogo from '../../../assets/Logo/mom-oi-submark-cropped.png';

export default function JourneySetupPage() {
  const navigate = useNavigate();
  const { setupPregnancyJourney, updateProfile } = useProfileController();
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
        toast.success('Thiết lập hành trình thai kỳ thành công!');
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
        toast.success('Thiết lập mục tiêu chuẩn bị mang thai thành công!');
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
        toast.success('Thiết lập hồ sơ sau sinh thành công!');
        navigate('/baby-nutrition');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi thiết lập hành trình');
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    {
      key: 'PrePregnancy',
      title: 'Chuẩn bị mang thai',
      desc: 'Theo dõi lịch rụng trứng và cửa sổ thụ thai tự nhiên',
      icon: Calendar,
      tone: 'bg-theme-brand-soft text-theme-brand',
    },
    {
      key: 'Pregnant',
      title: 'Đang mang thai',
      desc: 'Theo dõi bé phát triển theo tuần, dinh dưỡng và vận động',
      icon: Heart,
      tone: 'bg-status-warn-bg text-status-warn-text',
    },
    {
      key: 'Postpartum',
      title: 'Sau sinh & nuôi con',
      desc: 'Hồi phục sức khỏe mẹ, sàng lọc EPDS và ăn dặm cho bé',
      icon: Baby,
      tone: 'bg-status-ok/15 text-status-ok',
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-theme-page p-4 font-display text-theme-ink sm:p-6">
      <div className="w-full max-w-2xl rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm sm:p-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src={momOiLogo}
              alt="Mom Ơi!"
              className="h-10 w-10 rounded-full border border-theme-line object-cover"
            />
            <span className="font-brand text-2xl font-extrabold leading-none text-theme-brand">
              Mom Ơi!
            </span>
          </div>
          <span className="text-xs font-bold text-theme-muted">Bước {step} / 2</span>
        </div>

        <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-theme-page border border-theme-line">
          <div
            className="h-full rounded-full bg-theme-brand transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

        {step === 1 ? (
          <div>
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-theme-ink sm:text-3xl">
                Mẹ đang ở cột mốc nào?
              </h1>
              <p className="mt-1.5 text-sm text-theme-muted sm:text-base">
                Chọn giai đoạn hiện tại để Mom Ơi! sắp xếp công cụ theo dõi phù hợp nhất.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {stages.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleStageSelect(item.key)}
                    className="flex flex-col items-start gap-3 rounded-2xl border border-theme-line bg-theme-page/50 p-5 text-left transition-colors hover:border-theme-brand hover:bg-theme-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                  >
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h2 className="text-base font-bold text-theme-ink">{item.title}</h2>
                      <p className="mt-1 text-xs leading-relaxed text-theme-muted">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 text-sm font-semibold text-theme-muted hover:bg-theme-page hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Chọn lại giai đoạn</span>
            </button>

            <div>
              <h2 className="text-xl font-bold text-theme-ink sm:text-2xl">
                {selectedStage === 'PrePregnancy' && 'Thông tin chuẩn bị mang thai'}
                {selectedStage === 'Pregnant' && 'Thông tin thai kỳ của mẹ'}
                {selectedStage === 'Postpartum' && 'Thông tin sau sinh của mẹ và bé'}
              </h2>
              <p className="mt-1 text-sm text-theme-muted">
                Các mốc ngày này giúp hệ thống tính toán lịch chăm sóc chính xác hơn.
              </p>
            </div>

            {selectedStage === 'PrePregnancy' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="setup-lmp-pre" className="mb-1.5 block text-sm font-semibold text-theme-ink">
                    Ngày đầu kỳ kinh gần nhất
                  </label>
                  <input
                    id="setup-lmp-pre"
                    type="date"
                    required
                    value={lmpDate}
                    onChange={(e) => setLmpDate(e.target.value)}
                    className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-semibold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
                  />
                </div>
                <div>
                  <label htmlFor="setup-cycle" className="mb-1.5 block text-sm font-semibold text-theme-ink">
                    Chu kỳ kinh trung bình (ngày)
                  </label>
                  <select
                    id="setup-cycle"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(Number(e.target.value))}
                    className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-semibold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
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
              <div>
                <label htmlFor="setup-lmp-preg" className="mb-1.5 block text-sm font-semibold text-theme-ink">
                  Ngày đầu kỳ kinh cuối cùng (LMP)
                </label>
                <input
                  id="setup-lmp-preg"
                  type="date"
                  required
                  value={lmpDate}
                  onChange={(e) => setLmpDate(e.target.value)}
                  className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-semibold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
                />
              </div>
            )}

            {selectedStage === 'Postpartum' && (
              <div>
                <label htmlFor="setup-delivery" className="mb-1.5 block text-sm font-semibold text-theme-ink">
                  Ngày sinh bé
                </label>
                <input
                  id="setup-delivery"
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-semibold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-theme-brand px-6 py-3 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-theme-line disabled:text-theme-muted"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <span>Hoàn tất thiết lập</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
