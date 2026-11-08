import React, { useState, useEffect, useCallback } from 'react';
import { useProfileController } from '../../../controllers/profileController';
import fertilityService from '../../../models/services/fertilityService';
import CycleCalendar from '../../components/fertility/CycleCalendar';
import newbornFeetPhoto from '../../../assets/editorial/newborn-feet-towel.jpg';
import { Calendar, Heart, Plus, Info, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FertilityPage() {
  const { momProfile, fetchProfile } = useProfileController();

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().substring(0, 7) // YYYY-MM
  );
  const [calendarData, setCalendarData] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);

  // Menstrual Log Form states
  const [logDate, setLogDate] = useState(new Date().toISOString().substring(0, 10));
  const [logLength, setLogLength] = useState(28);
  const [logSymptoms, setLogSymptoms] = useState([]);
  const [submittingLog, setSubmittingLog] = useState(false);

  const symptomOptions = [
    'Đau bụng dưới',
    'Căng tức ngực',
    'Mệt mỏi',
    'Thay đổi tâm trạng',
    'Mụn nội tiết',
  ];

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const loadCalendarData = useCallback(async (monthStr) => {
    try {
      const res = await fertilityService.getCalendar(monthStr);
      if (res.isSuccess && res.data) {
        setCalendarData(res.data);
      }
    } catch (err) {
      console.error('Failed to load calendar data:', err);
    }
  }, []);

  useEffect(() => {
    // Chỉ gọi API khi user đã có dữ liệu kinh nguyệt (tránh 400 Bad Request)
    if (momProfile?.lastPeriodDate) {
      loadCalendarData(selectedMonth);
    }
  }, [selectedMonth, momProfile?.lastPeriodDate, loadCalendarData]);

  const handleSymptomToggle = (symptom) => {
    if (logSymptoms.includes(symptom)) {
      setLogSymptoms(logSymptoms.filter((s) => s !== symptom));
    } else {
      setLogSymptoms([...logSymptoms, symptom]);
    }
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setSubmittingLog(true);
    try {
      const res = await fertilityService.logCycle(logDate, logLength, logSymptoms);
      if (res.isSuccess) {
        toast.success('Ghi nhận kỳ kinh thành công! Lịch dự đoán đã được cập nhật.');
        setShowLogModal(false);
        await fetchProfile();
        loadCalendarData(selectedMonth);
      } else {
        toast.error(res.message || 'Ghi nhận không thành công');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi ghi nhận kỳ kinh');
    } finally {
      setSubmittingLog(false);
    }
  };

  const getFertileCountdownText = () => {
    if (
      !calendarData ||
      !calendarData.fertileWindowDays ||
      calendarData.fertileWindowDays.length === 0
    ) {
      return 'Chưa có thông tin dự báo thụ thai. Mẹ hãy ghi nhận kỳ kinh gần nhất để bắt đầu.';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fertileDates = calendarData.fertileWindowDays
      .map((d) => new Date(d))
      .sort((a, b) => a - b);

    const isInWindow = fertileDates.some((d) => d.toDateString() === today.toDateString());
    if (isInWindow) {
      return 'Mẹ đang ở trong cửa sổ thụ thai thuận lợi nhất của chu kỳ này.';
    }

    const nextFertile = fertileDates.find((d) => d > today);
    if (!nextFertile) {
      return 'Cửa sổ thụ thai của tháng này đã qua. Mẹ hãy chuyển sang tháng tiếp theo để xem dự báo.';
    }

    const diffTime = nextFertile.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `Còn ${diffDays} ngày nữa đến cửa sổ thụ thai tiếp theo.`;
  };

  return (
    <div className="space-y-6 pb-8 font-display text-theme-ink">
      {/* Editorial Hero */}
      <section className="overflow-hidden rounded-3xl border border-theme-line bg-theme-surface shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="flex flex-col justify-between gap-5 p-5 sm:p-7 lg:col-span-8">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-theme-brand-soft px-3.5 py-1 text-xs font-bold text-theme-ink">
                <Heart className="h-3.5 w-3.5 text-theme-brand" />
                Chuẩn bị mang thai
              </span>
              <h1 className="text-2xl font-bold text-theme-ink sm:text-3xl">
                Theo dõi chu kỳ &amp; rụng trứng
              </h1>
              <p className="max-w-xl text-xs font-medium leading-relaxed text-theme-muted sm:text-sm">
                Quản lý lịch kinh nguyệt đều đặn để nhận biết thời điểm dễ thụ thai tự nhiên và chuẩn bị sức khỏe tiền sản.
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t border-theme-line pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 rounded-2xl border border-theme-line bg-theme-page px-4 py-2.5">
                <Sparkles className="h-5 w-5 shrink-0 text-theme-brand" />
                <div>
                  <p className="text-xs font-semibold text-theme-muted">Dự báo cửa sổ thụ thai</p>
                  <p className="text-xs font-bold text-theme-ink sm:text-sm">
                    {getFertileCountdownText()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLogModal(true)}
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-full bg-theme-brand px-5 py-2.5 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
              >
                <Plus className="h-4 w-4" />
                <span>Ghi nhận kỳ kinh</span>
              </button>
            </div>
          </div>

          <div className="border-t border-theme-line bg-theme-page p-2.5 lg:col-span-4 lg:border-l lg:border-t-0">
            <img
              src={newbornFeetPhoto}
              alt="Đôi bàn chân em bé trong khăn bông trắng ấm áp"
              className="h-44 w-full rounded-2xl object-cover sm:h-52 lg:h-full lg:min-h-[190px]"
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Cycle Calendar Column */}
        <div className="lg:col-span-8">
          <CycleCalendar
            profile={momProfile}
            calendarData={calendarData}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onUpdatePeriod={() => setShowLogModal(true)}
            onDateClick={(cell) => {
              const selectedDate = cell.date.toLocaleDateString('vi-VN');
              let status = 'Ngày bình thường trong chu kỳ';
              if (cell.isPeriod) status = 'Ngày hành kinh dự kiến';
              if (cell.isOvulation) status = 'Ngày dự kiến rụng trứng';
              if (cell.isFertile && !cell.isOvulation) status = 'Cửa sổ dễ thụ thai';
              toast(`Ngày ${selectedDate}: ${status}`);
            }}
          />
        </div>

        {/* Stats Column */}
        <div className="space-y-6 lg:col-span-4">
          <section className="space-y-4 rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-theme-brand" />
              <h2 className="text-lg font-bold text-theme-ink">Chỉ số chu kỳ hiện tại</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-theme-line bg-theme-page/60 p-4">
                <span className="block text-xs font-semibold text-theme-muted">Kỳ kinh gần nhất</span>
                <span className="mt-1.5 block text-base font-bold text-theme-ink">
                  {momProfile?.lastPeriodDate
                    ? new Date(momProfile.lastPeriodDate).toLocaleDateString('vi-VN')
                    : 'Chưa cập nhật'}
                </span>
              </div>

              <div className="rounded-2xl border border-theme-line bg-theme-page/60 p-4">
                <span className="block text-xs font-semibold text-theme-muted">Độ dài trung bình</span>
                <span className="mt-1.5 block text-base font-bold text-theme-ink">
                  {momProfile?.avgCycleLength ? `${momProfile.avgCycleLength} ngày` : 'Chưa cập nhật'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-theme-line bg-theme-sidebar/60 p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-theme-brand" />
              <p className="text-xs leading-relaxed text-theme-muted sm:text-sm">
                Các chỉ số chu kỳ giúp Mom Ơi! ước tính ngày rụng trứng và cửa sổ thụ thai. Mẹ nên ghi nhận ngày đầu kỳ kinh mỗi tháng để lịch dự báo sát thực tế hơn.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Log Period Modal */}
      {showLogModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-theme-ink/45 p-4 backdrop-blur-[2px]"
          onClick={() => setShowLogModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="period-modal-title"
          >
            <div className="mb-5 flex items-center justify-between border-b border-theme-line pb-4">
              <h2 id="period-modal-title" className="text-lg font-bold text-theme-ink">
                Ghi nhận kỳ hành kinh mới
              </h2>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                aria-label="Đóng hộp thoại"
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-theme-line bg-theme-page text-theme-ink hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div>
                <label htmlFor="log-period-date" className="mb-1.5 block text-sm font-semibold text-theme-ink">
                  Ngày bắt đầu có kinh nguyệt
                </label>
                <input
                  id="log-period-date"
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-semibold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
                />
              </div>

              <div>
                <label htmlFor="log-cycle-length" className="mb-1.5 block text-sm font-semibold text-theme-ink">
                  Độ dài chu kỳ trung bình (ngày)
                </label>
                <input
                  id="log-cycle-length"
                  type="number"
                  required
                  min="20"
                  max="45"
                  value={logLength}
                  onChange={(e) => setLogLength(Number(e.target.value))}
                  className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-semibold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-theme-ink">
                  Triệu chứng đi kèm (nếu có)
                </p>
                <div className="flex flex-wrap gap-2">
                  {symptomOptions.map((symptom) => {
                    const isSelected = logSymptoms.includes(symptom);
                    return (
                      <button
                        type="button"
                        key={symptom}
                        onClick={() => handleSymptomToggle(symptom)}
                        aria-pressed={isSelected}
                        className={`min-h-[38px] rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                          isSelected
                            ? 'border-theme-brand bg-theme-brand-soft text-theme-ink'
                            : 'border-theme-line bg-theme-page/50 text-theme-muted hover:border-theme-brand/40 hover:text-theme-ink'
                        }`}
                      >
                        {symptom}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="min-h-[48px] flex-1 rounded-full border border-theme-line bg-theme-page px-4 py-2.5 text-sm font-bold text-theme-ink transition-colors hover:bg-theme-sidebar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingLog}
                  className="min-h-[48px] flex-1 rounded-full bg-theme-brand px-4 py-2.5 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-theme-line disabled:text-theme-muted"
                >
                  {submittingLog ? 'Đang lưu...' : 'Lưu kỳ kinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
