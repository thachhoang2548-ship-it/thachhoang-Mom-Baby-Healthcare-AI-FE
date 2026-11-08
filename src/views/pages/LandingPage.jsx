import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  Baby,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Headphones,
  Heart,
  MessageSquare,
  ShieldCheck,
  Stethoscope,
  WifiOff,
} from 'lucide-react';
import { useAuthController } from '../../controllers/authController';
import momOiLogo from '../../assets/Logo/mom-oi-submark-cropped.png';
import heroMomBabyPhoto from '../../assets/editorial/hero-mom-baby-sunlight.jpg';
import pregnantCouplePhoto from '../../assets/editorial/pregnant-couple-warm.jpg';
import sleepingNewbornPhoto from '../../assets/editorial/newborn-sleeping-soft.jpg';
import babyWeaningPlayPhoto from '../../assets/editorial/baby-weaning-play.jpg';
import newbornFeetPhoto from '../../assets/editorial/newborn-feet-towel.jpg';
import ScientificEvidenceFooter from '../components/common/ScientificEvidenceFooter';
import MedicalDisclaimer from '../components/common/MedicalDisclaimer';
import { ADVISOR_DOCTOR } from '../../config/advisor';
import { applyBabyThemeToDom } from '../../hooks/useBabyTheme';

const JOURNEY_CHAPTERS = [
  {
    id: 'pre',
    step: '01',
    stage: 'Chuẩn bị mang thai',
    title: 'Hiểu nhịp chu kỳ tự nhiên để đón con chủ động',
    summary:
      'Ghi lại ngày kinh nguyệt hàng tháng, nhận diện cửa sổ dễ thụ thai và chủ động nhắc lịch bổ sung vi chất trước bầu.',
    highlights: [
      'Lịch chu kỳ phân biệt rõ ngày hành kinh, cửa sổ thụ thai và ngày dự kiến rụng trứng',
      'Ghi chú biểu hiện cơ thể và tâm trạng hàng ngày trên một trang gọn nhẹ',
      'Nhắc lịch khám tiền sản và tiêm phòng cần thiết trước khi mang thai',
    ],
    photo: newbornFeetPhoto,
    photoAlt: 'Đôi bàn chân nhỏ của trẻ sơ sinh trong khăn bông trắng ấm áp',
    caption: 'Chuẩn bị nền tảng sức khỏe vững vàng ngay từ trước ngày có tin vui.',
    icon: Calendar,
  },
  {
    id: 'pregnant',
    step: '02',
    stage: 'Đang mang thai',
    title: 'Theo sát 40 tuần thai kỳ bình tĩnh, không quá tải thông tin',
    summary:
      'Mỗi tuần thai mở ra cột mốc phát triển mới của em bé, đi kèm công cụ kiểm tra an toàn món ăn, thực đơn 7 ngày và biểu đồ cân nặng của mẹ.',
    highlights: [
      'Cập nhật kích thước và sự thay đổi của thai nhi theo đúng tuần thai thực tế',
      'Tra cứu nhanh món ăn nhạy cảm (BR02) và gợi ý món chín an toàn thay thế',
      'Theo dõi cân nặng thai kỳ và số bước đi bộ nhẹ nhàng mỗi ngày',
    ],
    photo: pregnantCouplePhoto,
    photoAlt: 'Gia đình trẻ mỉm cười hạnh phúc đón chờ em bé chào đời',
    caption: 'Đồng hành cùng mẹ qua tam cá nguyệt thứ nhất, thứ hai đến ngày vượt cạn.',
    icon: Heart,
  },
  {
    id: 'postpartum',
    step: '03',
    stage: 'Hậu sản & hồi phục',
    title: 'Chăm chút thể chất và cảm xúc của mẹ sau sinh',
    summary:
      'Sau khi em bé chào đời, người mẹ cũng cần được lắng nghe. Mom Ơi! đồng hành cùng lộ trình vận động nhẹ, sàng lọc tâm lý EPDS và giấc ngủ ngắn.',
    highlights: [
      'Lộ trình phục hồi chia theo tuần sau sinh thường hoặc sinh mổ',
      'Bảng tự đánh giá tâm lý sau sinh EPDS 10 câu hỏi kín đáo, tôn trọng riêng tư',
      'Kho nhạc ru êm dịu có hẹn giờ tắt và lưu nghe ngay cả khi không có Wi-Fi',
    ],
    photo: sleepingNewbornPhoto,
    photoAlt: 'Em bé sơ sinh ngủ say bình yên trong chăn mềm màu kem',
    caption: 'Dành sự dịu dàng cho cả giấc ngủ của con lẫn sự hồi phục của mẹ.',
    icon: ShieldCheck,
  },
  {
    id: 'baby',
    step: '04',
    stage: 'Nuôi con nhỏ (0–24 tháng)',
    title: 'Thực đơn ăn dặm chuẩn WHO & không gian riêng theo giới tính bé',
    summary:
      'Gợi ý cữ ăn phù hợp từng tháng tuổi, tự động rà soát thực phẩm dị ứng, đối chiếu lượng sắt – đạm và vẽ biểu đồ tăng trưởng chuẩn WHO.',
    highlights: [
      'Thực đơn ngày và 7 ngày tự động cảnh báo hoặc đổi món khi bé có tiền sử dị ứng',
      'Biểu đồ cân nặng, chiều cao đối chiếu bách phân vị chuẩn Tổ chức Y tế Thế giới',
      'Toàn bộ bảng điều khiển tự chuyển sang tông Xanh dịu (bé trai) hoặc Hồng đất (bé gái)',
    ],
    photo: babyWeaningPlayPhoto,
    photoAlt: 'Em bé ngồi trên thảm trắng cầm thìa gỗ tập ăn dặm dưới nắng sớm',
    caption: 'Mỗi bữa ăn dặm đầu đời đều rõ định lượng, nguyên liệu và cách chế biến.',
    icon: Baby,
  },
];

export default function LandingPage() {
  const { user } = useAuthController();
  const navigate = useNavigate();
  const [activeChapterIdx, setActiveChapterIdx] = useState(3);
  const [previewGender, setPreviewGender] = useState('boy');

  // Trang giới thiệu công khai luôn giữ bảng màu thương hiệu gốc
  useEffect(() => {
    applyBabyThemeToDom(null);
  }, []);

  const activeChapter = JOURNEY_CHAPTERS[activeChapterIdx] || JOURNEY_CHAPTERS[0];

  return (
    <div className="min-h-screen overflow-x-hidden bg-theme-page font-display text-theme-ink selection:bg-theme-brand-soft">
      {/* Thanh điều hướng biên tập */}
      <header className="sticky top-0 z-50 border-b border-theme-line bg-theme-surface/95 px-4 py-3 backdrop-blur-sm sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link
            to="/"
            className="flex min-h-[44px] items-center gap-3 rounded-full pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
          >
            <img
              src={momOiLogo}
              alt="Mom Ơi!"
              className="h-10 w-10 rounded-full border border-theme-line object-cover sm:h-11 sm:w-11"
            />
            <div>
              <span className="block font-brand text-2xl font-extrabold leading-none text-theme-brand">
                Mom Ơi!
              </span>
              <span className="mt-0.5 block text-xs font-medium text-theme-muted">
                Sổ tay sức khỏe mẹ và bé
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-theme-muted md:flex" aria-label="Điều hướng trang giới thiệu">
            <a
              href="#hanh-trinh"
              className="py-2 transition-colors hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand rounded-md px-1"
            >
              4 chặng đồng hành
            </a>
            <a
              href="#trai-nghiem"
              className="py-2 transition-colors hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand rounded-md px-1"
            >
              Tiện ích thực tế
            </a>
            <a
              href="#can-cu-y-khoa"
              className="py-2 transition-colors hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand rounded-md px-1"
            >
              Căn cứ khoa học
            </a>
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {user ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-theme-brand px-5 py-2.5 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
              >
                <span>Vào sổ tay của mẹ</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-theme-ink transition-colors hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                >
                  Đăng nhập
                </Link>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-theme-brand px-5 py-2.5 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
                >
                  <span>Bắt đầu miễn phí</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* 1. Mở đầu tạp chí (Editorial Hero với ảnh đời thực Mẹ & Bé Việt/Á Đông) */}
        <section className="border-b border-theme-line bg-theme-page">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 sm:px-8 sm:py-14 lg:grid-cols-12 lg:gap-12 lg:py-16">
            <div className="lg:col-span-6">
              <div className="flex items-center gap-3 text-xs font-bold text-theme-brand sm:text-sm">
                <span className="h-px w-8 bg-theme-brand" aria-hidden="true" />
                <span>Dành cho mẹ bầu &amp; mẹ bỉm tại Việt Nam</span>
              </div>

              <h1 className="mt-4 text-3xl font-bold leading-[1.16] tracking-tight text-theme-ink sm:text-5xl sm:leading-[1.12]">
                Chăm sóc mẹ và bé nhẹ nhàng, có căn cứ hơn mỗi ngày
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-theme-muted sm:text-lg">
                Từ ngày chuẩn bị đón con, suốt 40 tuần thai kỳ đến những bữa cháo ăn dặm đầu đời — Mom Ơi! gói gọn lịch khám, dinh dưỡng chuẩn WHO và theo dõi phục hồi vào một cuốn sổ tay ấm áp, dễ mở bằng một tay.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => navigate(user ? '/dashboard' : '/register')}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-theme-brand px-7 py-3 text-base font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
                >
                  <span>{user ? 'Mở bàn đồng hành của mẹ' : 'Tạo sổ tay miễn phí'}</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
                <a
                  href="#hanh-trinh"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-theme-line bg-theme-surface px-6 py-3 text-base font-semibold text-theme-ink transition-colors hover:border-theme-brand/40 hover:bg-theme-sidebar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
                >
                  Khám phá 4 giai đoạn
                </a>
              </div>

              {/* Ba chỉ dấu tin cậy kiểu biên tập */}
              <dl className="mt-9 grid grid-cols-1 gap-4 border-t border-theme-line pt-6 sm:grid-cols-3">
                <div className="border-l-2 border-theme-brand pl-3.5">
                  <dt className="text-xs font-medium text-theme-muted">Nguồn đối chiếu</dt>
                  <dd className="mt-0.5 text-sm font-bold text-theme-ink">Chuẩn WHO &amp; USDA</dd>
                </div>
                <div className="border-l-2 border-status-ok pl-3.5">
                  <dt className="text-xs font-medium text-theme-muted">Cố vấn chuyên môn</dt>
                  <dd className="mt-0.5 text-sm font-bold text-theme-ink">{ADVISOR_DOCTOR.displayName}</dd>
                </div>
                <div className="border-l-2 border-theme-line pl-3.5">
                  <dt className="text-xs font-medium text-theme-muted">Quyền riêng tư</dt>
                  <dd className="mt-0.5 text-sm font-bold text-theme-ink">Nghị định 13/2023</dd>
                </div>
              </dl>
            </div>

            {/* Khung ảnh đời thực + thẻ xem trước giao diện theo giới tính bé */}
            <div className="space-y-3.5 lg:col-span-6">
              <figure className="overflow-hidden rounded-3xl border border-theme-line bg-theme-surface p-2.5 shadow-sm">
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={heroMomBabyPhoto}
                    alt="Người mẹ mỉm cười ẵm em bé bên khung cửa sổ ngập nắng ấm buổi sáng"
                    className="aspect-[16/11] w-full object-cover"
                  />
                </div>
                <figcaption className="flex flex-wrap items-center justify-between gap-2 px-2.5 pb-1.5 pt-3 text-xs">
                  <span className="font-semibold text-theme-ink">
                    Buổi sáng bình yên của hai mẹ con · Sổ tay cá nhân hóa theo từng tháng tuổi
                  </span>
                  <span className="font-semibold text-status-ok">Thực đơn &amp; tăng trưởng</span>
                </figcaption>
              </figure>

              {/* Hai thẻ chi tiết bất đối xứng bên dưới ảnh chính */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-12">
                {/* Thẻ thử đổi màu toàn dashboard theo giới tính bé */}
                <div
                  className="rounded-2xl border p-4 shadow-sm transition-colors sm:col-span-7"
                  style={
                    previewGender === 'boy'
                      ? {
                          backgroundColor: '#F2F6F8',
                          borderColor: '#D8E3E9',
                          color: '#1D2A33',
                        }
                      : {
                          backgroundColor: '#FFFFFF',
                          borderColor: '#EADFDA',
                          color: '#2B2024',
                        }
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold">Giao diện đồng điệu theo bé</span>
                    <div className="inline-flex rounded-full border border-black/10 bg-white p-0.5 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setPreviewGender('boy')}
                        aria-pressed={previewGender === 'boy'}
                        className={`min-h-[30px] rounded-full px-2.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                          previewGender === 'boy'
                            ? 'bg-[#2E6D93] text-white'
                            : 'text-[#1D2A33] hover:bg-black/5'
                        }`}
                      >
                        Bé trai
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewGender('girl')}
                        aria-pressed={previewGender === 'girl'}
                        className={`min-h-[30px] rounded-full px-2.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                          previewGender === 'girl'
                            ? 'bg-[#AB4256] text-white'
                            : 'text-[#2B2024] hover:bg-black/5'
                        }`}
                      >
                        Bé gái
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed opacity-85">
                    {previewGender === 'boy'
                      ? 'Khi hồ sơ là bé trai, toàn bộ bảng điều khiển chuyển sang sắc Xanh lam dịu mắt xuyên suốt mọi trang.'
                      : 'Khi hồ sơ là bé gái, không gian giữ sắc Hồng đất ấm áp trên toàn bộ thực đơn, lịch khám và trang chủ.'}
                  </p>
                </div>

                {/* Thẻ nhấn thực đơn ăn dặm */}
                <div className="flex items-center gap-3 rounded-2xl border border-theme-line bg-theme-surface p-3.5 shadow-sm sm:col-span-5">
                  <img
                    src={babyWeaningPlayPhoto}
                    alt="Bữa ăn dặm của bé"
                    className="h-14 w-14 shrink-0 rounded-2xl border border-theme-line object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-theme-ink">Ăn dặm &amp; dị ứng</p>
                    <p className="mt-0.5 text-xs leading-snug text-theme-muted">
                      Tự lọc thực phẩm bé dị ứng và cảnh báo thiếu sắt sớm.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Lộ trình 4 chặng (Bố cục tạp chí tương tác thay vì lưới 4 hộp giống nhau) */}
        <section id="hanh-trinh" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-8 sm:py-20">
          <div className="mb-10 flex flex-col justify-between gap-4 border-b border-theme-line pb-7 md:flex-row md:items-end">
            <div className="max-w-xl">
              <p className="text-xs font-bold text-theme-brand sm:text-sm">Lộ trình liền mạch 4 giai đoạn</p>
              <h2 className="mt-2 text-2xl font-bold text-theme-ink sm:text-3xl lg:text-4xl">
                Một cuốn sổ tay lớn lên cùng hai mẹ con
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-theme-muted sm:text-base">
              Mẹ không cần tải nhiều ứng dụng rời rạc cho từng thời kỳ. Chọn giai đoạn hiện tại để xem Mom Ơi! chuẩn bị sẵn những gì cho mẹ.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            {/* Danh sách chương bên trái */}
            <div className="space-y-2.5 lg:col-span-5" role="tablist" aria-label="Các giai đoạn đồng hành">
              {JOURNEY_CHAPTERS.map((chapter, idx) => {
                const Icon = chapter.icon;
                const isSelected = idx === activeChapterIdx;
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveChapterIdx(idx)}
                    className={`flex min-h-[72px] w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:p-5 ${
                      isSelected
                        ? 'border-theme-brand bg-theme-surface shadow-sm'
                        : 'border-theme-line bg-theme-sidebar/55 hover:bg-theme-surface'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-bold ${
                        isSelected
                          ? 'bg-theme-brand text-theme-surface'
                          : 'bg-theme-surface text-theme-muted border border-theme-line'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-theme-brand">
                          Chặng {chapter.step}
                        </span>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 transition-transform ${
                            isSelected ? 'translate-x-0.5 text-theme-brand' : 'text-theme-muted'
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                      <p className="mt-0.5 text-base font-bold text-theme-ink">{chapter.stage}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-theme-muted sm:text-sm">
                        {chapter.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Nội dung chi tiết chương bên phải kèm ảnh đời thực */}
            <article
              role="tabpanel"
              className="flex flex-col justify-between overflow-hidden rounded-3xl border border-theme-line bg-theme-surface shadow-sm lg:col-span-7"
            >
              <div className="grid grid-cols-1 gap-0 sm:grid-cols-12">
                <div className="sm:col-span-5">
                  <img
                    src={activeChapter.photo}
                    alt={activeChapter.photoAlt}
                    className="h-56 w-full object-cover sm:h-full sm:min-h-[340px]"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col justify-between p-6 sm:col-span-7 sm:p-8">
                  <div>
                    <span className="inline-block rounded-md bg-theme-brand-soft px-2.5 py-1 text-xs font-bold text-theme-ink">
                      {activeChapter.step} · {activeChapter.stage}
                    </span>
                    <h3 className="mt-3 text-xl font-bold leading-snug text-theme-ink sm:text-2xl">
                      {activeChapter.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-theme-muted">
                      {activeChapter.summary}
                    </p>

                    <ul className="mt-5 space-y-2.5 border-t border-theme-line pt-4">
                      {activeChapter.highlights.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-xs font-medium leading-relaxed text-theme-ink sm:text-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-ok" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-theme-line pt-4">
                    <p className="text-xs font-medium italic text-theme-muted">
                      {activeChapter.caption}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(user ? '/dashboard' : '/register')}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-theme-page px-4 py-2 text-xs font-bold text-theme-brand border border-theme-line transition-colors hover:bg-theme-brand hover:text-theme-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                    >
                      <span>Trải nghiệm chặng này</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* 3. Bento thực tế: Phân loại triệu chứng bình tĩnh + Nhạc ru ngủ offline */}
        <section id="trai-nghiem" className="border-t border-theme-line bg-theme-surface scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-bold text-theme-brand sm:text-sm">Thiết kế cho những đêm thức chăm con</p>
              <h2 className="mt-2 text-2xl font-bold text-theme-ink sm:text-3xl">
                Rõ ràng khi mẹ cần tra cứu gấp, êm dịu khi hai mẹ con cần nghỉ ngơi
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Cột 7: Sàng lọc triệu chứng chuẩn mực, không gây hoang mang */}
              <div className="flex flex-col justify-between rounded-3xl border border-theme-line bg-theme-page p-6 sm:p-8 lg:col-span-7">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-theme-brand sm:text-sm">
                      <Stethoscope className="h-4 w-4" />
                      Ghi chép &amp; phân loại triệu chứng ban đầu
                    </span>
                    <span className="rounded-full border border-theme-line bg-theme-surface px-3 py-1 text-xs font-semibold text-theme-muted">
                      Không thay thế chẩn đoán bác sĩ
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-bold text-theme-ink sm:text-2xl">
                    Phân biệt rõ lúc nào theo dõi tại nhà, lúc nào cần đến viện ngay
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-theme-muted">
                    Mẹ có thể ghi lại biểu hiện kèm ảnh chụp để nhận hướng dẫn chăm sóc tham khảo, đồng thời lưu thành nhật ký mạch lạc phục vụ buổi khám với bác sĩ sản nhi.
                  </p>
                </div>

                <div className="mt-6 rounded-2xl border border-theme-line bg-theme-surface p-5 shadow-sm">
                  <div className="mb-3.5 flex items-center justify-between gap-2 border-b border-theme-line pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-theme-brand-soft text-theme-brand">
                        <MessageSquare className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-theme-ink">Tình huống thường gặp ở bé ăn dặm</p>
                        <p className="text-xs text-theme-muted">Đã đối chiếu tiền sử dị ứng trong hồ sơ</p>
                      </div>
                    </div>
                    <span className="hidden rounded-full bg-status-ok/15 px-3 py-1 text-xs font-bold text-status-ok sm:inline-block">
                      Theo dõi tại nhà
                    </span>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed sm:text-sm">
                    <div className="rounded-2xl border border-theme-line bg-theme-page px-4 py-3 font-medium text-theme-ink">
                      &ldquo;Bé 7 tháng mới thử lòng đỏ trứng gà, quanh miệng hơi ửng hồng nhẹ nhưng bé vẫn ti sữa và chơi ngoan.&rdquo;
                    </div>
                    <div className="rounded-2xl border border-status-ok/30 bg-status-ok/10 px-4 py-3 text-theme-ink">
                      <p className="font-bold">Hướng dẫn tham khảo:</p>
                      <p className="mt-1">
                        Tạm ngưng món trứng và lưu vào <strong>Theo dõi dị ứng</strong> để thực đơn tuần tự động đổi món. Nếu xuất hiện nôn trớ liên tục, sưng môi mắt, thở khò khè hoặc li bì, cần đưa bé đi cấp cứu (<strong>115</strong>) ngay.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột 5: Nhạc thư giãn & nghe offline + ảnh em bé ngủ đời thực */}
              <div className="flex flex-col justify-between overflow-hidden rounded-3xl border border-theme-line bg-theme-page lg:col-span-5">
                <div className="p-2.5 pb-0">
                  <img
                    src={sleepingNewbornPhoto}
                    alt="Em bé ngủ yên bình trong chăn bông mềm"
                    className="h-52 w-full rounded-2xl object-cover sm:h-60"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-theme-brand sm:text-sm">
                      <Headphones className="h-4 w-4" />
                      <span>Góc thư giãn cho mẹ &amp; giấc ngủ của bé</span>
                    </div>
                    <h3 className="mt-2.5 text-xl font-bold text-theme-ink">
                      Nghe nhạc ru êm dịu ngay cả khi phòng ngủ tắt Wi-Fi
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-theme-muted">
                      Mẹ có thể tải sẵn giai điệu về máy để bật cho bé ngủ mà không lo sóng chập chờn hay thông báo làm phiền, kèm hẹn giờ tự tắt sau 15, 30, 45 hoặc 60 phút.
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-theme-line pt-4 text-xs font-semibold text-theme-ink">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-theme-line bg-theme-surface px-3 py-1.5">
                      <WifiOff className="h-3.5 w-3.5 text-status-ok" />
                      Hỗ trợ phát offline
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-theme-line bg-theme-surface px-3 py-1.5">
                      <Activity className="h-3.5 w-3.5 text-theme-brand" />
                      Hẹn giờ tắt tự động
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Lời mời mở sổ tay */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
          <div className="grid grid-cols-1 items-center gap-8 overflow-hidden rounded-3xl border border-theme-line bg-theme-sidebar p-6 sm:p-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h2 className="text-2xl font-bold text-theme-ink sm:text-3xl">
                Mở cuốn sổ tay riêng cho hành trình của mẹ ngay hôm nay
              </h2>
              <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-theme-muted sm:text-base">
                Chỉ mất chưa đầy một phút chọn giai đoạn hiện tại để Mom Ơi! sắp xếp đúng lịch khám, thực đơn và bảng theo dõi dành riêng cho hai mẹ con.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:justify-end">
              <button
                type="button"
                onClick={() => navigate(user ? '/dashboard' : '/register')}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-theme-brand px-7 py-3 text-base font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
              >
                <span>{user ? 'Tiếp tục chăm sóc' : 'Tạo tài khoản miễn phí'}</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Căn cứ khoa học & bác sĩ cố vấn */}
      <div id="can-cu-y-khoa" className="scroll-mt-20">
        <ScientificEvidenceFooter variant="full" />
      </div>

      {/* Miễn trừ trách nhiệm y tế */}
      <footer className="border-t border-theme-line bg-theme-page px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-6xl space-y-5">
          <MedicalDisclaimer />
          <div className="flex flex-col items-center justify-between gap-3 pt-2 text-center text-xs font-medium text-theme-muted sm:flex-row sm:text-left sm:text-sm">
            <p>
              © {new Date().getFullYear()} Mom Ơi! · Bác sĩ cố vấn chuyên môn: {ADVISOR_DOCTOR.displayName}
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="/consent"
                className="inline-flex min-h-[44px] items-center text-theme-ink underline decoration-theme-line underline-offset-4 hover:text-theme-brand"
              >
                Điều khoản &amp; Quyền riêng tư
              </Link>
              <Link
                to="/delete-account"
                className="inline-flex min-h-[44px] items-center text-theme-muted underline decoration-theme-line underline-offset-4 hover:text-theme-ink"
              >
                Xóa tài khoản
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
