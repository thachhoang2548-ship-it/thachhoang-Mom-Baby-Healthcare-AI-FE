import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import babyService from '../../../models/services/babyService';
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

  // ── Pre-fill form when editing ────────────────────────────────────────────
  useEffect(() => {
    if (isEditMode && existingBaby) {
      // Normalise the date to YYYY-MM-DD for the date input
      let dob = '';
      try {
        dob = new Date(existingBaby.birthDate || existingBaby.dateOfBirth)
          .toISOString()
          .substring(0, 10);
      } catch (_) {
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
        const updateRes = await babyService.updateBabyProfile(existingBaby.id, payload);
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

      // ── Step 5: Show success & redirect ────────────────────────────────────
      toast.success(
        isEditMode
          ? `Đã cập nhật hồ sơ bé ${formData.babyName} thành công! 🧸`
          : `Tạo hồ sơ bé ${formData.babyName} thành công! 🎉`
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
      <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-red-500">
        <AlertCircle className="w-3 h-3 shrink-0" />
        {errors[name]}
      </p>
    ) : null;

  /** Input wrapper — adds red border + background when field has an error */
  const inputClass = (name) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-momPink/30 focus:border-momPink
    dark:bg-gray-900 dark:text-white
    ${errors[name]
      ? 'border-red-400 bg-red-50/30 dark:border-red-600'
      : 'border-gray-200 dark:border-gray-700 bg-white'
    }`;

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto space-y-6">

      {/* ── Back button ── */}
      <button
        onClick={() => navigate('/baby-nutrition')}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại trang bé yêu
      </button>

      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-momPink to-momPurple flex items-center justify-center text-white shadow-md">
          <Baby className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-wide">
            {isEditMode ? 'Chỉnh Sửa Hồ Sơ Bé' : 'Thêm Hồ Sơ Bé Mới'}
          </h2>
          <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
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
        className="bg-white dark:bg-gray-800 rounded-3xl border border-pink-100/50 dark:border-gray-750 shadow-sm p-6 space-y-5"
      >

        {/* ── 1. Baby name ── */}
        <div>
          <label
            htmlFor="babyName"
            className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
          >
            <User className="w-3.5 h-3.5 text-momPink" />
            Tên bé <span className="text-red-400">*</span>
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
            className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-momPink" />
            Ngày sinh <span className="text-red-400">*</span>
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
          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            <Baby className="w-3.5 h-3.5 text-momPink" />
            Giới tính <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'male', label: 'Bé Trai 👦', activeColor: 'from-blue-400 to-blue-600' },
              { value: 'female', label: 'Bé Gái 👧', activeColor: 'from-momPink to-momPurple' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  handleChange({ target: { name: 'gender', value: opt.value } });
                }}
                disabled={loading}
                className={`py-3 rounded-2xl text-xs font-black transition-all duration-200 border
                  ${formData.gender === opt.value
                    ? `bg-gradient-to-r ${opt.activeColor} text-white border-transparent shadow-md scale-[1.02]`
                    : `bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400
                       border-gray-200 dark:border-gray-700 hover:border-momPink/40
                       ${errors.gender ? 'border-red-400 bg-red-50/30' : ''}`
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <FieldError name="gender" />
        </div>

        {/* ── 4 & 5. Weight + Height (side by side) ── */}
        <div className="grid grid-cols-2 gap-4">

          {/* Weight */}
          <div>
            <label
              htmlFor="weight"
              className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
            >
              <Scale className="w-3.5 h-3.5 text-momPink" />
              Cân nặng (kg) <span className="text-red-400">*</span>
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
              className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5 text-momPink" />
              Chiều cao (cm) <span className="text-red-400">*</span>
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
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-2xl">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 leading-relaxed">
              Vui lòng điền đầy đủ và chính xác các trường được đánh dấu <span className="font-black">*</span> trước khi lưu.
            </p>
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate('/baby-nutrition')}
            disabled={loading}
            className="py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
              text-xs font-black text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800
              transition active:scale-95 disabled:opacity-50"
          >
            Huỷ bỏ
          </button>

          <button
            type="submit"
            disabled={loading}
            className="py-3 rounded-2xl bg-gradient-to-r from-momPink to-momPurple text-white
              text-xs font-black shadow-md hover:opacity-95 transition active:scale-95
              flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditMode ? 'Đang cập nhật...' : 'Đang tạo...'}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {isEditMode ? 'Lưu thay đổi' : 'Tạo hồ sơ bé'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── Activity diagram note for context ── */}
      <p className="text-center text-[10px] text-gray-400 font-semibold pb-4">
        Sau khi lưu, hệ thống sẽ tự động cập nhật biểu đồ tăng trưởng WHO 📊
      </p>
    </div>
  );
}
