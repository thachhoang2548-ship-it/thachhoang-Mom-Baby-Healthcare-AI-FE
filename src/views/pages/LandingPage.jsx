import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Baby,
  Calendar,
  ChevronRight,
  Heart,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAuthController } from '../../controllers/authController';
import babyHeroMascot from '../../assets/baby-hero-mascot.png';
import momOiLogo from '../../assets/Logo/mom-oi-submark-cropped.png';
import ScientificEvidenceFooter from '../components/common/ScientificEvidenceFooter';

function HeroBabyMascot() {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, x: 0, y: 0 });

  const handlePointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

    setTilt({
      rotateX: offsetY * -12,
      rotateY: offsetX * 16,
      x: offsetX * 14,
      y: offsetY * 12,
    });
  };

  const resetTilt = () => {
    setTilt({ rotateX: 0, rotateY: 0, x: 0, y: 0 });
  };

  return (
    <div
      className="relative mx-auto flex min-h-[360px] w-full max-w-[520px] items-center justify-center overflow-visible [perspective:1000px] sm:min-h-[460px]"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      <div className="absolute inset-x-8 bottom-8 h-14 rounded-[50%] bg-[#22332F]/12 blur-2xl" />

      <div
        className="relative z-10 will-change-transform"
        style={{
          transform: `translate3d(${tilt.x}px, ${tilt.y}px, 36px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
          transition: 'transform 140ms ease-out',
          transformStyle: 'preserve-3d',
        }}
      >
        <img
          src={babyHeroMascot}
          alt="Linh vật em bé 3D của Mom Ơi"
          className="hero-baby-idle w-[300px] select-none drop-shadow-[0_28px_45px_rgba(43,58,50,0.2)] sm:w-[410px] lg:w-[455px]"
          draggable="false"
        />
      </div>

      <div
        className="absolute left-0 top-16 z-20 flex items-center gap-2 rounded-lg border border-white/80 bg-white/85 px-3 py-2 text-xs font-bold text-[#27564C] shadow-lg shadow-emerald-900/5 backdrop-blur-md"
        style={{
          transform: `translate3d(${tilt.x * -0.8}px, ${tilt.y * -0.4}px, 72px)`,
          transition: 'transform 160ms ease-out',
        }}
      >
        <Activity className="h-4 w-4 text-momGreen" />
        Theo dõi tăng trưởng
      </div>

      <div
        className="absolute right-0 top-28 z-20 flex items-center gap-2 rounded-lg border border-white/80 bg-white/85 px-3 py-2 text-xs font-bold text-[#7A334A] shadow-lg shadow-rose-900/5 backdrop-blur-md"
        style={{
          transform: `translate3d(${tilt.x * -0.55}px, ${tilt.y * 0.45}px, 72px)`,
          transition: 'transform 160ms ease-out',
        }}
      >
        <Heart className="h-4 w-4 text-momPink" />
        Gợi ý chăm sóc
      </div>

      <div
        className="absolute bottom-14 left-8 z-20 flex items-center gap-2 rounded-lg border border-white/80 bg-white/85 px-3 py-2 text-xs font-bold text-[#4B3D73] shadow-lg shadow-violet-900/5 backdrop-blur-md"
        style={{
          transform: `translate3d(${tilt.x * 0.65}px, ${tilt.y * -0.5}px, 72px)`,
          transition: 'transform 160ms ease-out',
        }}
      >
        <MessageSquare className="h-4 w-4 text-momPurple" />
        AI hỏi đáp 24/7
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuthController();
  const navigate = useNavigate();

  const features = [
    {
      title: 'Hỗ trợ thụ thai tự nhiên',
      desc: 'Theo dõi chu kỳ, dự đoán ngày rụng trứng và gợi ý thời điểm phù hợp cho từng hồ sơ sức khỏe.',
      icon: Calendar,
      color: 'bg-rose-100 text-rose-600',
      badge: 'Giai đoạn 1',
    },
    {
      title: 'Chăm sóc thai kỳ',
      desc: 'Cập nhật phát triển của bé theo tuần, dinh dưỡng cá nhân hóa và nhắc lịch theo dõi quan trọng.',
      icon: Heart,
      color: 'bg-violet-100 text-violet-600',
      badge: 'Giai đoạn 2',
    },
    {
      title: 'Hồi phục sau sinh',
      desc: 'Theo dõi thể trạng, tinh thần và các dấu hiệu cần chú ý để mẹ phục hồi vững vàng hơn.',
      icon: ShieldCheck,
      color: 'bg-emerald-100 text-emerald-600',
      badge: 'Giai đoạn 3',
    },
    {
      title: 'Dinh dưỡng cho bé',
      desc: 'Lưu hồ sơ tăng trưởng, giấc ngủ và thực đơn ăn dặm khoa học theo từng độ tuổi.',
      icon: Baby,
      color: 'bg-amber-100 text-amber-600',
      badge: 'Giai đoạn 4',
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FFF8F6] text-gray-800 selection:bg-momPink/25">
      <header className="sticky top-0 z-50 border-b border-rose-100/80 bg-[#FFF8F6]/85 px-5 py-4 backdrop-blur-xl sm:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={momOiLogo}
              alt="Mom Ơi!"
              className="h-12 w-12 rounded-full object-cover shadow-md shadow-rose-200"
            />
            <div>
              <h1 className="font-brand text-2xl font-extrabold leading-none tracking-normal text-[#252033]">
                Mom Ơi!
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Mẹ khỏe, bé vui</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-gray-950/10 transition hover:-translate-y-0.5"
              >
                Dashboard
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-bold text-gray-600 transition hover:text-momPink-dark"
                >
                  Đăng nhập
                </Link>
                <button
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-gray-950/10 transition hover:-translate-y-0.5"
                >
                  Đăng ký
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative border-b border-rose-100/70 bg-[linear-gradient(135deg,#FFF8F6_0%,#FFF2F5_48%,#EFFAF5_100%)]">
          <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-8 px-5 pb-12 pt-10 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:pb-16">
            <div className="relative z-10 max-w-2xl text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-lg border border-rose-100 bg-white/75 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-momPink-dark shadow-sm">
                <Sparkles className="h-4 w-4" />
                Trợ lý AI cho mẹ và bé
              </span>

              <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-gray-950 sm:text-6xl">
                Chăm sóc mẹ và bé dễ hơn mỗi ngày
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm font-semibold leading-7 text-gray-600 sm:text-base lg:mx-0">
                Mom Ơi! giúp mẹ theo dõi hành trình thụ thai, thai kỳ, sau sinh và dinh dưỡng cho bé trong một không gian nhẹ nhàng, cá nhân hóa và dễ dùng trên điện thoại.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
                <button
                  onClick={() => navigate(user ? '/dashboard' : '/register')}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#F05F82] px-6 py-4 text-sm font-black text-white shadow-xl shadow-rose-300/40 transition hover:-translate-y-0.5 sm:w-auto"
                >
                  {user ? 'Vào dashboard' : 'Bắt đầu miễn phí'}
                  <ChevronRight className="h-5 w-5" />
                </button>
                {!user && (
                  <button
                    onClick={() => navigate('/login')}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white/80 px-6 py-4 text-sm font-black text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white sm:w-auto"
                  >
                    Tôi đã có tài khoản
                  </button>
                )}
              </div>

              <div className="mt-9 grid grid-cols-3 gap-3 text-left">
                {[
                  ['4', 'giai đoạn chăm sóc'],
                  ['24/7', 'AI đồng hành'],
                  ['98%', 'phản hồi hữu ích'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-lg border border-white/80 bg-white/65 p-3 shadow-sm backdrop-blur">
                    <p className="text-xl font-black text-gray-950">{value}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase leading-4 tracking-wide text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <HeroBabyMascot />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-10">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-momPink-dark">Hệ sinh thái chăm sóc</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                Theo sát từng giai đoạn của mẹ và bé
              </h2>
            </div>
            <p className="max-w-md text-sm font-semibold leading-6 text-gray-500">
              Các module được thiết kế để dùng nhanh trên mobile, dễ quét thông tin và không làm mẹ bị quá tải.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${feature.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-md bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-gray-500">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-gray-950">{feature.title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-gray-500">{feature.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-violet-600">
                <Sparkles className="h-4 w-4" />
                AI hỗ trợ sàng lọc
              </span>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-gray-950">
                Hỏi nhanh các dấu hiệu sức khỏe thường gặp
              </h2>
              <p className="mt-4 text-sm font-semibold leading-7 text-gray-500">
                Mẹ có thể mô tả triệu chứng hoặc tải ảnh để nhận gợi ý chăm sóc ban đầu, sau đó quyết định khi nào cần gặp chuyên gia.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                  Bảo mật hồ sơ
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-black text-rose-700">
                  <TrendingUp className="h-4 w-4" />
                  Theo dõi tiến triển
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-[#F8FBFA] p-4 shadow-sm">
              <div className="rounded-lg bg-white p-4">
                <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-950">Trợ lý Mom Ơi</h3>
                    <p className="text-xs font-semibold text-gray-400">Phản hồi tham khảo, không thay thế bác sĩ</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm font-semibold leading-6">
                  <div className="ml-auto max-w-[82%] rounded-lg bg-gray-100 p-3 text-gray-700">
                    Bé bị nổi mẩn nhẹ ở má, mẹ nên theo dõi gì?
                  </div>
                  <div className="max-w-[90%] rounded-lg bg-emerald-50 p-3 text-emerald-800">
                    Mẹ nên giữ vùng da sạch, tránh sản phẩm có hương liệu và theo dõi sốt, lan rộng hoặc bé quấy khóc nhiều. Nếu có dấu hiệu nặng, hãy đưa bé đi khám.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-10">
          <h2 className="text-3xl font-black tracking-tight text-gray-950">
            Sẵn sàng đồng hành cùng bé cưng?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-7 text-gray-500">
            Bắt đầu với hồ sơ sức khỏe của mẹ và bé để nhận các gợi ý cá nhân hóa hơn.
          </p>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/register')}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-950 px-7 py-4 text-sm font-black text-white shadow-xl shadow-gray-950/10 transition hover:-translate-y-0.5"
          >
            {user ? 'Tiếp tục chăm sóc' : 'Tạo tài khoản'}
            <ChevronRight className="h-5 w-5" />
          </button>
        </section>
      </main>

      {/* FOOTER BẢO CHỨNG KHOA HỌC & BÀI BÁO NGHIÊN CỨU */}
      <ScientificEvidenceFooter variant="full" />
    </div>
  );
}
