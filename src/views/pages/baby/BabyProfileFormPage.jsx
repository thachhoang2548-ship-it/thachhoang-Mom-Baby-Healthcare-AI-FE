import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import babyService from '../../../models/services/babyService';
import { formatBabyDisplayName, setGlobalActiveBaby, useBabyTheme } from '../../../hooks/useBabyTheme';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Baby,
  User,
  Calendar,
  Scale,
  Maximize2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Info
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// BabyProfileFormPage
// Implements: Create & Update Baby Profile (Activity Diagram)
//
// Route usage:
//   /baby-nutrition/create-baby          → Create mode
//   /baby-nutrition/edit-baby?id=<id>    → Edit mode  (pass existing baby via
//                                          location.state.baby)
// ─────────────────────────────────────────────────────────────────────────────
export default function BabyProfileFormPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Detect edit vs create mode ────────────────────────────────────────────
  // The parent page passes the baby object through router state when editing.
  const existingBaby = location.state?.baby ?? null;
  const isEditMode = Boolean(existingBaby);

  // ── Step 1 – Form state (required by Technical Requirements) ──────────────
  const [formData, setFormData] = useState({
    babyName: '',
    dateOfBirth: '',
    gender: '',      // 'male' | 'female'
    weight: '',      // kg
    height: '',      // cm
  });

  // ── Step 2 – Validation errors state ─────────────────────────────────────
  const [errors, setErrors] = useState({});

  // ── Loading state ─────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);

  // Bắt buộc gọi ở đầu component, TRƯỚC mọi return sớm.
  // Khi người dùng chọn giới tính trên form hoặc đang sửa hồ sơ có sẵn, bật ngay theme tương ứng.
  const activeGender = formData.gender || existingBaby?.gender;
  useBabyTheme(activeGender !== '' && activeGender !== undefined ? { gender: activeGender } : null);

  // ── Pre-fill form when editing ────────────────────────────────────────────
  useEffect(() => {
    if (isEditMode && existingBaby) {
      // Normalise the date to YYYY-MM-DD for the date input
      let dob = '';
      try {
        dob = new Date(existingBaby.birthDate || existingBaby.dateOfBirth)
          .toISOString()
          .substring(0, 10);
      } catch {
        dob = '';
      }

      setFormData({
        babyName: existingBaby.name || existingBaby.babyName || '',
        dateOfBirth: dob,
        gender: existingBaby.gender === 0 || existingBaby.gender === 'male' ? 'male' : 'female',
        weight: String(existingBaby.currentWeightKg || existingBaby.birthWeightKg || ''),
        height: String(existingBaby.currentHeightCm || existingBaby.birthHeightCm || ''),
      });
    }
  }, [isEditMode, existingBaby]);

  // ────────────────────────────────────────────────────────────────────────────
  // handleChange – controlled input handler
  // Updates formData and clears the error for the changed field so the user
  // gets immediate visual feedback as they correct mistakes.
  // ────────────────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear the error for this specific field the moment the user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // validateForm – checks all required fields; returns true / false
  //
  // Required fields (per Activity Diagram §5):
  //   babyName, dateOfBirth, gender, weight, height
  // ────────────────────────────────────────────────────────────────────────────
  const validateForm = () => {
    const newErrors = {};

    // Baby name: must not be empty or whitespace-only
    if (!formData.babyName.trim()) {
      newErrors.babyName = 'Vui lòng nhập tên bé.';
    }

    // Date of birth: must be provided and cannot be in the future
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Vui lòng chọn ngày sinh của bé.';
    } else {
      const dob = new Date(formData.dateOfBirth);
      if (dob > new Date()) {
        newErrors.dateOfBirth = 'Ngày sinh không thể là ngày trong tương lai.';
      }
    }

    // Gender: must be selected
    if (!formData.gender) {
      newErrors.gender = 'Vui lòng chọn giới tính của bé.';
    }

    // Weight (kg): required, positive number, reasonable range (0.5 – 30 kg)
    if (!formData.weight) {
      newErrors.weight = 'Vui lòng nhập cân nặng của bé.';
    } else {
      const w = parseFloat(formData.weight);
      if (isNaN(w) || w <= 0) {
        newErrors.weight = 'Cân nặng phải là số dương.';
      } else if (w < 0.5 || w > 30) {
        newErrors.weight = 'Cân nặng hợp lệ: 0.5 – 30 kg.';
      }
    }

    // Height (cm): required, positive number, reasonable range (30 – 130 cm)
    if (!formData.height) {
      newErrors.height = 'Vui lòng nhập chiều cao của bé.';
    } else {
      const h = parseFloat(formData.height);
      if (isNaN(h) || h <= 0) {
        newErrors.height = 'Chiều cao phải là số dương.';
      } else if (h < 30 || h > 130) {
        newErrors.height = 'Chiều cao hợp lệ: 30 – 130 cm.';
      }
    }

    setErrors(newErrors);

    // Return true only when there are no errors
    return Object.keys(newErrors).length === 0;
  };

  // ────────────────────────────────────────────────────────────────────────────
  // handleSubmit – Activity Diagram implementation
  //
  // Flow:
  //   1. Validate → abort + show errors if invalid
  //   2. Build payload
  //   3. createBabyProfile() or updateBabyProfile()
  //   4. updateGrowthBaseline()
  //   5. Toast success + navigate to /baby-nutrition
  // ────────────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Step 1: Validate – if invalid, stop here (DO NOT call API) ─────────
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại các trường thông tin còn thiếu hoặc sai.');
      return;
    }

    setLoading(true);

    try {
      // ── Step 2: Build the payload ──────────────────────────────────────────
      const payload = {
        babyName: formData.babyName.trim(),
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        gender: formData.gender === 'male' ? 0 : 1,
        currentWeightKg: parseFloat(formData.weight),
        currentHeightCm: parseFloat(formData.height),
      };

      let savedBabyId;

      // ── Step 3: Save baby profile ──────────────────────────────────────────
      if (isEditMode) {
        // Update existing baby profile
        // Gửi lại dị ứng và lịch sử ăn hiện có: form này không chỉnh hai mục đó, nếu thiếu thì
        // babyService.updateProfile sẽ thay bằng danh sách rỗng và xóa dữ liệu trên server.
        const updateRes = await babyService.updateBabyProfile(existingBaby.id, {
          ...payload,
          allergies: existingBaby.allergies,
          foodHistory: existingBaby.foodHistory,
        });
        const isOk = updateRes?.isSuccess || updateRes?.success;
        if (!isOk) {
          toast.error(updateRes?.message || 'Cập nhật hồ sơ bé không thành công.');
          return;
        }
        savedBabyId = existingBaby.id;
      } else {
        // Create new baby profile
        const createRes = await babyService.createBabyProfile(payload);
        const isOk = createRes?.isSuccess || createRes?.success;
        if (!isOk) {
          toast.error(createRes?.message || 'Tạo hồ sơ bé không thành công.');
          return;
        }
        // The backend returns the newly created baby in createRes.data
        savedBabyId = createRes?.data?.id ?? null;
      }

      // ── Step 4: Update growth-chart baseline ───────────────────────────────
      if (savedBabyId) {
        try {
          await babyService.updateGrowthBaseline(savedBabyId);
        } catch (baselineErr) {
          // Non-fatal: warn in console but don't block the success flow
          console.warn('[BabyProfileForm] updateGrowthBaseline failed:', baselineErr);
        }
      }

      // Đồng bộ ngay theme toàn trang theo giới tính bé vừa lưu
      setGlobalActiveBaby({
        id: savedBabyId,
        name: formData.babyName.trim(),
        gender: payload.gender,
      });

      // ── Step 5: Show success & redirect ────────────────────────────────────
      toast.success(
        isEditMode
          ? `Đã cập nhật hồ sơ ${formatBabyDisplayName(formData.babyName)} thành công!`
          : `Tạo hồ sơ ${formatBabyDisplayName(formData.babyName)} thành công!`
      );

      // Navigate back to Baby Profile dashboard
      navigate('/baby-nutrition');
    } catch (err) {
      // ── Error handling ─────────────────────────────────────────────────────
      console.error('[BabyProfileForm] handleSubmit error:', err);
      const serverMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
      toast.error(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Renders an inline error message below a field */
  const FieldError = ({ name }) =>
    errors[name] ? (
      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-status-warn-text">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{errors[name]}</span>
      </p>
    ) : null;

  /** Input wrapper — adds warning border + background when field has an error */
  const inputClass = (name) =>
    `w-full min-h-[44px] px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-medium text-theme-ink placeholder:text-theme-muted transition-colors
    focus:outline-none focus:ring-2 focus:ring-theme-brand
    ${
      errors[name]
        ? 'border-status-warn-line bg-status-warn-bg/60'
        : 'border-theme-line bg-theme-surface'
    }`;

  // Khi chưa chọn giới tính ở chế độ tạo mới, --c-brand mặc định (#FF7A8A) chưa đạt 4,5:1 với chữ trắng;
  // dùng bg-theme-ink text-theme-surface nếu chưa bật theme.
  const hasTheme = Boolean(activeGender !== '' && activeGender !== undefined);
  const submitBtnClass = hasTheme
    ? 'bg-theme-brand hover:bg-theme-ink text-theme-surface'
    : 'bg-theme-ink hover:bg-status-ok text-theme-surface';

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="font-display max-w-2xl mx-auto space-y-6 pb-8 text-theme-ink">
      {/* ── Back button ── */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/baby-nutrition')}
          className="inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-2xl border border-theme-line bg-theme-surface hover:bg-theme-sidebar text-xs sm:text-sm font-semibold text-theme-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Quay lại trang bé yêu</span>
        </button>
      </div>

      {/* ── Page header ── */}
      <div className="flex items-center gap-3.5 bg-theme-surface p-5 rounded-2xl border border-theme-line shadow-sm">
        <div
          className={`w-12 h-12 rounded-2xl border border-theme-line flex items-center justify-center shrink-0 ${
            hasTheme ? 'bg-theme-brand-soft text-theme-brand' : 'bg-theme-sidebar text-theme-ink'
          }`}
        >
          <Baby className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-lg sm:text-xl font-bold text-theme-ink">
            {isEditMode ? 'Chỉnh sửa hồ sơ bé' : 'Thêm hồ sơ bé mới'}
          </h1>
          <p className="text-xs sm:text-sm text-theme-muted font-medium">
            {isEditMode
              ? 'Cập nhật thông tin bé yêu của mami'
              : 'Tạo hồ sơ để theo dõi tăng trưởng chuẩn WHO'}
          </p>
        </div>
      </div>

      {/* ── Form card ── */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-theme-surface rounded-2xl border border-theme-line shadow-sm p-5 sm:p-6 space-y-5"
      >
        {/* ── 1. Baby name ── */}
        <div>
          <label
            htmlFor="babyName"
            className="flex items-center gap-1.5 text-xs font-bold text-theme-ink mb-1.5"
          >
            <User className="w-4 h-4 text-theme-ink shrink-0" aria-hidden="true" />
            <span>Tên bé</span>
            <span className="text-status-warn-text">*</span>
          </label>
          <input
            id="babyName"
            name="babyName"
            type="text"
            placeholder="VD: Bé Khoai, Bé Bơ..."
            value={formData.babyName}
            onChange={handleChange}
            className={inputClass('babyName')}
            disabled={loading}
            autoComplete="off"
          />
          <FieldError name="babyName" />
        </div>

        {/* ── 2. Date of birth ── */}
        <div>
          <label
            htmlFor="dateOfBirth"
            className="flex items-center gap-1.5 text-xs font-bold text-theme-ink mb-1.5"
          >
            <Calendar className="w-4 h-4 text-theme-ink shrink-0" aria-hidden="true" />
            <span>Ngày sinh</span>
            <span className="text-status-warn-text">*</span>
          </label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            max={new Date().toISOString().substring(0, 10)}
            value={formData.dateOfBirth}
            onChange={handleChange}
            className={inputClass('dateOfBirth')}
            disabled={loading}
          />
          <FieldError name="dateOfBirth" />
        </div>

        {/* ── 3. Gender ── */}
        <div>
          <span className="flex items-center gap-1.5 text-xs font-bold text-theme-ink mb-1.5">
            <Baby className="w-4 h-4 text-theme-ink shrink-0" aria-hidden="true" />
            <span>Giới tính</span>
            <span className="text-status-warn-text">*</span>
          </span>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'male', label: 'Bé trai' },
              { value: 'female', label: 'Bé gái' },
            ].map((opt) => {
              const isSelected = formData.gender === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    handleChange({ target: { name: 'gender', value: opt.value } });
                  }}
                  disabled={loading}
                  className={`min-h-[48px] py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-colors border inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                    isSelected
                      ? 'bg-theme-brand text-theme-surface border-theme-brand'
                      : errors.gender
                      ? 'border-status-warn-line bg-status-warn-bg/60 text-theme-ink hover:bg-theme-sidebar'
                      : 'bg-theme-page text-theme-ink border-theme-line hover:bg-theme-sidebar'
                  }`}
                >
                  <Baby className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
          <FieldError name="gender" />
        </div>

        {/* ── 4 & 5. Weight + Height (side by side) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Weight */}
          <div>
            <label
              htmlFor="weight"
              className="flex items-center gap-1.5 text-xs font-bold text-theme-ink mb-1.5"
            >
              <Scale className="w-4 h-4 text-theme-ink shrink-0" aria-hidden="true" />
              <span>Cân nặng (kg)</span>
              <span className="text-status-warn-text">*</span>
            </label>
            <input
              id="weight"
              name="weight"
              type="number"
              step="0.01"
              min="0.5"
              max="30"
              placeholder="VD: 3.2"
              value={formData.weight}
              onChange={handleChange}
              className={inputClass('weight')}
              disabled={loading}
            />
            <FieldError name="weight" />
          </div>

          {/* Height */}
          <div>
            <label
              htmlFor="height"
              className="flex items-center gap-1.5 text-xs font-bold text-theme-ink mb-1.5"
            >
              <Maximize2 className="w-4 h-4 text-theme-ink shrink-0" aria-hidden="true" />
              <span>Chiều cao (cm)</span>
              <span className="text-status-warn-text">*</span>
            </label>
            <input
              id="height"
              name="height"
              type="number"
              step="0.1"
              min="30"
              max="130"
              placeholder="VD: 50"
              value={formData.height}
              onChange={handleChange}
              className={inputClass('height')}
              disabled={loading}
            />
            <FieldError name="height" />
          </div>
        </div>

        {/* ── Global error summary (shown only when errors exist) ── */}
        {Object.keys(errors).length > 0 && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3.5 bg-status-warn-bg border border-status-warn-line rounded-2xl text-status-warn-text"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs font-semibold leading-relaxed">
              Vui lòng điền đầy đủ và chính xác các trường được đánh dấu <span className="font-bold">*</span> trước khi lưu.
            </p>
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/baby-nutrition')}
            disabled={loading}
            className="min-h-[48px] py-3 px-4 rounded-2xl border border-theme-line bg-theme-surface hover:bg-theme-sidebar text-xs sm:text-sm font-bold text-theme-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand disabled:opacity-50"
          >
            Huỷ bỏ
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`min-h-[48px] py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand disabled:opacity-60 ${submitBtnClass}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none shrink-0" aria-hidden="true" />
                <span>{isEditMode ? 'Đang cập nhật...' : 'Đang tạo...'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{isEditMode ? 'Lưu thay đổi' : 'Tạo hồ sơ bé'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── Activity diagram note for context ── */}
      <div className="flex items-center justify-center gap-2 text-center text-xs text-theme-muted font-medium pb-1">
        <Info className="w-4 h-4 shrink-0 text-theme-ink" aria-hidden="true" />
        <span>Sau khi lưu, hệ thống sẽ tự động cập nhật biểu đồ tăng trưởng WHO</span>
      </div>
    </div>
  );
}
