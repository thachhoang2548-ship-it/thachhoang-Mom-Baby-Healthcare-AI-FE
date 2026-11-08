import React, { useEffect, useRef, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthController } from '../../../controllers/authController';
import { useProfileController } from '../../../controllers/profileController';
import babyService from '../../../models/services/babyService';
import momOiLogo from '../../../assets/Logo/mom-oi-submark-cropped.png';
import { checkTierUnlocked, getTierLevel } from '../../../utils/tierHelpers';
import { formatTodayVi, getFullName } from '../../../utils/displayName';
import MedicalDisclaimer from '../common/MedicalDisclaimer';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';
import {
  applyBabyThemeToDom,
  clearGlobalActiveBaby,
  formatBabyDisplayName,
  pickPreferredBaby,
  setGlobalActiveBaby,
  useActiveBaby,
} from '../../../hooks/useBabyTheme';

import {
  Calendar,
  Heart,
  Baby,
  Sparkles,
  LogOut,
  Activity,
  MessageSquare,
  Home,
  User,
  Settings,
  ShieldCheck,
  HeartPulse,
  Bell,
  Microscope,
  ExternalLink,
  Headphones,
  Phone,
  ReceiptText,
  Stethoscope,
  Menu,
  X,
  ChefHat,
  WifiOff,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const isPathActive = (pathname, path) =>
  pathname === path || (path !== '/' && pathname.startsWith(path));

const STAGE_LABELS = {
  PrePregnancy: 'Chuẩn bị mang thai',
  Pregnant: 'Đang mang thai',
  Postpartum: 'Mẹ & bé sau sinh',
};

function getCleanTierName(tier) {
  const level = getTierLevel(tier);
  if (level === 2) return 'Super Mom VIP';
  if (level === 1) return 'Mẹ Hiện Đại';
  return 'Mẹ Bầu Cơ Bản';
}

export default function AppShell() {
  const { user, tier, tierExpiresAt, logout, token, isAuthenticated } = useAuthController();
  const { journeyStage, fetchProfile, momProfile } = useProfileController();
  const online = useOnlineStatus();
  const activeBaby = useActiveBaby();
  const navigate = useNavigate();
  const location = useLocation();

  // Menu "Thêm" gắn với trang đang mở: chuyển trang là tự đóng
  const [moreOpenAt, setMoreOpenAt] = useState(null);
  const moreOpen = moreOpenAt === location.pathname;
  const setMoreOpen = (open) => setMoreOpenAt(open ? location.pathname : null);
  const [now] = useState(() => Date.now());
  const loadedBabyOwnerRef = useRef(null);

  const userRoles = Array.isArray(user?.roles) ? user.roles : user?.role ? [user.role] : [];
  const email = user?.email || '';
  const ownerKey = user?.id || email || null;
  const isAdmin = userRoles.some((r) => r.includes('Admin')) || email.includes('admin');
  const isExpert = userRoles.some((r) => r.includes('Expert')) || email.includes('expert');
  const isStaff = userRoles.some((r) => r.includes('Staff')) || email.includes('staff');
  const isMom = !isAdmin && !isExpert && !isStaff;
  const fullName = getFullName(user, token);

  // 1. Fetch profile once when authenticated and profile is missing
  useEffect(() => {
    if (isAuthenticated && token && !momProfile && isMom && online) {
      fetchProfile();
    }
  }, [isAuthenticated, token, momProfile, isMom, fetchProfile, online]);

  // 2. Giữ đồng bộ theme theo giới tính bé trên TOÀN BỘ các trang trong AppShell
  useEffect(() => {
    if (!isAuthenticated || !isMom) {
      applyBabyThemeToDom(null);
      return undefined;
    }

    // Nếu đổi sang tài khoản khác thì xóa bộ nhớ bé của phiên trước
    if (activeBaby?.ownerKey && ownerKey && activeBaby.ownerKey !== ownerKey) {
      clearGlobalActiveBaby();
      return undefined;
    }

    // Nếu mẹ đang ở giai đoạn chưa sinh bé (Mong con / Đang mang thai), giữ màu thương hiệu mặc định
    if (journeyStage && journeyStage !== 'Postpartum') {
      if (activeBaby) clearGlobalActiveBaby();
      else applyBabyThemeToDom(null);
      return undefined;
    }

    applyBabyThemeToDom(activeBaby?.theme || null);

    return () => {
      // Khi rời AppShell ra trang công khai (Landing, Login), trả lại màu thương hiệu gốc
      applyBabyThemeToDom(null);
    };
  }, [isAuthenticated, isMom, ownerKey, journeyStage, activeBaby]);

  // 3. Tự tải hồ sơ bé 1 lần ngay khi vào bất kỳ trang nào của dashboard (nếu mẹ sau sinh & đủ gói)
  useEffect(() => {
    if (
      !isAuthenticated ||
      !token ||
      !isMom ||
      !online ||
      journeyStage !== 'Postpartum' ||
      !checkTierUnlocked(tier, 'MomHienDai')
    ) {
      return undefined;
    }

    const fetchKey = `${ownerKey || 'mom'}:${journeyStage}`;
    if (loadedBabyOwnerRef.current === fetchKey) return undefined;
    loadedBabyOwnerRef.current = fetchKey;

    let cancelled = false;
    babyService
      .getProfiles()
      .then((res) => {
        if (cancelled) return;
        if (res?.isSuccess && Array.isArray(res.data) && res.data.length > 0) {
          const preferred = pickPreferredBaby(res.data);
          if (preferred) setGlobalActiveBaby(preferred, ownerKey);
        } else {
          clearGlobalActiveBaby();
        }
      })
      .catch(() => {
        // Giữ yên lặng nếu chưa có hồ sơ hoặc mạng chập chờn
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token, isMom, online, journeyStage, tier, ownerKey]);

  // 4. Auto redirect special roles away from Mom pages to their respective portals
  useEffect(() => {
    const path = location.pathname;
    if (isAdmin && path !== '/admin' && path !== '/profile') {
      navigate('/admin', { replace: true });
    } else if (isExpert && path !== '/expert') {
      navigate('/expert', { replace: true });
    } else if (isStaff && path !== '/staff') {
      navigate('/staff', { replace: true });
    } else if (isMom) {
      if (path === '/admin' || path === '/expert' || path === '/staff') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [location.pathname, isAdmin, isExpert, isStaff, isMom, navigate]);

  const handleLogout = async () => {
    if (!window.confirm('Mẹ có chắc muốn đăng xuất không?')) return;
    try {
      clearGlobalActiveBaby();
      loadedBabyOwnerRef.current = null;
      await logout();
      toast.success('Đã đăng xuất. Hẹn gặp lại mẹ!');
      navigate('/login');
    } catch {
      toast.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  const getNavGroups = () => {
    if (isAdmin)
      return [{ title: null, items: [{ label: 'Quản trị hệ thống', path: '/admin', icon: Settings }] }];
    if (isExpert)
      return [{ title: null, items: [{ label: 'Duyệt AI & tư vấn', path: '/expert', icon: ShieldCheck }] }];
    if (isStaff)
      return [{ title: null, items: [{ label: 'Cổng chăm sóc', path: '/staff', icon: HeartPulse }] }];

    const daily = [{ label: 'Trang chủ', path: '/dashboard', icon: Home }];
    if (journeyStage === 'PrePregnancy') {
      daily.push({ label: 'Lịch rụng trứng', path: '/fertility', icon: Calendar });
    } else if (journeyStage === 'Pregnant') {
      daily.push({ label: 'Thai kỳ của mẹ', path: '/pregnancy', icon: Heart });
    } else if (journeyStage === 'Postpartum') {
      daily.push({ label: 'Sức khỏe của mẹ', path: '/postpartum', icon: Activity });
      daily.push({ label: 'Chăm sóc bé', path: '/baby-nutrition', icon: Baby });
    }
    daily.push({ label: 'Lịch chăm sóc', path: '/care-calendar', icon: Calendar });
    daily.push({ label: 'Thông báo', path: '/notifications', icon: Bell });

    return [
      { title: 'Hằng ngày', items: daily },
      {
        title: 'Sức khỏe & tinh thần',
        items: [
          { label: 'Thực đơn AI cho mẹ', path: '/diet-recipes', icon: ChefHat },
          { label: 'Kiểm tra triệu chứng', path: '/symptoms', icon: Stethoscope },
          { label: 'Thư giãn', path: '/relax', icon: Headphones },
        ],
      },
      {
        title: 'Tài khoản',
        items: [
          { label: 'Hồ sơ của mẹ', path: '/profile', icon: User },
          { label: 'Gói dịch vụ', path: '/upgrade', icon: Sparkles },
          { label: 'Lịch sử thanh toán', path: '/subscription-history', icon: ReceiptText },
          { label: 'Góp ý & hỗ trợ', path: '/feedback', icon: MessageSquare },
        ],
      },
    ];
  };

  const navGroups = getNavGroups();
  const allItems = navGroups.flatMap((g) => g.items);
  const currentNavItem = allItems.find((i) => isPathActive(location.pathname, i.path));

  const mobileMain = isMom
    ? [allItems[0], allItems[1], allItems.find((i) => i.path === '/care-calendar')].filter(
        (item, idx, arr) => item && arr.findIndex((x) => x.path === item.path) === idx
      )
    : allItems;

  const tierExpiryDate = tierExpiresAt ? new Date(tierExpiresAt) : null;
  const tierDaysLeft = tierExpiryDate
    ? Math.ceil((tierExpiryDate.getTime() - now) / 86400000)
    : null;
  const shouldShowExpiryNotice = isMom && tier !== 'Free' && tierDaysLeft !== null && tierDaysLeft <= 7;

  const handleLogoClick = () => {
    if (isAdmin) navigate('/admin');
    else if (isExpert) navigate('/expert');
    else if (isStaff) navigate('/staff');
    else navigate('/dashboard');
  };

  const getRoleBadgeVi = () => {
    if (isAdmin) return 'Quản trị viên';
    if (isExpert) return 'Chuyên gia';
    if (isStaff) return 'Nhân viên';
    return getCleanTierName(tier);
  };

  const NavLink = ({ item, large = false }) => {
    const Icon = item.icon;
    const active = isPathActive(location.pathname, item.path);
    return (
      <Link
        to={item.path}
        aria-current={active ? 'page' : undefined}
        className={`group flex min-h-[44px] items-center gap-3 rounded-2xl px-3.5 ${
          large ? 'py-3.5 text-base' : 'py-2.5 text-sm'
        } font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-1 ${
          active
            ? 'bg-theme-brand text-theme-surface shadow-sm'
            : 'text-theme-ink/85 hover:bg-theme-surface hover:text-theme-ink'
        }`}
      >
        <Icon
          className={`h-[18px] w-[18px] shrink-0 transition-colors ${
            active ? 'text-theme-surface' : 'text-theme-muted group-hover:text-theme-brand'
          }`}
        />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-theme-page font-display text-theme-ink">
      {/* Thanh bên máy tính — trải suốt chiều cao tạo bố cục hiện đại, liền lạc */}
      <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-theme-line bg-theme-sidebar lg:flex">
        <div className="border-b border-theme-line px-5 py-4">
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex min-h-[44px] w-full items-center gap-3 rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
            aria-label="Về trang chủ"
          >
            <img
              src={momOiLogo}
              alt=""
              className="h-11 w-11 shrink-0 rounded-full border border-theme-line bg-theme-surface object-cover"
            />
            <div className="min-w-0">
              <span className="block font-brand text-2xl font-extrabold leading-none text-theme-brand">
                Mom Ơi!
              </span>
              <span className="mt-1 block truncate text-xs font-medium text-theme-muted">
                {isMom && journeyStage && STAGE_LABELS[journeyStage]
                  ? STAGE_LABELS[journeyStage]
                  : 'Sổ tay sức khỏe mẹ & bé'}
              </span>
            </div>
          </button>

          {/* Thẻ ngữ cảnh đồng hành của bé (khi đã có hồ sơ bé) */}
          {isMom && journeyStage === 'Postpartum' && activeBaby && (
            <Link
              to="/baby-nutrition"
              className="mt-3.5 flex min-h-[44px] items-center justify-between gap-2 rounded-2xl border border-theme-line bg-theme-surface px-3.5 py-2.5 text-xs transition-colors hover:border-theme-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full bg-theme-brand"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="truncate font-bold text-theme-ink">
                    {formatBabyDisplayName(activeBaby.name)}
                    {activeBaby.ageMonths != null ? ` · ${activeBaby.ageMonths} tháng` : ''}
                  </p>
                  <p className="truncate font-medium text-theme-muted">
                    Giao diện {activeBaby.theme === 'boy' ? 'Bé trai' : 'Bé gái'} toàn trang
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-theme-muted" aria-hidden="true" />
            </Link>
          )}
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5" aria-label="Menu chính">
          {navGroups.map((group) => (
            <div key={group.title || 'main'}>
              {group.title && (
                <p className="mb-2 px-3.5 text-xs font-bold text-theme-muted">{group.title}</p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink key={item.path} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {user && (
          <div className="border-t border-theme-line p-4">
            <Link
              to="/profile"
              className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-theme-line bg-theme-surface px-3.5 py-2.5 transition-colors hover:border-theme-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-theme-brand-soft text-sm font-bold text-theme-ink">
                {(fullName || 'M').trim().charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-theme-ink">
                  {fullName || 'Tài khoản của mẹ'}
                </p>
                <p className="truncate text-xs font-semibold text-theme-brand">
                  {getRoleBadgeVi()}
                </p>
              </div>
            </Link>
          </div>
        )}
      </aside>

      {/* Khối phải: Thanh đầu trang + Nội dung cuộn */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-theme-line bg-theme-surface/95 px-4 py-2.5 backdrop-blur-sm sm:px-6 lg:px-10">
          {/* Logo cho màn hình nhỏ */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={handleLogoClick}
              className="flex min-h-[44px] items-center gap-2.5 rounded-full pr-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
              aria-label="Về trang chủ"
            >
              <img
                src={momOiLogo}
                alt=""
                className="h-10 w-10 rounded-full border border-theme-line object-cover"
              />
              <div className="flex flex-col">
                <span className="font-brand text-xl font-extrabold leading-none text-theme-brand">
                  Mom Ơi!
                </span>
                {isMom && journeyStage && STAGE_LABELS[journeyStage] && (
                  <span className="mt-0.5 text-xs font-medium text-theme-muted">
                    {STAGE_LABELS[journeyStage]}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Ngữ cảnh ngày & mục hiện tại trên máy tính */}
          <div className="hidden min-w-0 items-center gap-3 lg:flex">
            <span className="truncate text-sm font-bold text-theme-ink">
              {currentNavItem?.label || 'Không gian của mẹ & bé'}
            </span>
            <span className="text-theme-line" aria-hidden="true">
              |
            </span>
            <span className="truncate text-xs font-medium text-theme-muted first-letter:uppercase">
              {formatTodayVi()}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {isMom && (
              <Link
                to="/notifications"
                aria-label="Thông báo"
                className="hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-theme-line bg-theme-page/70 text-theme-ink transition-colors hover:border-theme-brand/40 hover:bg-theme-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:inline-flex"
              >
                <Bell className="h-4 w-4" />
              </Link>
            )}

            {isMom && (
              <Link
                to="/emergency"
                className="hidden min-h-[44px] items-center gap-2 rounded-full bg-red-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 sm:inline-flex"
              >
                <Phone className="h-4 w-4" />
                <span>Khẩn cấp</span>
              </Link>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-theme-line bg-theme-surface px-3.5 py-2 text-sm font-semibold text-theme-ink transition-colors hover:bg-theme-page focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2 sm:px-4"
            >
              <LogOut className="h-4 w-4 text-theme-muted" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        <main className="flex min-w-0 flex-1 flex-col justify-between overflow-y-auto px-4 py-5 pb-24 sm:px-6 sm:py-7 lg:px-10 lg:pb-8">
          <div className="mx-auto w-full max-w-6xl">
            {shouldShowExpiryNotice && (
              <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-status-warn-line bg-status-warn-bg px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-bold text-status-warn-text">Gói của mẹ sắp hết hạn</p>
                  <p className="mt-0.5 text-sm font-medium text-status-warn-text">
                    Còn {Math.max(tierDaysLeft, 0)} ngày. Gia hạn để tiếp tục dùng các tính năng nâng cao.
                  </p>
                </div>
                <Link
                  to="/upgrade"
                  className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-theme-brand px-5 py-2.5 text-center text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
                >
                  Gia hạn ngay
                </Link>
              </div>
            )}

            {!online && (
              <div
                role="status"
                className="mb-6 flex items-start gap-3 rounded-2xl border border-status-warn-line bg-status-warn-bg px-5 py-4 text-sm font-semibold text-status-warn-text sm:text-base"
              >
                <WifiOff className="mt-0.5 h-5 w-5 shrink-0" />
                <span>
                  Bạn đang offline. Các tính năng cần mạng tạm thời chưa dùng được. Mục Thư giãn vẫn nghe được nếu trước đó mẹ đã mở khi có mạng.
                </span>
              </div>
            )}

            <Outlet />
          </div>

          <div className="mx-auto mt-12 w-full max-w-6xl">
            {isMom && <MedicalDisclaimer />}
            <footer className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-theme-line pt-5 text-xs font-medium text-theme-muted sm:flex-row sm:text-sm">
              <span className="inline-flex items-center gap-2 text-center sm:text-left">
                <Microscope className="h-4 w-4 shrink-0 text-theme-brand" />
                Khuyến nghị dinh dưỡng theo chuẩn WHO và dữ liệu USDA
              </span>
              <div className="flex shrink-0 items-center gap-4">
                <a
                  href="https://www.who.int/publications/i/item/9789240081864"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-1 rounded-md px-2 text-theme-ink hover:text-theme-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                >
                  WHO <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://fdc.nal.usda.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-1 rounded-md px-2 text-theme-ink hover:text-theme-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                >
                  USDA <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* Menu "Thêm" (điện thoại) */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-theme-ink/45 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="max-h-[82vh] overflow-y-auto rounded-t-3xl border-t border-theme-line bg-theme-page p-4 pb-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Tất cả mục"
          >
            <div className="mb-3 flex items-center justify-between border-b border-theme-line px-2 pb-3">
              <div>
                <p className="text-lg font-bold text-theme-ink">Danh mục chăm sóc</p>
                {user && (
                  <p className="text-xs font-medium text-theme-muted">
                    {fullName || 'Tài khoản của mẹ'} · {getRoleBadgeVi()}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-theme-line bg-theme-surface text-theme-ink hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {navGroups.map((group) => (
                <div key={group.title || 'main'}>
                  {group.title && (
                    <p className="mb-1.5 px-3.5 text-xs font-bold text-theme-muted">{group.title}</p>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <NavLink key={item.path} item={item} large />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Thanh điều hướng dưới (điện thoại) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 grid auto-cols-fr grid-flow-col border-t border-theme-line bg-theme-surface/95 backdrop-blur-sm lg:hidden"
        aria-label="Điều hướng nhanh"
      >
        {mobileMain.map((item) => {
          const Icon = item.icon;
          const active = isPathActive(location.pathname, item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-h-[60px] flex-col items-center justify-center gap-1 px-1 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-brand ${
                active ? 'font-bold text-theme-brand' : 'text-theme-muted hover:text-theme-ink'
              }`}
            >
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-theme-brand" aria-hidden="true" />
              )}
              <Icon className="h-5 w-5 shrink-0" />
              <span className="line-clamp-1 text-center leading-tight">{item.label}</span>
            </Link>
          );
        })}
        {isMom && (
          <>
            <Link
              to="/emergency"
              className="flex min-h-[60px] flex-col items-center justify-center gap-1 px-1 py-2 text-xs font-bold text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-700"
            >
              <Phone className="h-5 w-5 shrink-0" />
              <span className="leading-tight">Khẩn cấp</span>
            </Link>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-expanded={moreOpen}
              className="flex min-h-[60px] flex-col items-center justify-center gap-1 px-1 py-2 text-xs font-semibold text-theme-muted hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-brand"
            >
              <Menu className="h-5 w-5 shrink-0" />
              <span className="leading-tight">Thêm</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
}
