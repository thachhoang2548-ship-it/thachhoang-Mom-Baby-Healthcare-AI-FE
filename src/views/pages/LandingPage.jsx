import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthController } from '../../controllers/authController';
import {
  Heart,
  Calendar,
  Baby,
  MessageSquare,
  Activity,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Smile,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuthController();
  const navigate = useNavigate();

  const features = [
    {
      title: 'Hỗ Trợ Thụ Thai Tự Nhiên',
      desc: 'Theo dõi chu kỳ kinh nguyệt thông minh, dự đoán ngày rụng trứng và gợi ý thời điểm thụ thai lý tưởng cho mami.',
      icon: Calendar,
      color: 'from-pink-400 to-rose-500',
      badge: 'Giai đoạn 1',
    },
    {
      title: 'Chăm Sóc Thai Kỳ Toàn Diện',
      desc: 'Cập nhật sự phát triển của bé theo tuần, cung cấp thực đơn dinh dưỡng riêng biệt và bài tập Yoga an toàn cho mẹ bầu.',
      icon: Heart,
      color: 'from-purple-400 to-indigo-500',
      badge: 'Giai đoạn 2',
    },
    {
      title: 'Hồi Phục Sau Sinh & Tâm Lý Mẹ',
      desc: 'Nhật ký phục hồi thể trạng, bài test EPDS giúp phát hiện sớm và phòng tránh trầm cảm sau sinh (PPD).',
      icon: Smile,
      color: 'from-emerald-450 to-teal-500',
      badge: 'Giai đoạn 3',
    },
    {
      title: 'Chăm Sóc & Dinh Dưỡng Cho Bé',
      desc: 'Theo dõi chỉ số chiều cao, cân nặng, giấc ngủ của bé và gợi ý thực đơn ăn dặm khoa học theo độ tuổi.',
      icon: Baby,
      color: 'from-amber-400 to-orange-500',
      badge: 'Giai đoạn 4',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCF8F8] via-[#FFF3F5] to-[#F3EDF7] dark:from-[#0E0C0F] dark:via-[#19111C] dark:to-[#0F0C1B] text-gray-800 dark:text-gray-100 font-sans relative overflow-x-hidden selection:bg-momPink/30">
      {/* Decorative Blur Messes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-15%] w-[50%] aspect-square rounded-full bg-gradient-to-br from-pink-300/20 to-purple-400/20 blur-[130px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-br from-purple-300/15 to-pink-400/15 blur-[140px]"></div>
      </div>

      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 bg-white/40 dark:bg-gray-900/30 backdrop-blur-xl border-b border-white/40 dark:border-gray-850/50 py-4 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-momPink to-momPurple flex items-center justify-center text-white shadow-md">
            <span className="font-extrabold text-sm">MƠ</span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-momPink-dark to-momPurple-dark dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
              Mom Ơi!
            </h1>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Super-App Cho Mẹ & Bé</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-bold rounded-full shadow-lg shadow-momPink/20 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Vào Dashboard 🌸
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-momPink transition-colors"
              >
                Đăng nhập
              </Link>
              <button
                onClick={() => navigate('/register')}
                className="px-5 py-2.5 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-bold rounded-full shadow-lg shadow-momPink/20 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Đăng ký ngay
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 text-center space-y-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-momPink-light/80 dark:bg-momPink/20 text-momPink-dark dark:text-pink-300">
          <Sparkles className="w-3.5 h-3.5 text-momPink animate-pulse" /> Trợ lý chẩn đoán AI đồng hành suốt 4 giai đoạn làm mẹ
        </span>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight max-w-4xl mx-auto font-display">
          Chăm Sóc Sức Khỏe Mẹ & Bé Khỏe Mạnh Với{' '}
          <span className="bg-gradient-to-r from-momPink via-rose-500 to-momPurple bg-clip-text text-transparent">Trí Tuệ Nhân Tạo AI</span>
        </h1>

        <p className="text-xs sm:text-sm text-gray-505 dark:text-gray-400 font-semibold max-w-2xl mx-auto leading-relaxed">
          Mom Ơi! là siêu ứng dụng cá nhân hóa trọn vẹn từ lúc mẹ chuẩn bị mang thai, theo dõi thai kỳ, hồi phục thể trạng sau sinh cho đến việc chăm sóc dinh dưỡng từng ngày cho bé yêu.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-momPink to-momPurple text-white text-sm font-bold rounded-full shadow-xl hover:shadow-momPink/25 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>Vào trang quản trị</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-momPink to-momPurple text-white text-sm font-bold rounded-full shadow-xl hover:shadow-momPink/25 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Bắt đầu miễn phí ngay</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 bg-white/80 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-900 border border-white/60 dark:border-gray-850 text-gray-700 dark:text-gray-200 text-sm font-bold rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Đăng nhập tài khoản
              </button>
            </>
          )}
        </div>
      </section>

      {/* Modules Overview */}
      <section className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-display">
            Giải Pháp Cải Thiện Sức Khỏe Cho 4 Giai Đoạn Vàng
          </h2>
          <p className="text-xs text-gray-450 dark:text-gray-400 font-semibold max-w-lg mx-auto">
            Hệ sinh thái tính năng được thiết kế chuyên biệt để hỗ trợ mẹ trong từng bước đi nhỏ nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-white/40 dark:bg-gray-850/20 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 dark:border-gray-800/80 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <span className="inline-block text-[9px] font-bold text-momPink bg-momPink-light/60 dark:bg-momPink/25 px-2.5 py-0.5 rounded-full uppercase">
                    {feat.badge}
                  </span>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white leading-snug">
                    {feat.title}
                  </h3>
                  <p className="text-[11px] text-gray-505 dark:text-gray-400 font-semibold leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI Integrated Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-momPink/5 via-momPurple/5 to-pink-100/5 dark:from-momPink/5 dark:to-transparent border border-white/50 dark:border-gray-850 p-8 sm:p-12 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] backdrop-blur-md flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-6 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-momPurple/10 text-momPurple-dark dark:text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-momPurple" /> Tích Hợp AI Chuyên Sâu
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight font-display">
              Chẩn Đoán Sức Khỏe AI Nhanh Chóng & Chuẩn Xác
            </h2>
            <p className="text-xs sm:text-sm text-gray-505 dark:text-gray-400 font-semibold leading-relaxed">
              Nhờ sự trợ giúp đắc lực của công nghệ AI, mẹ có thể tải lên hình ảnh hoặc mô tả dấu hiệu sức khỏe bất thường của cả mẹ và bé (như phát ban, chàm sữa, rôm sảy) để nhận gợi ý chăm sóc sơ bộ và định hướng chuyên khoa tức thì 24/7.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-momGreen" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">An toàn & Bảo mật</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-momPink" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Thông tin chuẩn y tế</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-96 bg-white/70 dark:bg-gray-900/60 p-6 rounded-[2.5rem] border border-white/60 dark:border-gray-850 shadow-md space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-momGreen flex items-center justify-center font-bold">
                🩺
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-gray-800 dark:text-white">Chẩn đoán triệu chứng AI</h4>
                <p className="text-[9px] text-gray-400 font-semibold">Phân tích dấu hiệu sức khỏe</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl rounded-tr-sm text-[10px] font-bold max-w-[85%] ml-auto">
                📸 [Tải lên ảnh má bé bị phát ban đỏ]
              </div>
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded-2xl rounded-tl-sm text-[10px] font-bold max-w-[90%]">
                Mami thân mến! Hình ảnh gợi ý dấu hiệu của chàm sữa nhẹ. Mẹ nên vệ sinh má bé sạch sẽ bằng nước ấm, tránh các sản phẩm tắm rửa chứa chất kích ứng và duy trì độ ẩm cho bé nhé.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/20 dark:bg-gray-900/10 backdrop-blur-md border border-white/40 dark:border-gray-850 p-8 rounded-[2.5rem] shadow-sm text-center">
          <div className="space-y-1">
            <h4 className="text-2xl sm:text-3xl font-black text-momPink">10,000+</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mẹ bầu tin dùng</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl sm:text-3xl font-black text-momPurple">98%</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">AI Phản hồi hữu ích</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl sm:text-3xl font-black text-momGreen">24/7</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tư vấn y tế tức thì</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl sm:text-3xl font-black text-momAmber">4.9 ★</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Đánh giá hài lòng</p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white font-display">
          Đồng Hành Cùng Bé Cưng Khôn Lớn Mỗi Ngày!
        </h2>
        <p className="text-xs text-gray-505 dark:text-gray-400 font-semibold max-w-xl mx-auto">
          Nhận thông tin chu kỳ thụ thai, nhật ký thai kỳ, thực đơn ăn dặm khoa học và trợ lý chẩn đoán triệu chứng AI ngay hôm nay.
        </p>
        <button
          onClick={() => navigate('/register')}
          className="px-10 py-4 bg-gradient-to-r from-momPink to-momPurple text-white text-sm font-extrabold rounded-full shadow-xl hover:shadow-momPink/30 hover:scale-105 active:scale-95 transition-all duration-300"
        >
          Đăng Ký Tài Khoản Ngay 🌸
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-150 dark:border-gray-850 bg-white/20 dark:bg-gray-950/20 backdrop-blur-md py-8 text-center text-[10px] text-gray-450 font-bold">
        <p>© 2026 Mom Ơi! - Trợ Lý Chăm Sóc Sức Khỏe Mẹ và Bé Toàn Diện Bằng AI. Bảo lưu mọi quyền.</p>
      </footer>
    </div>
  );
}
