import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fertilityService from '../../../models/services/fertilityService';
import TierGate from '../../components/layout/TierGate';
import { Calendar, HelpCircle, ArrowLeft, ClipboardList, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function IvfTimelinePage() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [protocol, setProtocol] = useState('long'); // 'long' or 'antagonist'
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fertilityService.createIvfTimeline(startDate, protocol);
      if (res.isSuccess && res.data) {
        setTimeline(res.data.milestones || res.data); // Backend returns Milestones list
        toast.success('Đã khởi tạo phác đồ IVF thành công! ⚡');
      } else {
        toast.error(res.message || 'Không thể tạo phác đồ');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi gọi API khởi tạo IVF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/fertility')}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại Theo dõi rụng trứng
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-pink-50 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <ClipboardList className="w-5 h-5 text-momPurple" />
            Phác Đồ IVF Cá Nhân Hóa
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Thiết kế và theo dõi lịch tiêm thuốc kích nang, chọc trứng và chuyển phôi tự động
          </p>
        </div>
      </div>

      <TierGate requiredTier="MomHienDai">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Setup Form Panel */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-pink-100/50 dark:border-gray-700 shadow-sm self-start space-y-4">
            <h3 className="text-xs font-bold text-gray-550 dark:text-gray-400 uppercase tracking-wider">
              Cài Đặt Kỳ Phác Đồ
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Ngày bắt đầu tiêm/Chu kỳ kinh
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-momPurple/30 focus:border-momPurple text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Phác đồ IVF áp dụng
                </label>
                <select
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-momPurple/30 focus:border-momPurple text-xs font-semibold"
                >
                  <option value="long">Long Agonist (Phác đồ dài - Có điều hòa hạ đồi)</option>
                  <option value="antagonist">Antagonist (Phác đồ ngắn - Kháng GnRH)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-momPurple to-momPink text-white text-xs font-bold rounded-xl shadow-md hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-1"
              >
                {loading ? 'Đang phân tích...' : 'Thiết Lập Phác Đồ ⚡'}
              </button>
            </form>

            <div className="bg-purple-50/40 p-3 rounded-xl border border-purple-100/40 text-[10px] text-gray-500 font-semibold leading-relaxed">
              💡 <span className="font-bold text-momPurple-dark">Phác đồ dài (Long):</span> Thường bắt đầu từ ngày 21 của chu kỳ trước.<br />
              💡 <span className="font-bold text-momPink-dark">Phác đồ ngắn (Antagonist):</span> Thường bắt đầu từ ngày 2 hoặc ngày 3 của chu kỳ kinh hiện tại.
            </div>
          </div>

          {/* Vertical Timeline Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-pink-100/50 dark:border-gray-700 shadow-sm">
            <h3 className="text-xs font-bold text-gray-550 dark:text-gray-400 uppercase tracking-wider mb-5">
              Lịch Trình IVF Của Mami
            </h3>

            {timeline ? (
              <div className="relative border-l-2 border-pink-100 dark:border-gray-700 pl-6 space-y-6 ml-3">
                {timeline.map((step, idx) => {
                  const sDate = new Date(step.scheduledDate || step.date);
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  const isPast = sDate < today;
                  const isToday = sDate.toDateString() === today.toDateString();

                  return (
                    <div key={idx} className="relative group">
                      
                      {/* Timeline Node Point */}
                      <span className={`absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                        isPast
                          ? 'bg-momGreen border-momGreen text-white'
                          : isToday
                          ? 'bg-momPurple border-momPurple text-white animate-pulse'
                          : 'bg-white border-pink-150 text-gray-400 dark:bg-gray-800'
                      }`}>
                        {isPast ? (
                          <span className="text-[9px]">✓</span>
                        ) : (
                          <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
                        )}
                      </span>

                      {/* Content Card */}
                      <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                        isToday
                          ? 'bg-momPurple-light/20 border-momPurple shadow-md'
                          : 'bg-pink-50/10 border-pink-100 hover:border-pink-250 dark:bg-gray-850 dark:border-gray-750'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                          <h4 className="text-xs font-extrabold text-gray-800 dark:text-white">
                            {step.title}
                          </h4>
                          <span className="text-[10px] text-momPink-dark dark:text-pink-400 font-bold flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {sDate.toLocaleDateString('vi-VN', { weekday: 'short', month: 'numeric', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
                          {step.description}
                        </p>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-3xl text-gray-300 mb-2">⚡</span>
                <p className="text-xs text-gray-500 font-semibold">
                  Mami chưa khởi tạo lịch phác đồ. Nhập ngày bắt đầu bên cạnh để bắt đầu lộ trình!
                </p>
              </div>
            )}
          </div>

        </div>
      </TierGate>

    </div>
  );
}
