import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
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
import ColorSchemeToggle from '../components/common/ColorSchemeToggle';
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
      'Tra cứu nhanh món ăn nhạy cảm và gợi ý món chín an toàn thay thế',
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
    stage: 'Nuôi con nhỏ (0-24 tháng)',
    title: 'Thực đơn ăn dặm chuẩn WHO & không gian riêng theo giới tính bé',
    summary:
      'Gợi ý cữ ăn phù hợp từng tháng tuổi, tự động rà soát thực phẩm dị ứng, đối chiếu lượng sắt và đạm, vẽ biểu đồ tăng trưởng chuẩn WHO.',
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

// Hiện dần khi cuộn tới. Chỉ chuyển động nhẹ (mờ + trượt lên), tự tắt khi người dùng bật "giảm chuyển động".
function Reveal({ children }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out ${
        shown ? 'opacity-100 translate-y-0' : 'motion-safe:translate-y-6 motion-safe:opacity-0'
      }`}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuthController();
  const navigate = useNavigate();
  const [activeChapterId, setActiveChapterId] = useState(JOURNEY_CHAPTERS[0].id);

  // Trang giới thiệu công khai luôn giữ bảng màu thương hiệu gốc
  useEffect(() => {
    applyBabyThemeToDom(null);
  }, []);

  // Bấm mục lục thì cuộn mượt tới phần đó. Chỉ bật khi người dùng không yêu cầu giảm chuyển động.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('motion-safe:scroll-smooth');
    return () => root.classList.remove('motion-safe:scroll-smooth');
  }, []);

  // Thanh bên dính: tô đậm chặng đang nằm giữa màn hình (chỉ đổi state khi đổi chặng)
  useEffect(() => {
    const nodes = JOURNEY_CHAPTERS.map((chapter) => document.getElementById(`chang-${chapter.id}`)).filter(Boolean);
    if (!nodes.length || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveChapterId(entry.target.dataset.chapterId);
        });
      },
      { rootMargin: '-35% 0px -55% 0px' },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip bg-theme-page font-display text-theme-ink selection:bg-theme-brand-soft">
      {/* Liên kết bỏ qua điều hướng cho người dùng bàn phím */}
      <a
        href="#noi-dung"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-theme-brand focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand focus:ring-offset-2"
      >
        Bỏ qua đến nội dung chính
      </a>

      {/* Thanh điều hướng biên tập */}
      <header className="sticky top-0 z-50 border-b border-theme-line bg-theme-surface/95 px-4 py-3 backdrop-blur-sm sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 sm:gap-4">
          <Link
            to="/"
            className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-full pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2 sm:gap-3"
          >
            <img
              src={momOiLogo}
              alt="Mom Ơi!"
              width="512"
              height="512"
              className="h-9 w-9 rounded-full border border-theme-line object-cover sm:h-11 sm:w-11"
            />
            <div>
              <span className="block whitespace-nowrap font-brand text-xl font-extrabold leading-none text-theme-brand sm:text-2xl">
                Mom Ơi!
              </span>
              <span className="mt-0.5 hidden text-xs font-medium text-theme-muted sm:block lg:hidden xl:block">
                Sổ tay sức khỏe mẹ và bé
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 whitespace-nowrap text-sm font-semibold text-theme-muted lg:flex xl:gap-7" aria-label="Điều hướng trang giới thiệu">
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
            <ColorSchemeToggle variant="compact" className="hidden sm:inline-flex" />
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
                  className="inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-theme-ink transition-colors hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:px-4"
                >
                  Đăng nhập
                </Link>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-full bg-theme-brand px-4 py-2.5 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2 sm:px-5"
                >
                  <span className="sm:hidden">Tạo sổ tay</span>
                  <span className="hidden sm:inline">Tạo sổ tay miễn phí</span>
                  <ChevronRight className="hidden h-4 w-4 sm:block" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="noi-dung" tabIndex={-1} className="outline-none">
        {/* 1. Mở đầu: tiêu đề trải ngang, ảnh thật, công tắc màu theo bé đè lên mép ảnh */}
        <section>
          <div className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14">
            <div className="flex items-center gap-3 text-sm font-bold text-theme-brand">
              <span className="h-px w-8 bg-theme-brand" aria-hidden="true" />
              <span>Dành cho mẹ bầu &amp; mẹ bỉm tại Việt Nam</span>
            </div>

            <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight text-theme-ink sm:text-5xl lg:text-6xl">
              Chăm sóc mẹ và bé nhẹ nhàng, có căn cứ hơn mỗi ngày
            </h1>

            <div className="mt-8 grid lg:mt-10 lg:grid-cols-12 lg:items-center lg:gap-x-12">
              <div className="mb-10 lg:col-span-5 lg:mb-0">
                <p className="max-w-md text-lg leading-relaxed text-theme-muted lg:text-xl">
                  Lịch khám, dinh dưỡng chuẩn WHO và theo dõi phục hồi, gói trong một cuốn sổ tay dễ mở bằng một tay.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <button
                    type="button"
                    onClick={() => navigate(user ? '/dashboard' : '/register')}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-theme-brand px-6 py-3 text-base font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
                  >
                    <span>{user ? 'Vào sổ tay của mẹ' : 'Tạo sổ tay miễn phí'}</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <a
                    href="#hanh-trinh"
                    className="inline-flex min-h-[48px] items-center justify-center whitespace-nowrap rounded-full border border-theme-line bg-theme-surface px-5 py-3 text-base font-semibold text-theme-ink transition-colors hover:border-theme-brand/40 hover:bg-theme-sidebar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
                  >
                    Xem 4 giai đoạn
                  </a>
                </div>
              </div>

              <figure className="overflow-hidden rounded-3xl border border-theme-line bg-theme-sidebar lg:col-span-7">
                <img
                  src={heroMomBabyPhoto}
                  alt="Người mẹ mỉm cười ẵm em bé bên khung cửa sổ ngập nắng ấm buổi sáng"
                  width="1080"
                  height="717"
                  fetchPriority="high"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover lg:aspect-[16/10]"
                />
              </figure>

            </div>
          </div>
        </section>

        {/* Dải nguồn đối chiếu, ngay dưới phần mở đầu */}
        <section aria-label="Nguồn đối chiếu và cam kết" className="border-y border-theme-line bg-theme-surface">
          <dl className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:grid-cols-3 sm:px-8">
            <div className="border-l-2 border-theme-brand pl-3.5">
              <dt className="text-xs font-medium text-theme-muted">Nguồn đối chiếu</dt>
              <dd className="mt-0.5 text-sm font-bold text-theme-ink">Chuẩn WHO &amp; USDA</dd>
            </div>
            <div className="border-l-2 border-theme-brand pl-3.5">
              <dt className="text-xs font-medium text-theme-muted">Cố vấn chuyên môn</dt>
              <dd className="mt-0.5 text-sm font-bold text-theme-ink">{ADVISOR_DOCTOR.displayName}</dd>
            </div>
            <div className="border-l-2 border-theme-brand pl-3.5">
              <dt className="text-xs font-medium text-theme-muted">Quyền riêng tư</dt>
              <dd className="mt-0.5 text-sm font-bold text-theme-ink">Nghị định 13/2023</dd>
            </div>
          </dl>
        </section>

        {/* 2. Lộ trình 4 chặng: dòng thời gian cuộn, thanh bên dính cho biết đang ở chặng nào */}
        <section id="hanh-trinh" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-8 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-theme-ink sm:text-4xl lg:text-5xl">
              Một cuốn sổ tay lớn lên cùng hai mẹ con
            </h2>
            <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-theme-muted sm:text-lg">
              Mẹ không cần tải nhiều ứng dụng rời rạc cho từng thời kỳ. Mom Ơi! chuẩn bị sẵn những gì mẹ cần ở từng giai đoạn.
            </p>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Thanh bên dính (chỉ desktop): bấm để nhảy tới chặng, tô đậm chặng đang xem */}
            <nav aria-label="Các giai đoạn đồng hành" className="hidden lg:col-span-3 lg:block">
              <ol className="sticky top-28 border-l border-theme-line">
                {JOURNEY_CHAPTERS.map((chapter) => {
                  const Icon = chapter.icon;
                  const isActive = chapter.id === activeChapterId;
                  return (
                    <li key={chapter.id}>
                      <a
                        href={`#chang-${chapter.id}`}
                        aria-current={isActive ? 'step' : undefined}
                        className={`-ml-px flex min-h-[56px] items-center gap-3 border-l-2 py-2 pl-4 pr-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                          isActive
                            ? 'border-theme-brand text-theme-ink'
                            : 'border-transparent text-theme-muted hover:text-theme-ink'
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 ${isActive ? 'text-theme-brand' : ''}`}
                          aria-hidden="true"
                        />
                        <span>
                          <span className="block text-xs font-bold text-theme-brand">Chặng {chapter.step}</span>
                          {chapter.stage}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>

            <div className="space-y-16 sm:space-y-24 lg:col-span-9">
              {JOURNEY_CHAPTERS.map((chapter) => (
                <Reveal key={chapter.id}>
                  <article
                    id={`chang-${chapter.id}`}
                    data-chapter-id={chapter.id}
                    aria-labelledby={`chang-${chapter.id}-tieu-de`}
                    className="scroll-mt-28"
                  >
                    <figure className="overflow-hidden rounded-3xl border border-theme-line bg-theme-sidebar">
                      <img
                        src={chapter.photo}
                        alt={chapter.photoAlt}
                        width="1000"
                        height="667"
                        loading="lazy"
                        decoding="async"
                        className="aspect-[4/3] w-full object-cover sm:aspect-[16/9]"
                      />
                    </figure>

                    <div className="mt-6 grid gap-6 md:grid-cols-12 md:gap-10">
                      <div className="md:col-span-5">
                        <p className="text-sm font-bold text-theme-brand">Chặng {chapter.step}</p>
                        <h3
                          id={`chang-${chapter.id}-tieu-de`}
                          className="mt-1 text-2xl font-extrabold leading-tight tracking-tight text-theme-ink sm:text-3xl"
                        >
                          {chapter.stage}
                        </h3>
                        <p className="mt-3 text-base font-semibold leading-snug text-theme-ink">{chapter.title}</p>
                      </div>

                      <div className="md:col-span-7">
                        <p className="text-base leading-relaxed text-theme-muted">{chapter.summary}</p>
                        <ul className="mt-5 space-y-3 border-t border-theme-line pt-5">
                          {chapter.highlights.map((item) => (
                            <li key={item} className="flex items-start gap-2.5 text-sm font-medium leading-relaxed text-theme-ink">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-ok" aria-hidden="true" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-5 text-sm italic leading-relaxed text-theme-muted">{chapter.caption}</p>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
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
              <div className="flex flex-col justify-between rounded-3xl border border-theme-line bg-theme-sidebar p-6 sm:p-8 lg:col-span-7">
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

                  <div className="space-y-3 text-sm leading-relaxed">
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
                    width="1000"
                    height="667"
                    decoding="async"
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
                <span>{user ? 'Vào sổ tay của mẹ' : 'Tạo sổ tay miễn phí'}</span>
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
            <div className="flex flex-wrap items-center justify-center gap-4">
              <ColorSchemeToggle variant="segmented" />
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
