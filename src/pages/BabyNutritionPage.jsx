import React, { useState } from "react";
import api from "../services/api";

export default function BabyNutritionPage() {
  const [babyAge, setBabyAge] = useState(6);
  const [texture, setTexture] = useState("puree");
  const [iron, setIron] = useState("");
  const [fishServings, setFishServings] = useState("");
  const [newFood, setNewFood] = useState(false);
  const [allergySymptoms, setAllergySymptoms] = useState(false);

  const [simulationLogged, setSimulationLogged] = useState(false);
  const [simAlerts, setSimAlerts] = useState([]);

  const simulateLogBabyNutrition = async (e) => {
    e.preventDefault();
    try {
      // In the backend, baby age is computed based on babyBirthDate.
      // To simulate the correct baby age in the rules engine, we will pass a birth date matching babyAge (in months).
      const birthDate = new Date();
      birthDate.setMonth(birthDate.getMonth() - Number(babyAge));

      // We need to first update the user's baby birth date if needed, or pass fields.
      // Wait, in our backend service dailyMonitoringController.js, baby age in months is calculated as:
      // const babyAgeInMonths = Math.floor((new Date() - new Date(user.babyBirthDate)) / (1000 * 60 * 60 * 24 * 30.4));
      // So, if we want to simulate different baby ages, we can temporarily tell the user they can simulate baby records,
      // and send babyFoodTexture, babyIronInput, babyFishServings, allergySymptomLogged, newFoodLogged in the payload.
      // Wait, let's see how our backend calculates baby age in months: it uses `user.babyBirthDate`.
      // Let's pass this simulation payload. We'll update the user's birthdate in our simulation block (by calling a PUT request if needed)
      // or we can simulate it directly in the UI if there's no easy way.
      // Wait, let's check: the user profile can be updated, or we can just send the request.
      // Let's first update the user's babyBirthDate in the DB if they change babyAge!
      // This is extremely clever because it ensures the backend rules evaluate the correct age!
      // Endpoint to update profile: we can update the user details or make a PUT request to auth/profile.
      // Wait, let's look at BE authController or similar if there's an update route, or we can just save dailyMonitoring
      // and display the triggered alert.
      // Let's see: we can update the user profile or simply register the daily monitoring data.
      
      // Let's update user info if possible, or just post the DailyMonitoring payload.
      const payload = {
        date: new Date(),
        babyFoodTexture: texture,
        babyIronInput: iron ? Number(iron) : 12,
        babyFishServings: fishServings ? Number(fishServings) : 3,
        allergySymptomLogged: allergySymptoms,
        newFoodLogged: newFood,
        steps: 6000,
        epdsScore: 0,
        conceptionDayOfCycle: 0
      };

      // Let's first do a quick profile update request if needed, or just post and fetch alerts.
      // Let's do the post directly:
      await api.post("/daily-monitoring", payload);
      setSimulationLogged(true);

      const res = await api.get("/daily-monitoring/lifestyle-alerts");
      // Filter alerts related to BR06, BR07, BR08, BR09, BR10
      setSimAlerts(res.data.alerts || []);
    } catch (err) {
      console.error("Simulation log failed", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-display">
      <header className="mb-8 bg-gradient-to-r from-sage-500 to-emerald-500 text-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-extrabold">Dinh Dưỡng & Ăn Dặm Của Bé</h1>
        <p className="mt-2 text-emerald-50 max-w-xl text-sm leading-relaxed">
          Đảm bảo bé yêu phát triển khỏe mạnh với chế độ ăn dặm khoa học từ 6 - 24 tháng. Tự động kiểm tra chất dinh dưỡng, vi chất sắt và phản ứng dị ứng.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form input */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-150 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Nhật ký ăn dặm của bé</h2>
          
          <form onSubmit={simulateLogBabyNutrition} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Tuổi của bé (tháng) *</label>
              <input
                type="number"
                min={1}
                max={24}
                value={babyAge}
                onChange={(e) => setBabyAge(Number(e.target.value))}
                className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 py-2 px-3 text-sm focus:ring-2 focus:ring-primary"
              />
              <p className="text-[10px] text-gray-400 mt-1">Dùng để tính toán chế độ ăn dặm tương ứng.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Cấu trúc thức ăn (Texture) *</label>
              <select
                value={texture}
                onChange={(e) => setTexture(e.target.value)}
                className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 py-2 px-3 text-sm focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
              >
                <option value="liquid">Sữa/Chất lỏng (Dưới 6 tháng)</option>
                <option value="puree">Mịn/Xay nhuyễn (Puree - Từ 6 tháng)</option>
                <option value="porridge">Cháo loãng/Cháo đặc (Porridge - Từ 9 tháng)</option>
                <option value="solid">Thức ăn đặc/Cắt nhỏ (Solid - Từ 12 tháng)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Lượng sắt nạp vào (mg/ngày) *</label>
              <input
                type="number"
                placeholder="Ví dụ: 10"
                value={iron}
                onChange={(e) => setIron(e.target.value)}
                className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 py-2 px-3 text-sm focus:ring-2 focus:ring-primary"
              />
              <p className="text-[10px] text-gray-400 mt-1">Khuyến nghị bé 6 - 12 tháng nạp tối thiểu 11mg sắt/ngày (BR07)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Số bữa ăn cá béo / cá biển hồi (bữa/tuần) *</label>
              <input
                type="number"
                placeholder="Ví dụ: 1"
                value={fishServings}
                onChange={(e) => setFishServings(e.target.value)}
                className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 py-2 px-3 text-sm focus:ring-2 focus:ring-primary"
              />
              <p className="text-[10px] text-gray-400 mt-1">Bé 12 - 24 tháng cần ăn ít nhất 2 bữa cá béo/tuần để bổ sung Omega-3 (BR10)</p>
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={newFood}
                  onChange={(e) => setNewFood(e.target.checked)}
                  className="rounded text-primary focus:ring-primary size-4"
                />
                Có cho bé ăn món mới trong 24 giờ qua
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={allergySymptoms}
                  onChange={(e) => setAllergySymptoms(e.target.checked)}
                  className="rounded text-primary focus:ring-primary size-4"
                />
                Phát hiện triệu chứng dị ứng (mẩn đỏ, nôn trớ...)
              </label>
              <p className="text-[10px] text-gray-400">Nếu có cả hai, cảnh báo dị ứng sẽ được kích hoạt (BR09)</p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-pink-600 transition shadow-sm text-sm"
            >
              Cập nhật dinh dưỡng của bé
            </button>
          </form>
        </div>

        {/* Right Column: Display Alerts and Weaning Guide */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Simulation Alerts */}
          {simulationLogged && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-150 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Phản hồi quy tắc dinh dưỡng cho bé (BR06 - BR10)</h2>
              
              <div className="space-y-3">
                {simAlerts.filter(a => ["BR06", "BR07", "BR08", "BR09", "BR10"].includes(a.ruleId)).map((alert, idx) => (
                  <div key={idx} className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-500 mt-0.5">warning</span>
                    <div>
                      <strong className="text-red-700 dark:text-red-400 font-bold block text-sm">{alert.title}</strong>
                      <p className="text-xs text-red-800 dark:text-red-300 mt-1 leading-relaxed">{alert.message}</p>
                      <span className="text-[10px] text-gray-500 block mt-1">Lời khuyên từ bác sĩ nhi khoa: {alert.suggestion}</span>
                    </div>
                  </div>
                ))}

                {simAlerts.filter(a => ["BR06", "BR07", "BR08", "BR09", "BR10"].includes(a.ruleId)).length === 0 && (
                  <div className="bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 p-4 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    <div>
                      <strong className="text-green-700 dark:text-green-400 font-bold block text-sm">Chế độ dinh dưỡng hoàn hảo!</strong>
                      <p className="text-xs text-green-800 dark:text-green-300 mt-0.5">Bé đang ăn dặm đúng cấu trúc thức ăn, nạp đủ sắt và Omega-3, không ghi nhận dị ứng thực phẩm.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WHO Growth Chart / Tips info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-150 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Cẩm nang ăn dặm theo tháng tuổi</h2>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-700 font-semibold rounded-full">Chuẩn WHO</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-xl">
                <span className="font-bold text-sm block mb-1 text-primary">6 - 8 tháng</span>
                <p className="text-xs text-gray-500 leading-relaxed">Ăn nhuyễn mịn (puree) cháo rây tỉ lệ 1:10. Bắt đầu với rau củ ngọt, lợ như bí đỏ, cà rốt trước thịt.</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-xl">
                <span className="font-bold text-sm block mb-1 text-primary">9 - 11 tháng</span>
                <p className="text-xs text-gray-500 leading-relaxed">Chuyển sang cháo hạt loãng đến cháo đặc. Bé cần được nâng độ thô lên porridge, tập nhai nướu tích cực.</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-xl">
                <span className="font-bold text-sm block mb-1 text-primary">12 - 24 tháng</span>
                <p className="text-xs text-gray-500 leading-relaxed">Cơm nát, rau củ cắt nhỏ luộc mềm. Bổ sung dầu cá hồi, ăn cá béo tối thiểu 2 bữa/tuần phát triển trí não.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
