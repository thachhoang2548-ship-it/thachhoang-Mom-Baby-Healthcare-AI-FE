import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthController } from '../../../controllers/authController';
import { checkTierUnlocked, getTierNameVi } from '../../../utils/tierHelpers';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';

export default function TierGate({ requiredTier = 'MomHienDai', children, showPreview = true }) {
  const userTier = useAuthController((state) => state.tier);
  const navigate = useNavigate();
  const isUnlocked = checkTierUnlocked(userTier, requiredTier);

  if (isUnlocked) {
    return <>{children}</>;
  }

  const tierNameVi = getTierNameVi(requiredTier);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-pink-100/80 dark:border-pink-900/20 shadow-sm my-4 min-h-[260px]">
      {/* Blurred backdrop of actual premium content */}
      {showPreview ? (
        <div className="blur-md select-none pointer-events-none filter brightness-95 dark:brightness-75 opacity-40 min-h-[260px] max-h-[350px] overflow-hidden">
          {children}
        </div>
      ) : (
        <div className="min-h-[420px]" />
      )}

      {/* Modern premium upgrade glass card */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/85 backdrop-blur-[4px] flex flex-col items-center justify-center p-4 sm:p-6 text-center z-10 overflow-y-auto">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-momPink to-momPurple flex items-center justify-center text-white shadow-[0_8px_25px_rgba(236,72,153,0.35)] mb-3">
          <Lock className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest bg-pink-100 dark:bg-pink-950/40 text-momPink px-3 py-1 rounded-full mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Đặc quyền chuyên sâu
        </span>
        <h3 className="text-lg font-black text-gray-850 dark:text-white">
          Tính năng được bảo vệ
        </h3>
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 max-w-sm leading-relaxed font-medium">
          Tính năng chuyên sâu này dành riêng cho hội viên gói{' '}
          <span className="text-momPink-dark dark:text-pink-400 font-extrabold">
            {tierNameVi}
          </span>
          . Nâng cấp ngay để mở khóa toàn bộ tiện ích chăm sóc cá nhân hóa cho mami!
        </p>
        <button
          onClick={() => navigate('/upgrade')}
          className="mt-5 px-7 py-3 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-bold rounded-full hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-md flex items-center gap-2"
        >
          <span>Nâng cấp ngay</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
