import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../../store/profileStore';
import { fertilityApi } from '../../api/fertilityApi';
import CycleCalendar from '../../components/fertility/CycleCalendar';
import TierGate from '../../components/layout/TierGate';
import { Calendar, HelpCircle, Sparkles, Heart, Clock, Plus, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FertilityPage() {
  const { momProfile, fetchProfile } = useProfileStore();
  const navigate = useNavigate();

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
  }, []);

  useEffect(() => {
    loadCalendarData();
  }, [selectedMonth, momProfile]);

  const loadCalendarData = async () => {
    try {
      const res = await fertilityApi.getCalendar(selectedMonth);
      if (res.isSuccess && res.data) {
        setCalendarData(res.data);
      }
    } catch (err) {
      console.error('Failed to load calendar data:', err);
    }
  };

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
      const res = await fertilityApi.logCycle(logDate, logLength, logSymptoms);
      if (res.isSuccess) {
        toast.success('Ghi nhận kỳ kinh thành công! Lịch dự đoán đã được cập nhật.');
        setShowLogModal(false);
        // Refresh states
        await fetchProfile();
        loadCalendarData();
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

  // Calculate countdown to fertile window
  const getFertileCountdownText = () => {
    if (!calendarData || !calendarData.fertileWindowDays || calendarData.fertileWindowDays.length === 0) {
      return 'Chưa có thông tin dự báo thụ thai.';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fertileDates = calendarData.fertileWindowDays
      .map((d) => new Date(d))
      .sort((a, b) => a - b);

    // Check if today is in fertile window
    const isInWindow = fertileDates.some((d) => d.toDateString() === today.toDateString());
    if (isInWindow) {
      return 'Mami đang trong cửa sổ thụ thai vàng! 💚';
    }

    // Find next fertile day
    const nextFertile = fertileDates.find((d) => d > today);
    if (!nextFertile) {
      return 'Cửa sổ thụ thai tháng này đã qua. Chúc mami may mắn kỳ tới!';
    }

    const diffTime = nextFertile.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `Còn ${diffDays} ngày đến cửa sổ thụ thai tiếp theo. ✨`;
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-5 h-5 text-momPink fill-momPink" />
            Theo Dõi Rụng Trứng
          </h2>
          <p className="text-xs text-gray-500 font-semibold">
            Quản lý chu kỳ kinh nguyệt và lập kế hoạch thụ thai thông minh
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="self-start sm:self-center px-4 py-2.5 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-bold rounded-xl shadow-md hover:shadow-momPink/20 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Ghi kỳ kinh
        </button>
      </div>

      {/* Countdown Card Banner */}
      <div className="bg-gradient-to-r from-momPink-light/40 to-momPurple-light/40 border border-pink-100/60 p-4 rounded-2xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-momPink shadow-sm text-lg shrink-0">
          🥚
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-800">Thông tin dự báo thụ thai</h4>
          <p className="text-xs text-momPink-dark dark:text-pink-400 font-extrabold mt-0.5">
            {getFertileCountdownText()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cycle Calendar Column */}
        <div className="lg:col-span-2 space-y-6">
          <CycleCalendar
            profile={momProfile}
            calendarData={calendarData}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onUpdatePeriod={() => setShowLogModal(true)}
            onDateClick={(cell) => {
              const selectedDate = cell.date.toLocaleDateString('vi-VN');
              let status = 'Bình thường';
              if (cell.isPeriod) status = 'Kỳ hành kinh (🩸)';
              if (cell.isOvulation) status = 'Ngày rụng trứng (🥚)';
              if (cell.isFertile && !cell.isOvulation) status = 'Cửa sổ thụ thai (💚)';
              toast(`Ngày ${selectedDate}: ${status}`, { icon: '📅' });
            }}
          />
        </div>

        {/* Stats and IVF Gates Column */}
        <div className="space-y-6">
          
          {/* Cycle Stats Block */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-pink-100/50 dark:border-gray-700 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Chỉ Số Chu Kỳ
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-pink-50/30 dark:bg-gray-850 p-3 rounded-xl border border-pink-100/20">
                <span className="text-[10px] text-gray-450 block font-bold">Kinh nguyệt cuối</span>
                <span className="text-xs font-extrabold text-momPink-dark mt-1 block">
                  {momProfile?.lastPeriodDate
                    ? new Date(momProfile.lastPeriodDate).toLocaleDateString('vi-VN')
                    : 'Chưa có'}
                </span>
              </div>
              
              <div className="bg-purple-50/30 dark:bg-gray-850 p-3 rounded-xl border border-purple-100/20">
                <span className="text-[10px] text-gray-450 block font-bold">Chu kỳ trung bình</span>
                <span className="text-xs font-extrabold text-momPurple-dark mt-1 block">
                  {momProfile?.avgCycleLength ? `${momProfile.avgCycleLength} ngày` : 'Chưa có'}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-850 p-3 rounded-xl border border-gray-100 dark:border-gray-850/50 flex items-start gap-2">
              <Info className="w-4 h-4 text-gray-450 mt-0.5 shrink-0" />
              <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                Các chỉ số chu kỳ giúp thuật toán của Mom Ơi dự báo cửa sổ thụ thai an toàn. Hãy cập nhật lịch kinh nguyệt đều đặn mỗi tháng để có kết quả chính xác nhất.
              </p>
            </div>
          </div>

          {/* IVF Timeline Banner */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-pink-100/50 dark:border-gray-700 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-550 dark:text-gray-400 uppercase tracking-wider">
                Kế Hoạch IVF / Thụ Tinh Nhân Tạo
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                Thiết lập phác đồ tiêm kích rụng trứng và chuyển phôi
              </p>
            </div>

            <TierGate requiredTier="MomHienDai">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-pink-100/50 text-center">
                <span className="text-2xl">⚡</span>
                <h4 className="text-xs font-bold text-gray-800 mt-2">
                  Lập Phác Đồ IVF Thông Minh
                </h4>
                <p className="text-[10px] text-gray-500 mt-1 mb-4 leading-relaxed font-semibold">
                  Tạo lộ trình đồng bộ lịch tiêm thuốc kích trứng, siêu âm kiểm nang, chọc hút trứng và chuyển phôi theo ngày chuẩn y tế.
                </p>
                <button
                  onClick={() => navigate('/fertility/ivf')}
                  className="px-4 py-2 bg-gradient-to-r from-momPurple to-momPink text-white text-xs font-bold rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Bắt đầu lập phác đồ
                </button>
              </div>
            </TierGate>
          </div>

        </div>

      </div>

      {/* Log Period Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-pink-50 animate-scale-in">
            <div className="flex justify-between items-center border-b border-pink-50 pb-3 mb-4">
              <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-1.5">
                🩸 Ghi nhận kỳ hành kinh mới
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Ngày bắt đầu có kinh nguyệt
                </label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-momPink/30 focus:border-momPink text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Độ dài chu kỳ trung bình (ngày)
                </label>
                <input
                  type="number"
                  required
                  min="20"
                  max="45"
                  value={logLength}
                  onChange={(e) => setLogLength(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-momPink/30 focus:border-momPink text-xs font-semibold"
                />
              </div>

              {/* Symptoms checklist */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  Triệu chứng cơ thể đi kèm
                </label>
                <div className="flex flex-wrap gap-2">
                  {symptomOptions.map((symptom) => {
                    const isSelected = logSymptoms.includes(symptom);
                    return (
                      <button
                        type="button"
                        key={symptom}
                        onClick={() => handleSymptomToggle(symptom)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-300 ${
                          isSelected
                            ? 'bg-momPink-light border-momPink text-momPink-dark shadow-sm'
                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {symptom}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 text-xs font-bold rounded-xl border border-gray-200 transition-all text-center"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingLog}
                  className="flex-1 py-2.5 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 transition-all text-center"
                >
                  {submittingLog ? 'Đang lưu...' : 'Lưu lại 🌸'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
