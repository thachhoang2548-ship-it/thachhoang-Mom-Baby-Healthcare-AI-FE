import { useState, useContext, useEffect, useRef } from "react";
import AuthContext from "../contexts/AuthContext";
import { registerUser } from "../services/authService";
import { useNavigate, useLocation } from "react-router-dom";
import { MARKET, DIET_TYPES, USER_TYPES, SUBSCRIPTION_TIERS, COMMON_MATERNAL_CONDITIONS } from "../config/market.vn";

export default function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const registrationAttempted = useRef(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "female",
    height: "",
    weight: "",
    diseaseTags: "",
    dietType: "pre_natal",
    pregnancyStage: "pre-natal",
    pregnancyWeek: "",
    babyBirthDate: "",
    subscriptionTier: "free",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.consentAccepted && location.state?.registrationData && !registrationAttempted.current) {
      registrationAttempted.current = true;
      completeRegistration(location.state.registrationData);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    registrationAttempted.current = false;

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    navigate("/consent", { state: { registrationData: form } });
  };

  const completeRegistration = async (registrationData) => {
    setLoading(true);
    setError("");

    try {
      const dataToSend = {
        ...registrationData,
        diseaseTags: registrationData.diseaseTags
          ? registrationData.diseaseTags.split(",").map((d) => d.trim())
          : [],
        pregnancyWeek: registrationData.pregnancyStage === "pregnant" ? Number(registrationData.pregnancyWeek) : 0,
        babyBirthDate: registrationData.pregnancyStage === "post-natal" ? registrationData.babyBirthDate : null,
      };
      const { user, token } = await registerUser(dataToSend);
      login(user, token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
      setLoading(false);
      registrationAttempted.current = false;
    }
  };

  return (
    <div className="bg-white text-gray-800 min-h-screen relative overflow-hidden font-display">
      {loading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-800">Đang hoàn tất đăng ký...</p>
          </div>
        </div>
      )}

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[var(--saffron-light)] rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-100 rounded-full opacity-50 blur-3xl"></div>
      </div>

      <main className="relative flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6">
          <div className="glassmorphic rounded-2xl p-8 shadow-2xl border border-white/60">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold text-gray-900">Đăng ký Mom Ơi!</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{MARKET.tagline}</p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-lg">
                <p className="text-red-700 font-medium text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Họ và tên người mẹ *"
                value={form.name}
                onChange={handleChange}
                required
                className="form-input block w-full rounded-lg border-gray-200 bg-white/70 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={form.email}
                onChange={handleChange}
                required
                className="form-input block w-full rounded-lg border-gray-200 bg-white/70 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder={MARKET.phonePlaceholder}
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="form-input block w-full rounded-lg border-gray-200 bg-white/70 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <p className="text-[10px] text-gray-500 mt-1">{MARKET.phoneHint}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="password"
                  name="password"
                  placeholder="Mật khẩu *"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="form-input block w-full rounded-lg border-gray-200 bg-white/70 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu *"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="form-input block w-full rounded-lg border-gray-200 bg-white/70 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Giai đoạn thai kỳ *</label>
                  <select
                    name="pregnancyStage"
                    value={form.pregnancyStage}
                    onChange={handleChange}
                    className="form-select block w-full rounded-lg border-gray-200 bg-white/70 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  >
                    {USER_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Gói dịch vụ *</label>
                  <select
                    name="subscriptionTier"
                    value={form.subscriptionTier}
                    onChange={handleChange}
                    className="form-select block w-full rounded-lg border-gray-200 bg-white/70 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  >
                    {SUBSCRIPTION_TIERS.map((tier) => (
                      <option key={tier.value} value={tier.value}>
                        {tier.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {form.pregnancyStage === "pregnant" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tuần thai hiện tại (1 - 42) *</label>
                  <input
                    type="number"
                    name="pregnancyWeek"
                    placeholder="Tuần thai hiện tại (vd: 12)"
                    value={form.pregnancyWeek}
                    onChange={handleChange}
                    required
                    min={1}
                    max={42}
                    className="form-input block w-full rounded-lg border-gray-200 bg-white/70 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              )}

              {form.pregnancyStage === "post-natal" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày sinh của bé *</label>
                  <input
                    type="date"
                    name="babyBirthDate"
                    value={form.babyBirthDate}
                    onChange={handleChange}
                    required
                    className="form-input block w-full rounded-lg border-gray-200 bg-white/70 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="number"
                  name="age"
                  placeholder="Tuổi mẹ *"
                  value={form.age}
                  onChange={handleChange}
                  required
                  min={18}
                  max={50}
                  className="form-input block w-full rounded-lg border-gray-200 bg-white/70 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className="form-select block w-full rounded-lg border-gray-200 bg-white/70 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                >
                  <option value="female">Nữ</option>
                  <option value="male">Nam</option>
                  <option value="other">Khác</option>
                </select>
                <input
                  type="number"
                  name="height"
                  placeholder="Chiều cao mẹ (cm) *"
                  value={form.height}
                  onChange={handleChange}
                  required
                  className="form-input block w-full rounded-lg border-gray-200 bg-white/70 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <input
                  type="number"
                  name="weight"
                  placeholder="Cân nặng mẹ (kg) *"
                  value={form.weight}
                  onChange={handleChange}
                  required
                  className="form-input block w-full rounded-lg border-gray-200 bg-white/70 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Chế độ ăn khuyến nghị</label>
                <select
                  name="dietType"
                  value={form.dietType}
                  onChange={handleChange}
                  required
                  className="form-select block w-full rounded-lg border-gray-200 bg-white/70 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                >
                  {DIET_TYPES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                name="diseaseTags"
                placeholder={`Bệnh lý thai kỳ (vd: ${COMMON_MATERNAL_CONDITIONS.slice(0, 2).join(", ")})`}
                value={form.diseaseTags}
                onChange={handleChange}
                className="form-input block w-full rounded-lg border-gray-200 bg-white/70 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />

              <button
                type="submit"
                className="flex w-full justify-center rounded-lg bg-[var(--saffron)] px-3 py-3 text-sm font-semibold text-white shadow-lg hover:bg-pink-600 hover:text-white transition-all transform hover:-translate-y-0.5"
              >
                Tiếp theo — Điều khoản & Quyền riêng tư
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <a href="/login" className="font-semibold text-primary hover:underline">
                Đăng nhập
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
