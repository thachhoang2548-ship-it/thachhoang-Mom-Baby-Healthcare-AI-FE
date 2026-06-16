import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { checkTierUnlocked, getTierNameVi } from '../../utils/tierHelpers';
import { Lock } from 'lucide-react';

export default function TierGate({ requiredTier = 'MomHienDai', children }) {
  const userTier = useAuthStore((state) => state.tier);
  const navigate = useNavigate();
  const isUnlocked = checkTierUnlocked(userTier, requiredTier);

  if (isUnlocked) {
    return <>{children}</>;
  }

  const tierNameVi = getTierNameVi(requiredTier);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-pink-100/80 dark:border-pink-900/20">
      {/* Blurred backdrop of actual premium content */}
      <div className="blur-sm select-none pointer-events-none filter brightness-95 dark:brightness-75 opacity-50">
        {children}
      </div>

      {/* Modern premium upgrade glass card */}
      <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center z-10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-momPink to-momPurple flex items-center justify-center text-white shadow-lg mb-3 animate-float">
          <Lock className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-gray-800 dark:text-white">
          Tính năng được bảo vệ
        </h3>
        <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-300 max-w-[240px] leading-relaxed">
          Tính năng này dành cho gói{' '}
          <span className="text-momPink-dark dark:text-momPink font-bold">
            {tierNameVi} 💎
          </span>
        </p>
        <button
          onClick={() => navigate('/upgrade')}
          className="mt-4 px-6 py-2.5 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-bold rounded-full hover:shadow-lg hover:opacity-95 transform active:scale-95 transition-all duration-300 shadow-md"
        >
          Nâng cấp ngay
        </button>
      </div>
    </div>
  );
}
