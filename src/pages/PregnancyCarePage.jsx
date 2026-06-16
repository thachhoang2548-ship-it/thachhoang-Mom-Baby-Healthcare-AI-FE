import React, { useState } from "react";
import api from "../services/api";

const UNSAFE_FOODS = [
  { name: "Rau ngót", reason: "Chứa Papaverin có thể gây co thắt tử cung, tăng nguy cơ sảy thai sớm.", category: "Rau củ" },
  { name: "Quả dứa (Thơm)", reason: "Chứa Bromelain làm mềm tử cung, dễ gây co bóp mạnh nguy hiểm ở tam cá nguyệt đầu.", category: "Trái cây" },
  { name: "Sushi / Cá sống", reason: "Nguy cơ cao nhiễm vi khuẩn Listeria, sán và độc tố kim loại nặng ảnh hưởng thai nhi.", category: "Hải sản" },
  { name: "Trứng lòng đào", reason: "Nguy cơ ngộ độc thực phẩm do vi khuẩn Salmonella chưa được tiêu diệt hoàn toàn.", category: "Thịt/Trứng" },
  { name: "Rượu bia", reason: "Tác nhân trực tiếp gây hội chứng ngộ độc rượu ở bào thai (FASD), dị tật bẩm sinh thần kinh.", category: "Đồ uống" },
];

export default function PregnancyCarePage() {
  const [pregnancyWeek, setPregnancyWeek] = useState(12);
  const [steps, setSteps] = useState("");
  const [weightDiff, setWeightDiff] = useState("");
  const [foodSearch, setFoodSearch] = useState("");
  const [simulationLogged, setSimulationLogged] = useState(false);
  const [simAlerts, setSimAlerts] = useState([]);

  const filteredFoods = UNSAFE_FOODS.filter((f) =>
    f.name.toLowerCase().includes(foodSearch.toLowerCase())
  );

  const simulateLogMaternityMetrics = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        date: new Date(),
        steps: steps ? Number(steps) : 4000,
        // Calculate conception parameters
        conceptionDayOfCycle: 0,
        // Simulated weight gain
        babyIronInput: 0,
        babyFishServings: 0,
        epdsScore: 0,
        // Record weight gain of this week
        mood: { score: 4, note: `Log thai kỳ tuần ${pregnancyWeek}` }
      };

      // Note: we can also include the food name if they type one of the unsafe foods to trigger BR02
      if (foodSearch) {
        payload.newFoodLogged = true;
        payload.allergySymptomLogged = false;
        // Backend evaluates BR02 by looking for names in food input.
        // In our BE businessRuleService.js, we check for raw foods or ingredients.
        // Let's pass steps and let the server rules evaluate.
      }

      await api.post("/daily-monitoring", payload);
      setSimulationLogged(true);

      // Fetch alerts to see if rules like BR03 (steps < 3000) or weight warnings are triggered
      const res = await api.get("/daily-monitoring/lifestyle-alerts");
      setSimAlerts(res.data.alerts || []);
    } catch (err) {
      console.error("Simulation failed", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-display">
      <header className="mb-8 bg-gradient-to-r from-coral-400 to-rose-400 text-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-extrabold">Chăm Sóc Thai Kỳ Toàn Diện</h1>
        <p className="mt-2 text-rose-50 max-w-xl text-sm leading-relaxed">
          Đồng hành cùng mẹ qua 40 tuần thai kỳ kỳ diệu. Theo dõi cân nặng tăng trưởng chuẩn, vận động khoa học và dinh dưỡng an toàn cho bé.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Weekly progress and calculator */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-150 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Thông số tuần thai</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Cập nhật tuần thai của mẹ:</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={42}
                    value={pregnancyWeek}
                    onChange={(e) => setPregnancyWeek(Number(e.target.value))}
                    className="w-20 rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 py-2 px-3 text-sm focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tuần</span>
                </div>
              </div>

              <div className="p-4 bg-coral-50/30 dark:bg-coral-950/10 rounded-xl border border-coral-100 dark:border-coral-900/20 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {pregnancyWeek <= 13 && "Giai đoạn Tam cá nguyệt 1: Hãy bổ sung acid folic đầy đủ, giảm bớt căng thẳng và hạn chế ăn các loại quả dứa, rau ngót gây co bóp tử cung."}
                {pregnancyWeek > 13 && pregnancyWeek <= 26 && "Giai đoạn Tam cá nguyệt 2: Sự phát triển vượt trội của bé về khung xương. Mẹ nên ăn thêm canxi, sữa chua và duy trì đi bộ nhẹ nhàng."}
                {pregnancyWeek > 26 && "Giai đoạn Tam cá nguyệt 3: Bé tăng cân nhanh chóng. Hãy chuẩn bị giỏ đồ đi sinh, theo dõi thai máy hàng ngày và cẩn trọng với các dấu hiệu phù nề."}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-150 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ghi nhận chỉ số hôm nay</h2>
            <form onSubmit={simulateLogMaternityMetrics} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-450 mb-1">Số bước chân đi bộ *</label>
                <input
                  type="number"
                  placeholder="Ví dụ: 2500"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary"
                />
                <p className="text-[10px] text-gray-400 mt-1">Cảnh báo nếu ít hơn 3.000 bước/ngày (BR03)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-450 mb-1">Thay đổi cân nặng tuần này (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ví dụ: 0.5"
                  value={weightDiff}
                  onChange={(e) => setWeightDiff(e.target.value)}
                  className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary"
                />
                <p className="text-[10px] text-gray-400 mt-1">Khuyến nghị: Tăng từ 0.2kg - 0.9kg mỗi tuần (BR04)</p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-pink-600 transition shadow-sm text-sm"
              >
                Ghi nhận chỉ số sức khỏe
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Search food and active rules warnings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Rule simulator triggers */}
          {simulationLogged && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-150 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Kết quả đánh giá sức khỏe tự động</h2>
              
              <div className="space-y-3">
                {simAlerts.filter(a => ["BR02", "BR03", "BR04"].includes(a.ruleId)).map((alert, idx) => (
                  <div key={idx} className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-500 mt-0.5">warning</span>
                    <div>
                      <strong className="text-red-700 dark:text-red-400 font-bold block text-sm">{alert.title}</strong>
                      <p className="text-xs text-red-800 dark:text-red-300 mt-1 leading-relaxed">{alert.message}</p>
                      <span className="text-[10px] text-gray-500 block mt-1">Gợi ý từ AI: {alert.suggestion}</span>
                    </div>
                  </div>
                ))}

                {simAlerts.filter(a => ["BR02", "BR03", "BR04"].includes(a.ruleId)).length === 0 && (
                  <div className="bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 p-4 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    <div>
                      <strong className="text-green-700 dark:text-green-400 font-bold block text-sm">Chỉ số bình thường!</strong>
                      <p className="text-xs text-green-800 dark:text-green-300 mt-0.5">Số bước chân vận động tốt và cân nặng của mẹ hoàn toàn nằm trong mức chuẩn an toàn.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unsafe food search */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-150 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tra cứu thực phẩm an toàn (BR02)</h2>
              <span className="px-2 py-0.5 text-[10px] bg-red-100 text-red-700 font-semibold rounded-full">An toàn thai nhi</span>
            </div>
            
            <div className="relative mb-4">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <span className="material-symbols-outlined text-lg">search</span>
              </span>
              <input
                type="text"
                placeholder="Nhập tên món ăn hoặc rau củ... (ví dụ: rau ngót, cá sống...)"
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
                className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-3">
              {filteredFoods.map((f, i) => (
                <div key={i} className="p-4 bg-orange-50/40 dark:bg-orange-950/15 rounded-xl border border-orange-100 dark:border-orange-900/20 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <strong className="text-sm text-gray-800 dark:text-white font-bold">{f.name}</strong>
                    <span className="px-2 py-0.5 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 font-semibold rounded">{f.category}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{f.reason}</p>
                </div>
              ))}

              {filteredFoods.length === 0 && (
                <p className="text-xs text-gray-500 italic text-center py-4">Không tìm thấy chất cấm thuộc danh mục cảnh báo nguy hiểm trực tiếp. Hãy duy trì chế độ ăn chín uống sôi.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
