import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProfileController } from "../../controllers/profileController";
import { useAuthController } from "../../controllers/authController";
import { getTierNameVi } from "../../utils/tierHelpers";
import {
  Heart,
  Activity,
  Calendar,
  Baby,
  ArrowLeft,
  Save,
  Sparkles,
  ChevronRight,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

// Helper to format Date objects to YYYY-MM-DD for input elements
const formatDateString = (dateVal) => {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const COMMON_CONDITIONS = [
  "Cao huyết áp",
  "Thiếu máu",
  "Suy nhược",
  "Dị ứng ứng thuốc",
  "Hen suyễn",
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, tier } = useAuthController();
  const { momProfile, fetchProfile, updateProfile, updateWeightLog, isLoading } =
    useProfileController();

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

  const calculateBmiValue = (hVal, wVal) => {
    if (!hVal || !wVal) return null;
    const hMeters = parseFloat(hVal) / 100;
    const wKg = parseFloat(wVal);
    if (hMeters > 0 && wKg > 0) {
      return (wKg / (hMeters * hMeters)).toFixed(1);
    }
    return null;
  };

  const calculatePregnancyFromLmp = (lmpStr) => {
    if (!lmpStr) return null;
    const lmp = new Date(lmpStr);
    if (isNaN(lmp.getTime())) return null;
    const edd = new Date(lmp);
    edd.setDate(edd.getDate() + 280);
    const diffTime = Math.abs(new Date() - lmp);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let calculatedWeek = Math.floor(diffDays / 7) + 1;
    if (calculatedWeek < 1) calculatedWeek = 1;
    if (calculatedWeek > 42) calculatedWeek = 42;
    return {
      edd: edd.toISOString().split("T")[0],
      week: calculatedWeek,
    };
  };

  // Load profile details into form
  useEffect(() => {
    const loadData = async () => {
      let activeProfile = momProfile;
      if (!activeProfile) {
        activeProfile = await fetchProfile();
      }

      if (activeProfile) {
        let stageIdx = 0;
        if (activeProfile.stage === "Pregnant" || activeProfile.stage === 1) stageIdx = 1;
        else if (activeProfile.stage === "Postpartum" || activeProfile.stage === 2) stageIdx = 2;

        const initH = activeProfile.height || "";
        const initW = activeProfile.weight || "";
        const initLmp = formatDateString(activeProfile.lastPeriodDate);
        const computedBmi = calculateBmiValue(initH, initW);
        const computedPreg = stageIdx === 1 ? calculatePregnancyFromLmp(initLmp) : null;

        setStage(stageIdx);
        setPregnancyWeek(computedPreg ? computedPreg.week : (activeProfile.pregnancyWeek || ""));
        setBmi(computedBmi || activeProfile.bmi || "");
        setHeight(initH);
        setWeight(initW);
        setBloodSugarLevel(activeProfile.bloodSugarLevel || "");
        setHasGestDiabetes(activeProfile.hasGestDiabetes || false);
        setAvgCycleLength(activeProfile.avgCycleLength || "");
        setLastPeriodDate(initLmp);
        setDeliveryDate(computedPreg ? computedPreg.edd : formatDateString(activeProfile.deliveryDate));
        setIsBreastfeeding(activeProfile.isBreastfeeding || false);

        const conditions = activeProfile.medicalConditions || [];
        setSelectedConditions(conditions);
      }
    };
    loadData();
  }, [momProfile, fetchProfile]);

  const handleStageSelect = (nextStage) => {
    setStage(nextStage);
    if (nextStage === 1 && lastPeriodDate) {
      const preg = calculatePregnancyFromLmp(lastPeriodDate);
      if (preg) {
        setDeliveryDate(preg.edd);
        setPregnancyWeek(preg.week);
      }
    }
  };

  const handleHeightChange = (val) => {
    setHeight(val);
    const nextBmi = calculateBmiValue(val, weight);
    if (nextBmi) setBmi(nextBmi);
  };

  const handleWeightChange = (val) => {
    setWeight(val);
    const nextBmi = calculateBmiValue(height, val);
    if (nextBmi) setBmi(nextBmi);
  };

  const handleLastPeriodChange = (val) => {
    setLastPeriodDate(val);
    if (stage === 1 && val) {
      const preg = calculatePregnancyFromLmp(val);
      if (preg) {
        setDeliveryDate(preg.edd);
        setPregnancyWeek(preg.week);
      }
    }
  };

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
      lastPeriodDate:
        (stage === 0 || stage === 1) && lastPeriodDate
          ? new Date(lastPeriodDate).toISOString()
          : null,
      deliveryDate:
        (stage === 1 || stage === 2) && deliveryDate
          ? new Date(deliveryDate).toISOString()
          : null,
      isBreastfeeding: stage === 2 ? isBreastfeeding : false,
    };

    try {
      const result = await updateProfile(payload);
      if (result) {
        if (weight) {
          await updateWeightLog(weight);
        }
        toast.success("Cập nhật hồ sơ sức khỏe của mẹ thành công!");

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

  const stageLabel =
    stage === 0 ? "Chuẩn bị mang thai" : stage === 1 ? "Đang mang thai" : "Hậu sản & nuôi con";

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10 font-display text-theme-ink">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 text-sm font-semibold text-theme-muted transition-colors hover:bg-theme-surface hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Quay lại</span>
      </button>

      {/* Header */}
      <div className="border-b border-theme-line pb-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-theme-brand-soft px-3.5 py-1 text-xs font-semibold text-theme-ink">
          <Heart className="h-3.5 w-3.5 text-theme-brand" />
          Hồ sơ cá nhân hóa
        </span>
        <h1 className="mt-2.5 text-2xl font-bold text-theme-ink sm:text-3xl">
          Hồ sơ sức khỏe của mẹ
        </h1>
        <p className="mt-1.5 text-sm text-theme-muted sm:text-base">
          Cập nhật giai đoạn hiện tại và các chỉ số cơ thể để Mom Ơi! gợi ý thực đơn, lịch chăm sóc sát nhất với mẹ.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 0: Gói dịch vụ & Quyền lợi hội viên */}
        <section className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-theme-line bg-theme-surface p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-theme-brand/20 bg-theme-brand-soft text-theme-brand">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-theme-muted">Gói dịch vụ hiện tại</span>
                <span className="rounded-full bg-status-ok/15 px-2.5 py-0.5 text-xs font-bold text-status-ok">
                  Đang kích hoạt
                </span>
              </div>
              <h2 className="mt-0.5 text-lg font-bold text-theme-ink">
                {getTierNameVi(tier)}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/upgrade")}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border border-theme-line bg-theme-page px-5 py-2.5 text-sm font-bold text-theme-ink transition-colors hover:border-theme-brand/40 hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
          >
            <span>Xem đặc quyền gói</span>
            <ChevronRight className="h-4 w-4 text-theme-muted" />
          </button>
        </section>

        {/* Card 1: Giai đoạn hành trình */}
        <section className="space-y-4 rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Activity className="h-5 w-5 text-theme-brand" />
            <h2 className="text-lg font-bold text-theme-ink">Giai đoạn hiện tại của mẹ</h2>
          </div>

          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
            {[
              {
                id: 0,
                label: "Chuẩn bị mang thai",
                desc: "Theo dõi chu kỳ kinh nguyệt & cửa sổ rụng trứng",
                icon: Calendar,
              },
              {
                id: 1,
                label: "Đang mang thai",
                desc: "Theo dõi tuần thai, dinh dưỡng bầu & sự phát triển của bé",
                icon: Heart,
              },
              {
                id: 2,
                label: "Hậu sản & nuôi con",
                desc: "Hồi phục sức khỏe mẹ, ăn dặm & tăng trưởng của bé",
                icon: Baby,
              },
            ].map((opt) => {
              const Icon = opt.icon;
              const isSelected = stage === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleStageSelect(opt.id)}
                  aria-pressed={isSelected}
                  className={`flex flex-col justify-between gap-3 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                    isSelected
                      ? "border-theme-brand bg-theme-brand-soft/75 text-theme-ink shadow-sm"
                      : "border-theme-line bg-theme-page/40 text-theme-ink hover:border-theme-brand/40 hover:bg-theme-surface"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isSelected
                          ? "bg-theme-brand text-theme-surface"
                          : "bg-theme-surface text-theme-muted border border-theme-line"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    {isSelected && (
                      <span className="rounded-full bg-theme-surface px-2.5 py-0.5 text-xs font-bold text-theme-ink border border-theme-brand/25">
                        Đang chọn
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-theme-ink">{opt.label}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-theme-muted">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Card 2: Chỉ số sinh học */}
        <section className="space-y-4 rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-theme-brand" />
            <h2 className="text-lg font-bold text-theme-ink">Chỉ số cơ thể &amp; sinh lý</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="profile-height" className="mb-1.5 block text-sm font-semibold text-theme-ink">
                Chiều cao (cm)
              </label>
              <input
                id="profile-height"
                type="number"
                step="0.1"
                placeholder="Ví dụ: 158"
                value={height}
                onChange={(e) => handleHeightChange(e.target.value)}
                className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-semibold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
              />
            </div>

            <div>
              <label htmlFor="profile-weight" className="mb-1.5 block text-sm font-semibold text-theme-ink">
                Cân nặng (kg)
              </label>
              <input
                id="profile-weight"
                type="number"
                step="0.1"
                placeholder="Ví dụ: 54.5"
                value={weight}
                onChange={(e) => handleWeightChange(e.target.value)}
                className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-semibold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label htmlFor="profile-bmi" className="text-sm font-semibold text-theme-ink">
                  Chỉ số BMI
                </label>
                {height && weight && (
                  <span className="text-xs font-semibold text-theme-brand">
                    Tự động tính từ chiều cao &amp; cân nặng
                  </span>
                )}
              </div>
              <input
                id="profile-bmi"
                type="number"
                step="0.01"
                placeholder="BMI của mẹ"
                value={bmi}
                onChange={(e) => setBmi(e.target.value)}
                className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-semibold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
              />
            </div>

            <div>
              <label htmlFor="profile-sugar" className="mb-1.5 block text-sm font-semibold text-theme-ink">
                Đường huyết lúc đói (mmol/L)
              </label>
              <input
                id="profile-sugar"
                type="number"
                step="0.1"
                placeholder="Ví dụ: 5.1"
                value={bloodSugarLevel}
                onChange={(e) => setBloodSugarLevel(e.target.value)}
                className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-semibold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
              />
            </div>
          </div>

          <label
            htmlFor="gestDiabetes"
            className="mt-2 flex cursor-pointer items-center gap-3 rounded-2xl border border-theme-line bg-theme-page/50 p-3.5"
          >
            <input
              type="checkbox"
              id="gestDiabetes"
              checked={hasGestDiabetes}
              onChange={(e) => setHasGestDiabetes(e.target.checked)}
              className="h-5 w-5 rounded border-theme-line accent-theme-brand"
            />
            <span className="text-sm font-semibold text-theme-ink">
              Tôi được bác sĩ chẩn đoán đái tháo đường thai kỳ
            </span>
          </label>
        </section>

        {/* Card 3: Chi tiết dựa trên từng giai đoạn hành trình */}
        <section className="space-y-4 rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-5 w-5 text-theme-brand" />
            <h2 className="text-lg font-bold text-theme-ink">
              Thông tin giai đoạn: {stageLabel}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {stage === 0 && (
              <>
                <div>
                  <label htmlFor="profile-cycle" className="mb-1.5 block text-sm font-semibold text-theme-ink">
                    Độ dài chu kỳ kinh trung bình (ngày)
                  </label>
                  <input
                    id="profile-cycle"
                    type="number"
                    placeholder="Mặc định: 28"
                    value={avgCycleLength}
                    onChange={(e) => setAvgCycleLength(e.target.value)}
                    className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-semibold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
                  />
                </div>

                <div>
                  <label htmlFor="profile-lmp-pre" className="mb-1.5 block text-sm font-semibold text-theme-ink">
                    Ngày bắt đầu kỳ kinh gần nhất
                  </label>
                  <input
                    id="profile-lmp-pre"
                    type="date"
                    value={lastPeriodDate}
                    onChange={(e) => handleLastPeriodChange(e.target.value)}
                    className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-semibold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
                  />
                </div>
              </>
            )}

            {stage === 1 && (
              <>
                <div>
                  <label htmlFor="profile-lmp-preg" className="mb-1.5 block text-sm font-semibold text-theme-ink">
                    Ngày đầu kỳ kinh cuối cùng (LMP)
                  </label>
                  <input
                    id="profile-lmp-preg"
                    type="date"
                    value={lastPeriodDate}
                    onChange={(e) => handleLastPeriodChange(e.target.value)}
                    className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-semibold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label htmlFor="profile-edd" className="text-sm font-semibold text-theme-ink">
                      Ngày dự sinh dự kiến (EDD)
                    </label>
                    {lastPeriodDate && (
                      <span className="text-xs font-semibold text-theme-brand">LMP + 280 ngày</span>
                    )}
                  </div>
                  <input
                    id="profile-edd"
                    type="date"
                    value={deliveryDate}
                    readOnly
                    className="min-h-[48px] w-full cursor-not-allowed rounded-2xl border border-theme-line bg-theme-sidebar/60 px-4 text-sm font-semibold text-theme-muted"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label htmlFor="profile-week" className="text-sm font-semibold text-theme-ink">
                      Tuần thai hiện tại (dự kiến)
                    </label>
                    {lastPeriodDate && (
                      <span className="text-xs font-semibold text-theme-brand">Tự động từ LMP</span>
                    )}
                  </div>
                  <input
                    id="profile-week"
                    type="number"
                    value={pregnancyWeek}
                    readOnly
                    className="min-h-[48px] w-full cursor-not-allowed rounded-2xl border border-theme-line bg-theme-sidebar/60 px-4 text-sm font-semibold text-theme-muted"
                  />
                </div>
              </>
            )}

            {stage === 2 && (
              <>
                <div>
                  <label htmlFor="profile-delivery" className="mb-1.5 block text-sm font-semibold text-theme-ink">
                    Ngày sinh em bé
                  </label>
                  <input
                    id="profile-delivery"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-semibold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
                  />
                </div>

                <div className="flex items-end">
                  <label
                    htmlFor="breastfeeding"
                    className="flex min-h-[48px] w-full cursor-pointer items-center gap-3 rounded-2xl border border-theme-line bg-theme-page/50 px-4 py-2.5"
                  >
                    <input
                      type="checkbox"
                      id="breastfeeding"
                      checked={isBreastfeeding}
                      onChange={(e) => setIsBreastfeeding(e.target.checked)}
                      className="h-5 w-5 rounded border-theme-line accent-theme-brand"
                    />
                    <span className="text-sm font-semibold text-theme-ink">
                      Đang nuôi con hoàn toàn bằng sữa mẹ
                    </span>
                  </label>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Card 4: Tiền sử & Bệnh lý */}
        <section className="space-y-4 rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Heart className="h-5 w-5 text-theme-brand" />
            <h2 className="text-lg font-bold text-theme-ink">Tiền sử &amp; tình trạng sức khỏe</h2>
          </div>

          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-theme-muted">
              Chọn tình trạng bác sĩ từng lưu ý (nếu có):
            </p>
            <div className="flex flex-wrap gap-2">
              {COMMON_CONDITIONS.map((cond) => {
                const isSelected = selectedConditions.includes(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => handleConditionCheckbox(cond)}
                    aria-pressed={isSelected}
                    className={`min-h-[40px] rounded-full border px-4 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:text-sm ${
                      isSelected
                        ? "border-theme-brand bg-theme-brand-soft text-theme-ink"
                        : "border-theme-line bg-theme-page/50 text-theme-muted hover:border-theme-brand/40 hover:text-theme-ink"
                    }`}
                  >
                    {cond}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-1">
            <label
              htmlFor="custom-condition"
              className="mb-1.5 block text-sm font-semibold text-theme-ink"
            >
              Thêm lưu ý sức khỏe khác:
            </label>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <input
                id="custom-condition"
                type="text"
                placeholder="Ví dụ: Thiếu canxi, suy giãn tĩnh mạch..."
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomCondition(e);
                  }
                }}
                className="min-h-[48px] flex-1 rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-medium text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
              />
              <button
                type="button"
                onClick={handleAddCustomCondition}
                className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-theme-line bg-theme-page px-5 py-2.5 text-sm font-bold text-theme-ink transition-colors hover:border-theme-brand/40 hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
              >
                <Plus className="h-4 w-4 text-theme-brand" />
                <span>Thêm vào hồ sơ</span>
              </button>
            </div>
          </div>

          {selectedConditions.length > 0 && (
            <div className="space-y-2 border-t border-theme-line pt-4">
              <span className="text-xs font-semibold text-theme-muted">Danh sách đang lưu:</span>
              <div className="flex flex-wrap gap-2">
                {selectedConditions.map((cond) => (
                  <span
                    key={cond}
                    className="inline-flex items-center gap-1.5 rounded-full border border-theme-line bg-theme-page px-3.5 py-1.5 text-xs font-bold text-theme-ink sm:text-sm"
                  >
                    <span>{cond}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(cond)}
                      aria-label={`Xóa ${cond}`}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-theme-muted hover:bg-red-100 hover:text-red-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-theme-brand px-6 py-3.5 text-base font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-theme-line disabled:text-theme-muted"
        >
          {isLoading ? (
            "Đang cập nhật hồ sơ..."
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Lưu thay đổi hồ sơ</span>
            </>
          )}
        </button>

        {/* Quyền riêng tư & xóa tài khoản */}
        <div className="flex flex-col items-center justify-between gap-2 border-t border-theme-line pt-4 text-xs text-theme-muted sm:flex-row">
          <Link
            to="/consent"
            className="inline-flex min-h-[44px] items-center font-semibold text-theme-muted underline decoration-theme-line underline-offset-4 hover:text-theme-ink"
          >
            Điều khoản &amp; Quyền riêng tư
          </Link>
          <Link
            to="/delete-account"
            className="inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-red-700 hover:underline"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Xóa tài khoản</span>
          </Link>
        </div>
      </form>
    </div>
  );
}
