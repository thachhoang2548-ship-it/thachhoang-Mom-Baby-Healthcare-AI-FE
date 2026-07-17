import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfileController } from "../../controllers/profileController";
import { useAuthController } from "../../controllers/authController";
import { Heart, Activity, Calendar, Baby, ArrowLeft, Save, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

// Helper to format Date objects to YYYY-MM-DD for input elements
const formatDateString = (dateVal) => {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

const COMMON_CONDITIONS = ["Cao huyết áp", "Thiếu máu", "Suy nhược", "Dị ứng ứng thuốc", "Hen suyễn"];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuthController();
  const { momProfile, fetchProfile, updateProfile, updateWeightLog, isLoading } = useProfileController();

  // Local Form States
  const [stage, setStage] = useState(0);
  const [pregnancyWeek, setPregnancyWeek] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState("");
  const [bloodSugarLevel, setBloodSugarLevel] = useState("");
  const [hasGestDiabetes, setHasGestDiabetes] = useState(false);
  const [avgCycleLength, setAvgCycleLength] = useState("");
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [isBreastfeeding, setIsBreastfeeding] = useState(false);
  
  // Medical Conditions
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [customCondition, setCustomCondition] = useState("");

  // Load profile details into form
  useEffect(() => {
    const loadData = async () => {
      let activeProfile = momProfile;
      if (!activeProfile) {
        activeProfile = await fetchProfile();
      }

      if (activeProfile) {
        // Map string or number stage to C# enum matching index
        let stageIdx = 0;
        if (activeProfile.stage === "Pregnant" || activeProfile.stage === 1) stageIdx = 1;
        else if (activeProfile.stage === "Postpartum" || activeProfile.stage === 2) stageIdx = 2;

        setStage(stageIdx);
        setPregnancyWeek(activeProfile.pregnancyWeek || "");
        setBmi(activeProfile.bmi || "");
        setHeight(activeProfile.height || "");
        setWeight(activeProfile.weight || "");
        setBloodSugarLevel(activeProfile.bloodSugarLevel || "");
        setHasGestDiabetes(activeProfile.hasGestDiabetes || false);
        setAvgCycleLength(activeProfile.avgCycleLength || "");
        setLastPeriodDate(formatDateString(activeProfile.lastPeriodDate));
        setDeliveryDate(formatDateString(activeProfile.deliveryDate));
        setIsBreastfeeding(activeProfile.isBreastfeeding || false);
        
        const conditions = activeProfile.medicalConditions || [];
        setSelectedConditions(conditions);
      }
    };
    loadData();
  }, [momProfile, fetchProfile]);

  // Recalculate BMI when Height/Weight change
  useEffect(() => {
    if (height && weight) {
      const hMeters = parseFloat(height) / 100;
      const wKg = parseFloat(weight);
      if (hMeters > 0 && wKg > 0) {
        const calculatedBmi = (wKg / (hMeters * hMeters)).toFixed(1);
        setBmi(calculatedBmi);
      }
    }
  }, [height, weight]);

  const handleConditionCheckbox = (cond) => {
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const handleAddCustomCondition = (e) => {
    e.preventDefault();
    if (customCondition.trim() && !selectedConditions.includes(customCondition.trim())) {
      setSelectedConditions([...selectedConditions, customCondition.trim()]);
      setCustomCondition("");
    }
  };

  const handleRemoveCondition = (cond) => {
    setSelectedConditions(selectedConditions.filter((c) => c !== cond));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare Dto payload mapping
    const payload = {
      id: momProfile?.id || 0,
      userId: momProfile?.userId || user?.id || "",
      stage: stage, // 0 = PrePregnancy, 1 = Pregnant, 2 = Postpartum
      pregnancyWeek: stage === 1 ? parseInt(pregnancyWeek) || null : null,
      bmi: bmi ? parseFloat(bmi) : null,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      bloodSugarLevel: bloodSugarLevel ? parseFloat(bloodSugarLevel) : null,
      hasGestDiabetes: hasGestDiabetes,
      medicalConditions: selectedConditions,
      avgCycleLength: stage === 0 ? parseInt(avgCycleLength) || null : null,
      lastPeriodDate: stage === 0 && lastPeriodDate ? new Date(lastPeriodDate).toISOString() : null,
      deliveryDate: (stage === 1 || stage === 2) && deliveryDate ? new Date(deliveryDate).toISOString() : null,
      isBreastfeeding: stage === 2 ? isBreastfeeding : false,
    };

    try {
      const result = await updateProfile(payload);
      if (result) {
        if (weight) {
          await updateWeightLog(weight);
        }
        toast.success("Cập nhật hồ sơ sức khỏe mami thành công! 🎉");
        
        // Auto-redirect to appropriate stage portal
        if (stage === 1) {
          navigate("/pregnancy");
        } else if (stage === 2) {
          navigate("/baby-nutrition");
        } else {
          navigate("/fertility");
        }
      } else {
        toast.error("Không thể cập nhật hồ sơ, vui lòng kiểm tra lại dữ liệu.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi khi cập nhật hồ sơ.");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      {/* Header Info */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-2xl font-black text-gray-850 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-momPink fill-momPink" />
            Hồ Sơ Sức Khỏe Mẹ
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-semibold">
            Cập nhật các chỉ số sinh lý và giai đoạn hành trình để AI gợi ý chính xác nhất.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Card 1: Giai đoạn hành trình */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-momPink" />
            Giai đoạn hiện tại của bạn
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 0, label: "Chuẩn bị mang thai", desc: "Theo dõi chu kỳ kinh nguyệt & rụng trứng", icon: Calendar, color: "hover:border-momPink" },
              { id: 1, label: "Đang mang thai", desc: "Theo dõi tuần thai và sự phát triển của bé", icon: Heart, color: "hover:border-momPurple" },
              { id: 2, label: "Hậu sản & Nuôi con", desc: "Chăm sóc bé sơ sinh & hồi phục sức khỏe mẹ", icon: Baby, color: "hover:border-momGreen" }
            ].map((opt) => {
              const Icon = opt.icon;
              const isSelected = stage === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStage(opt.id)}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all duration-300 ${
                    isSelected
                      ? "bg-gradient-to-tr from-momPink/5 to-momPurple/5 border-momPink ring-2 ring-momPink/20 dark:border-pink-500"
                      : "bg-transparent border-gray-100 dark:border-gray-700/60 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <div className={`p-2 rounded-xl ${isSelected ? "bg-momPink text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    {isSelected && <span className="text-[10px] bg-momPink text-white px-2 py-0.5 rounded-full font-bold">Hoạt động</span>}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-850 dark:text-white">{opt.label}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 2: Chỉ số sinh học */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-momPurple" />
            Các chỉ số sức khỏe & sinh lý
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Chiều cao */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">Chiều cao (cm)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Nhập chiều cao"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-momPink/30"
              />
            </div>

            {/* Cân nặng */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">Cân nặng (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Nhập cân nặng"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-momPink/30"
              />
            </div>

            {/* Chỉ số BMI */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 flex justify-between">
                <span>Chỉ số BMI</span>
                {height && weight && <span className="text-[10px] text-momPink font-black">Tự động tính từ H/W</span>}
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="BMI của bạn"
                value={bmi}
                onChange={(e) => setBmi(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-momPink/30"
              />
            </div>

            {/* Chỉ số đường huyết */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">Chỉ số Đường Huyết (mmol/L)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ví dụ: 5.4"
                value={bloodSugarLevel}
                onChange={(e) => setBloodSugarLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-momPink/30"
              />
            </div>
          </div>

          {/* Tiểu đường thai kỳ Checkbox */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="gestDiabetes"
              checked={hasGestDiabetes}
              onChange={(e) => setHasGestDiabetes(e.target.checked)}
              className="w-5 h-5 rounded-md border-gray-300 dark:border-gray-600 text-momPink focus:ring-momPink"
            />
            <label htmlFor="gestDiabetes" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
              Tôi được chẩn đoán mắc Tiểu đường thai kỳ (Gestational Diabetes)
            </label>
          </div>
        </div>

        {/* Card 3: Chi tiết dựa trên từng giai đoạn hành trình */}
        {(stage === 0 || stage === 1 || stage === 2) && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-momPink" />
              Chi tiết giai đoạn: {stage === 0 ? "Chuẩn bị thụ thai" : stage === 1 ? "Mami bầu" : "Nuôi con nhỏ"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* STAGE 0: PrePregnancy */}
              {stage === 0 && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">Độ dài chu kỳ kinh trung bình (ngày)</label>
                    <input
                      type="number"
                      placeholder="Mặc định: 28"
                      value={avgCycleLength}
                      onChange={(e) => setAvgCycleLength(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-momPink/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">Ngày bắt đầu chu kỳ cuối cùng</label>
                    <input
                      type="date"
                      value={lastPeriodDate}
                      onChange={(e) => setLastPeriodDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-momPink/30"
                    />
                  </div>
                </>
              )}

              {/* STAGE 1: Pregnant */}
              {stage === 1 && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">Tuần thai hiện tại (Tuần)</label>
                    <input
                      type="number"
                      min="1"
                      max="42"
                      placeholder="Ví dụ: 12"
                      value={pregnancyWeek}
                      onChange={(e) => setPregnancyWeek(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-momPink/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">Ngày dự sinh (EDD)</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-momPink/30"
                    />
                  </div>
                </>
              )}

              {/* STAGE 2: Postpartum */}
              {stage === 2 && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">Ngày sinh em bé</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-momPink/30"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-8">
                    <input
                      type="checkbox"
                      id="breastfeeding"
                      checked={isBreastfeeding}
                      onChange={(e) => setIsBreastfeeding(e.target.checked)}
                      className="w-5 h-5 rounded-md border-gray-300 dark:border-gray-600 text-momPink focus:ring-momPink"
                    />
                    <label htmlFor="breastfeeding" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                      Tôi đang nuôi con hoàn toàn bằng sữa mẹ
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Card 4: Tiền sử & Bệnh lý */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Heart className="w-4.5 h-4.5 text-momPink" />
            Tình trạng bệnh lý & Tiền sử sức khỏe
          </h3>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 block">Chọn bệnh lý được chẩn đoán (nếu có):</label>
            <div className="flex flex-wrap gap-2.5">
              {COMMON_CONDITIONS.map((cond) => {
                const isSelected = selectedConditions.includes(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => handleConditionCheckbox(cond)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 ${
                      isSelected
                        ? "bg-momPink/10 text-momPink border-momPink"
                        : "bg-gray-50 dark:bg-gray-950/20 text-gray-500 border-gray-200 hover:border-gray-350 dark:border-gray-700"
                    }`}
                  >
                    {cond}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom condition input */}
          <div className="pt-2">
            <label className="text-xs font-bold text-gray-500 block mb-1.5">Thêm bệnh lý hoặc ghi chú khác:</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ví dụ: Thiếu Canxi, Suy giãn tĩnh mạch..."
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-momPink/30"
              />
              <button
                type="button"
                onClick={handleAddCustomCondition}
                className="px-4 py-2.5 bg-gray-150 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition-colors dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                Thêm tag
              </button>
            </div>
          </div>

          {/* Current tags display */}
          {selectedConditions.length > 0 && (
            <div className="pt-2 space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400">Danh sách đã chọn:</span>
              <div className="flex flex-wrap gap-2">
                {selectedConditions.map((cond) => (
                  <span
                    key={cond}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white text-xs font-bold rounded-xl"
                  >
                    {cond}
                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(cond)}
                      className="text-gray-450 hover:text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-momPink to-momPurple text-white disabled:bg-gray-200 disabled:text-gray-400 font-extrabold rounded-full text-base transition-all duration-300 shadow-lg shadow-pink-500/10 flex items-center justify-center gap-2 hover:opacity-95 active:scale-98"
        >
          {isLoading ? (
            "Đang cập nhật hồ sơ..."
          ) : (
            <>
              <Save className="w-5 h-5" />
              Lưu thay đổi hồ sơ
            </>
          )}
        </button>

      </form>
    </div>
  );
}
