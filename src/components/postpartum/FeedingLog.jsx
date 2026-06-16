import React, { useState } from 'react';
import { Compass, Sparkles, Clock, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';
import { postpartumApi } from '../../api/postpartumApi';
import toast from 'react-hot-toast';

export default function FeedingLog() {
  const [side, setSide] = useState('both'); // 'left' | 'right' | 'both'
  const [duration, setDuration] = useState(15);
  const [time, setTime] = useState(
    new Date().toLocaleTimeString('en-US', { hour12: false }).substring(0, 5) // HH:MM
  );
  const [submitting, setSubmitting] = useState(false);

  // local stats that simulate incremental feeds for immediate feedback
  const [feedCount, setFeedCount] = useState(3);
  const [totalMinutes, setTotalMinutes] = useState(45);
  const [lastFeedTime, setLastFeedTime] = useState('08:30');

  // Supply status toggle for context-aware tips
  const [supplyLevel, setSupplyLevel] = useState('stable'); // 'stable' | 'dipping'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const today = new Date();
      const [hours, minutes] = time.split(':');
      today.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const res = await postpartumApi.logBreastfeeding(side, duration, today.toISOString());
      if (res.isSuccess) {
        toast.success('Ghi nhận cữ bú thành công! 🍼');
        setFeedCount((prev) => prev + 1);
        setTotalMinutes((prev) => prev + duration);
        setLastFeedTime(time);
      } else {
        toast.error('Lỗi khi ghi nhận nhật ký');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi gửi nhật ký');
    } finally {
      setSubmitting(false);
    }
  };

  const galactagogueFoods = [
    'Nước ấm / Sữa hạt ấm (uống trước khi bú 15-20 phút)',
    'Rau thì là, lá đinh lăng đun nước uống',
    'Cháo móng giò hạt sen bí đỏ',
    'Ngũ cốc lợi sữa (yến mạch, hạt sen, ý dĩ)',
    'Thực phẩm giàu sắt: Thịt bò, gan, trứng gà'
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-pink-100/50 dark:border-gray-700/50 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-pink-50 dark:border-gray-700/50">
        <div>
          <h3 className="text-sm font-extrabold text-gray-850 dark:text-white uppercase tracking-wider">
            Nhật Ký Cho Con Bú 🍼
          </h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
            Theo dõi cữ bú và duy trì nguồn sữa cho bé
          </p>
        </div>

        {/* Supply selector */}
        <select
          value={supplyLevel}
          onChange={(e) => setSupplyLevel(e.target.value)}
          className="text-[10px] font-bold bg-pink-50/50 dark:bg-gray-700 border-none text-momPink-dark dark:text-pink-300 rounded-xl px-2 py-1 focus:ring-1 focus:ring-momPink/30"
        >
          <option value="stable">Lượng sữa: Ổn định</option>
          <option value="dipping">Lượng sữa: Đang giảm</option>
        </select>
      </div>

      {/* Mini Stats Banner */}
      <div className="grid grid-cols-3 gap-2 bg-gradient-to-tr from-pink-50/50 to-purple-50/30 dark:from-gray-750 dark:to-gray-700 p-3 rounded-2xl border border-pink-50/20 text-center">
        <div>
          <p className="text-[10px] text-gray-400 dark:text-gray-400 font-bold uppercase">Cữ bú hôm nay</p>
          <p className="text-base font-black text-momPink mt-0.5">{feedCount}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 dark:text-gray-400 font-bold uppercase">Tổng thời gian</p>
          <p className="text-base font-black text-momPurple mt-0.5">{totalMinutes} Phút</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 dark:text-gray-400 font-bold uppercase">Cữ cuối cùng</p>
          <p className="text-base font-black text-momGreen mt-0.5">{lastFeedTime}</p>
        </div>
      </div>

      {/* Log Form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Side Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Bên ngực cho bé bú
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'left', label: 'Bên Trái 👈' },
              { id: 'right', label: 'Bên Phải 👉' },
              { id: 'both', label: 'Cả Hai Bên 🔄' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSide(item.id)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${
                  side === item.id
                    ? 'border-momPink bg-momPink-light/30 text-momPink-dark'
                    : 'border-gray-200 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <span>Thời gian bú</span>
            <span className="text-momPink-dark">{duration} phút</span>
          </div>
          <input
            type="range"
            min="1"
            max="60"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full accent-momPink cursor-pointer h-1.5 bg-pink-100 rounded-lg"
          />
          <div className="flex justify-between text-[8px] font-bold text-gray-400">
            <span>1 phút</span>
            <span>30 phút</span>
            <span>60 phút</span>
          </div>
        </div>

        {/* Time Selector */}
        <div className="grid grid-cols-1 gap-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Thời điểm cho bú
          </label>
          <div className="relative">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 dark:bg-gray-900 rounded-xl text-xs font-bold focus:ring-1 focus:ring-momPink/30"
            />
            <Clock className="w-4 h-4 text-gray-400 absolute right-3.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-extrabold rounded-xl transition hover:opacity-95 shadow-md active:scale-95"
        >
          {submitting ? 'Đang lưu...' : 'Ghi nhận cữ bú mới'}
        </button>
      </form>

      {/* Context-aware tips card */}
      <div className={`p-4 rounded-2xl border transition-all ${
        supplyLevel === 'dipping' 
          ? 'bg-amber-50/50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/30' 
          : 'bg-pink-50/20 border-pink-100/50 text-gray-700 dark:bg-gray-750 dark:border-gray-700'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {supplyLevel === 'dipping' ? (
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          ) : (
            <Compass className="w-4 h-4 text-momPink" />
          )}
          <h4 className="text-xs font-extrabold uppercase tracking-wide">
            {supplyLevel === 'dipping' ? 'Mẹo phục hồi lượng sữa bị giảm ⚠️' : 'Lời khuyên cho mami'}
          </h4>
        </div>

        {supplyLevel === 'dipping' ? (
          <div className="space-y-2 text-[11px] font-semibold leading-relaxed">
            <p className="text-amber-800 dark:text-amber-300 font-bold">
              Đừng quá lo lắng mami nhé! Hãy bổ sung ngay các thực phẩm kích sữa cực tốt dưới đây:
            </p>
            <ul className="space-y-1 pl-1">
              {galactagogueFoods.map((food, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{food}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-[11px] font-semibold leading-relaxed text-gray-550 dark:text-gray-300">
            Cho bé bú mẹ trực tiếp đều đặn mỗi 2-3 giờ là cơ chế kích hoạt hormone prolactin tốt nhất để tuyến sữa sản sinh dồi dào. Nhớ uống đủ 2.5 - 3 lít nước ấm mỗi ngày mami nhé!
          </p>
        )}
      </div>
    </div>
  );
}
