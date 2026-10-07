import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthController } from '../../../controllers/authController';
import { useProfileController } from '../../../controllers/profileController';
import momOiLogo from '../../../assets/Logo/mom-oi-submark-cropped.png';
import { getTierNameVi } from '../../../utils/tierHelpers';
import { getFullName } from '../../../utils/displayName';
import MedicalDisclaimer from '../common/MedicalDisclaimer';

import {
  Calendar, Heart, Baby, Sparkles, LogOut, Activity, MessageSquare, Home, User, Settings,
  ShieldCheck, HeartPulse, Bell, Microscope, ExternalLink, Headphones, Phone, ReceiptText,
  Stethoscope, Menu, X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const isPathActive = (pathname, path) =>
  pathname === path || (path !== '/' && pathname.startsWith(path));

export default function AppShell() {
  const { user, tier, tierExpiresAt, logout, token, isAuthenticated } = useAuthController();
  const { journeyStage, fetchProfile, momProfile } = useProfileController();
  const navigate = useNavigate();
  const location = useLocation();
  // Menu "Thêm" gắn với trang đang mở: chuyển trang là tự đóng
  const [moreOpenAt, setMoreOpenAt] = useState(null);
  const moreOpen = moreOpenAt === location.pathname;
  const setMoreOpen = (open) => setMoreOpenAt(open ? location.pathname : null);
  const [now] = useState(() => Date.now());

  const userRoles = Array.isArray(user?.roles) ? user.roles : (user?.role ? [user.role] : []);
  const email = user?.email || '';
  const isAdmin = userRoles.some(r => r.includes('Admin')) || email.includes('admin');
  const isExpert = userRoles.some(r => r.includes('Expert')) || email.includes('expert');
  const isStaff = userRoles.some(r => r.includes('Staff')) || email.includes('staff');
  const isMom = !isAdmin && !isExpert && !isStaff;
  const fullName = getFullName(user, token);

  // 1. Fetch profile once when authenticated and profile is missing
  useEffect(() => {
    if (isAuthenticated && token && !momProfile && isMom) {
      fetchProfile();
    }
  }, [isAuthenticated, token, momProfile, isMom, fetchProfile]);

  // 2. Auto redirect special roles away from Mom pages to their respective portals
  useEffect(() => {
    const path = location.pathname;
    if (isAdmin && path !== '/admin' && path !== '/profile') {
      navigate('/admin', { replace: true });
    } else if (isExpert && path !== '/expert') {
      navigate('/expert', { replace: true });
    } else if (isStaff && path !== '/staff') {
      navigate('/staff', { replace: true });
    } else if (isMom) {
      // Normal Mom users cannot access Admin, Expert, or Staff portals
      if (path === '/admin' || path === '/expert' || path === '/staff') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [location.pathname, isAdmin, isExpert, isStaff, isMom, navigate]);

  const handleLogout = async () => {
    // Hỏi lại để mẹ không lỡ tay đăng xuất
    if (!window.confirm('Mẹ có chắc muốn đăng xuất không?')) return;
    try {
      await logout();
      toast.success('Đã đăng xuất. Hẹn gặp lại mẹ!');
      navigate('/login');
    } catch {
      toast.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  // Menu chia nhóm, tên gọi đời thường, không biệt ngữ
  const getNavGroups = () => {
    if (isAdmin) return [{ title: null, items: [{ label: 'Quản trị hệ thống', path: '/admin', icon: Settings }] }];
    if (isExpert) return [{ title: null, items: [{ label: 'Duyệt AI & tư vấn', path: '/expert', icon: ShieldCheck }] }];
    if (isStaff) return [{ title: null, items: [{ label: 'Cổng chăm sóc', path: '/staff', icon: HeartPulse }] }];

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
  const allItems = navGroups.flatMap(g => g.items);
  // Điện thoại: tối đa 3 mục chính + Khẩn cấp + Thêm, chữ đủ lớn để bấm
  const mobileMain = isMom
    ? [allItems[0], allItems[1], allItems.find(i => i.path === '/care-calendar')].filter(
        (item, idx, arr) => item && arr.findIndex(x => x.path === item.path) === idx
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
    return getTierNameVi(tier);
  };

  const NavLink = ({ item, large = false }) => {
    const Icon = item.icon;
    const active = isPathActive(location.pathname, item.path);
    return (
      <Link
        to={item.path}
        aria-current={active ? 'page' : undefined}
        className={`flex items-center gap-3 px-4 ${large ? 'py-4 text-lg' : 'py-3 text-base'} rounded-2xl font-semibold transition-colors ${
          active
            ? 'bg-momPink-light text-momPink-dark dark:bg-momPink/20 dark:text-pink-300'
            : 'text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800'
        }`}
      >
        <Icon className="w-6 h-6 shrink-0" />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="h-screen bg-[#FCF8F8] dark:bg-[#0E0C0F] text-gray-800 dark:text-gray-100 flex flex-col font-sans relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-pink-100 dark:border-gray-800 py-3 px-4 sm:px-8 flex items-center justify-between gap-3">
        <button onClick={handleLogoClick} className="flex items-center gap-3 text-left" aria-label="Về trang chủ">
          <img src={momOiLogo} alt="" className="h-12 w-12 rounded-full object-cover shadow" />
          <span className="font-brand text-2xl font-extrabold leading-none text-momPink-dark dark:text-pink-400">
            Mom Ơi!
          </span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <Link to="/profile" className="hidden md:flex flex-col items-end text-right mr-1">
              <span className="text-base font-bold text-gray-800 dark:text-gray-100">
                {fullName || 'Tài khoản của mẹ'}
              </span>
              <span className="text-sm font-semibold text-momPink-dark dark:text-pink-300">{getRoleBadgeVi()}</span>
            </Link>
          )}

          {isMom && (
            <Link
              to="/emergency"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-base font-bold shadow"
            >
              <Phone className="w-5 h-5" /> Khẩn cấp
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-base font-semibold"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-24 lg:pb-0 relative z-10 overflow-hidden">
        {/* Sidebar (máy tính) */}
        <aside className="hidden lg:flex flex-col w-72 border-r border-pink-100 dark:border-gray-800 p-4 shrink-0 overflow-y-auto h-full">
          <nav className="space-y-6 flex-1" aria-label="Menu chính">
            {navGroups.map(group => (
              <div key={group.title || 'main'}>
                {group.title && (
                  <p className="px-4 mb-2 text-sm font-bold text-gray-500 dark:text-gray-400">{group.title}</p>
                )}
                <div className="space-y-1">
                  {group.items.map(item => <NavLink key={item.path} item={item} />)}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Nội dung */}
        <main className="flex-1 min-w-0 p-4 sm:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            {shouldShowExpiryNotice && (
              <div className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-amber-900">Gói của mẹ sắp hết hạn</p>
                  <p className="text-base text-amber-800 mt-1">
                    Còn {Math.max(tierDaysLeft, 0)} ngày. Gia hạn để tiếp tục dùng các tính năng nâng cao.
                  </p>
                </div>
                <Link to="/upgrade" className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-base font-bold text-center">
                  Gia hạn ngay
                </Link>
              </div>
            )}
            <Outlet />
          </div>

          {isMom && <MedicalDisclaimer className="mt-14" />}
          <footer className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-2 text-center sm:text-left">
              <Microscope className="w-4 h-4 text-momPink" />
              Khuyến nghị dinh dưỡng theo chuẩn WHO và dữ liệu USDA
            </span>
            <div className="flex items-center gap-4 shrink-0">
              <a href="https://www.who.int/publications/i/item/9789240081864" target="_blank" rel="noopener noreferrer" className="hover:text-momPink inline-flex items-center gap-1">
                WHO <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-momPink inline-flex items-center gap-1">
                USDA <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </footer>
        </main>
      </div>

      {/* Menu "Thêm" (điện thoại) */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={() => setMoreOpen(false)}>
          <div
            className="bg-white dark:bg-gray-900 rounded-t-3xl p-4 pb-8 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-label="Tất cả mục"
          >
            <div className="flex items-center justify-between mb-3 px-2">
              <p className="text-xl font-bold">Tất cả mục</p>
              <button onClick={() => setMoreOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Đóng">
                <X className="w-7 h-7" />
              </button>
            </div>
            {navGroups.map(group => (
              <div key={group.title || 'main'} className="mb-4">
                {group.title && <p className="px-4 mb-1 text-sm font-bold text-gray-500">{group.title}</p>}
                {group.items.map(item => <NavLink key={item.path} item={item} large />)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thanh điều hướng dưới (điện thoại) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-pink-100 dark:border-gray-800 grid grid-flow-col auto-cols-fr z-40 shadow-2xl" aria-label="Điều hướng nhanh">
        {mobileMain.map(item => {
          const Icon = item.icon;
          const active = isPathActive(location.pathname, item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 min-h-[64px] text-sm font-semibold ${
                active ? 'text-momPink-dark dark:text-pink-300' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <Icon className="w-7 h-7" />
              <span className="leading-tight text-center">{item.label}</span>
            </Link>
          );
        })}
        {isMom && (
          <>
            <Link to="/emergency" className="flex flex-col items-center justify-center gap-1 py-2.5 min-h-[64px] text-sm font-bold text-red-600">
              <Phone className="w-7 h-7" />
              Khẩn cấp
            </Link>
            <button
              onClick={() => setMoreOpen(true)}
              className="flex flex-col items-center justify-center gap-1 py-2.5 min-h-[64px] text-sm font-semibold text-gray-600 dark:text-gray-300"
            >
              <Menu className="w-7 h-7" />
              Thêm
            </button>
          </>
        )}
      </nav>
    </div>
  );
}
