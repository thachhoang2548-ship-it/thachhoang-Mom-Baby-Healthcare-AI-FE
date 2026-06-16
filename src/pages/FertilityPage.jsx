import React, { useState } from "react";
import api from "../services/api";

export default function FertilityPage() {
  const [lmpDate, setLmpDate] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [ovulationData, setOvulationData] = useState(null);
  const [simulationLogged, setSimulationLogged] = useState(false);
  const [simAlerts, setSimAlerts] = useState([]);

  const calculateWindow = (e) => {
    e.preventDefault();
    if (!lmpDate) return;

    const lmp = new Date(lmpDate);
    // Ovulation is typically cycleLength - 14 days after LMP
    const ovulationDay = new Date(lmp);
    ovulationDay.setDate(lmp.getDate() + (cycleLength - 14));

    // Fertile window is 5 days before ovulation + ovulation day
    const fertileStart = new Date(ovulationDay);
    fertileStart.setDate(ovulationDay.getDate() - 5);

    const fertileEnd = new Date(ovulationDay);
    fertileEnd.setDate(ovulationDay.getDate() + 1);

    setOvulationData({
      ovulationDate: ovulationDay.toLocaleDateString("vi-VN"),
      fertileStart: fertileStart.toLocaleDateString("vi-VN"),
      fertileEnd: fertileEnd.toLocaleDateString("vi-VN"),
      nextPeriod: new Date(lmp.setDate(lmp.getDate() + Number(cycleLength))).toLocaleDateString("vi-VN")
    });
  };

  const simulateLogConceptionDay = async (day) => {
    try {
      // Simulate posting conception day of cycle to backend DailyMonitoring
      const payload = {
        date: new Date(),
        conceptionDayOfCycle: day,
        steps: 5000,
        mood: { score: 4, note: "Cảm thấy khỏe mạnh, đang theo dõi rụng trứng." }
      };
      await api.post("/daily-monitoring", payload);
      setSimulationLogged(true);
      
      // Fetch alerts to see if BR01 triggered
      const res = await api.get("/daily-monitoring/lifestyle-alerts");
      setSimAlerts(res.data.alerts || []);
    } catch (err) {
      console.error("Simulation log failed", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-display">
      <header className="mb-8 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-extrabold">Theo Dõi Thụ Thai & Chu Kỳ</h1>
        <p className="mt-2 text-pink-100 max-w-xl text-sm leading-relaxed">
          Xác định thời điểm rụng trứng vàng giúp tối ưu hóa khả năng thụ thai tự nhiên hoặc chuẩn bị chu trình thụ tinh ống nghiệm (IVF).
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calculator column */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-150 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">calculate</span>
            Tính toán ngày rụng trứng
          </h2>
          
          <form onSubmit={calculateWindow} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-650 mb-1">Ngày bắt đầu kỳ kinh cuối *</label>
              <input
                type="date"
                required
                value={lmpDate}
                onChange={(e) => setLmpDate(e.target.value)}
                className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 py-2.5 px-4 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-655 mb-1">Độ dài chu kỳ trung bình (ngày) *</label>
              <input
                type="number"
                required
                min={21}
                max={45}
                value={cycleLength}
                onChange={(e) => setCycleLength(e.target.value)}
                className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 py-2.5 px-4 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-pink-600 transition shadow-sm text-sm"
            >
              Phân tích chu kỳ
            </button>
          </form>

          {ovulationData && (
            <div className="mt-6 p-4 bg-pink-50/50 dark:bg-pink-950/20 rounded-xl border border-pink-100 dark:border-pink-900/30 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Ngày rụng trứng dự kiến:</span>
                <strong className="text-primary font-bold">{ovulationData.ovulationDate}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Cửa sổ thụ thai tốt nhất:</span>
                <strong className="text-pink-600 dark:text-pink-400 font-bold">{ovulationData.fertileStart} - {ovulationData.fertileEnd}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Chu kỳ kinh tiếp theo:</span>
                <strong className="text-gray-800 dark:text-gray-200 font-bold">{ovulationData.nextPeriod}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Visual Calendar & Simulation column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Conception Window info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-150 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Cửa sổ thụ thai (Conception Window)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              Cửa sổ thụ thai vàng là 6 ngày liên tiếp (bao gồm 5 ngày trước rụng trứng và ngày rụng trứng). Theo quy định y học (BR01), ngày thứ 11 đến 16 của chu kỳ là giai đoạn dễ thụ thai nhất.
            </p>

            <div className="flex justify-center items-center gap-2 mb-6">
              {[...Array(28)].map((_, i) => {
                const day = i + 1;
                const isFertile = day >= 11 && day <= 16;
                return (
                  <button
                    key={day}
                    onClick={() => simulateLogConceptionDay(day)}
                    title={`Ấn để kiểm tra ngày thứ ${day} của chu kỳ`}
                    className={`size-8 text-xs rounded-full font-bold flex items-center justify-center transition-all ${
                      isFertile
                        ? "bg-pink-500 text-white scale-110 hover:bg-pink-600 shadow-sm"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-750 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            
            <div className="flex justify-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-pink-500 rounded-full"></span>Cửa sổ dễ thụ thai (BR01)</span>
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-gray-200 rounded-full"></span>Ngày chu kỳ bình thường</span>
            </div>

            {simulationLogged && (
              <div className="mt-6 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30">
                <h3 className="text-sm font-bold text-orange-800 dark:text-orange-400 mb-2">Kết quả kiểm thử Quy tắc Doanh nghiệp (BR01)</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">Đã gửi ngày chu kỳ thụ thai mô phỏng lên hệ thống backend.</p>
                {simAlerts.length > 0 ? (
                  <div className="space-y-2">
                    {simAlerts.filter(a => a.ruleId === "BR01").map((alert, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-pink-100 dark:border-pink-900/30">
                        <strong className="text-pink-600 dark:text-pink-400 font-bold block text-sm">{alert.title}</strong>
                        <span className="text-xs text-gray-750 dark:text-gray-300 mt-1 block">{alert.message}</span>
                        <span className="text-[10px] text-gray-500 block mt-1">Gợi ý y tế: {alert.suggestion}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 italic block">Không kích hoạt cảnh báo rụng trứng (nằm ngoài ngày 11-16).</span>
                )}
              </div>
            )}
          </div>

          {/* IVF / Prep Timeline */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-150 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Lộ trình chuẩn bị IVF lý tưởng</h2>
            <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-6">
              <div className="relative pl-6">
                <div className="absolute left-[-6px] top-1.5 w-3 h-3 bg-pink-500 rounded-full"></div>
                <h3 className="text-sm font-bold text-gray-850 dark:text-white">Giai đoạn 1: Chuẩn bị thể chất (Trước 3 tháng)</h3>
                <p className="text-xs text-gray-500 mt-1">Uống bổ sung sắt, acid folic, ăn uống lành mạnh và làm xét nghiệm hormone cơ bản.</p>
              </div>
              <div className="relative pl-6">
                <div className="absolute left-[-6px] top-1.5 w-3 h-3 bg-orange-400 rounded-full"></div>
                <h3 className="text-sm font-bold text-gray-855 dark:text-white">Giai đoạn 2: Kích thích buồng trứng (Ngày 2 chu kỳ tiếp theo)</h3>
                <p className="text-xs text-gray-500 mt-1">Tiêm kích trứng đều đặn, theo dõi sự phát triển nang qua siêu âm định kỳ.</p>
              </div>
              <div className="relative pl-6">
                <div className="absolute left-[-6px] top-1.5 w-3 h-3 bg-yellow-400 rounded-full"></div>
                <h3 className="text-sm font-bold text-gray-850 dark:text-white">Giai đoạn 3: Chọc hút trứng & Tạo phôi</h3>
                <p className="text-xs text-gray-500 mt-1">Chọc hút trứng dưới gây mê nhẹ, thụ tinh trong ống nghiệm và nuôi cấy phôi ngày 3/5.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
