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
    <div className="relative my-4 min-h-[280px] overflow-hidden rounded-3xl border border-theme-line bg-theme-surface font-display shadow-sm">
      {showPreview ? (
        <div
          aria-hidden="true"
          className="pointer-events-none max-h-[360px] min-h-[280px] select-none overflow-hidden opacity-30 blur-md"
        >
          {children}
        </div>
      ) : (
        <div className="min-h-[360px] bg-theme-page/60" />
      )}

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-y-auto bg-theme-page/85 p-4 text-center backdrop-blur-[3px] sm:p-6">
        <div className="w-full max-w-md rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm sm:p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-theme-brand/20 bg-theme-brand-soft text-theme-brand">
            <Lock className="h-5 w-5" />
          </div>
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-theme-brand-soft px-3.5 py-1 text-xs font-semibold text-theme-ink">
            <Sparkles className="h-3.5 w-3.5 text-theme-brand" />
            Đặc quyền hội viên
          </span>
          <h3 className="text-xl font-bold text-theme-ink">
            Mở khóa tiện ích cùng gói {tierNameVi}
          </h3>
          <p className="mx-auto mt-2.5 max-w-sm text-sm font-medium leading-relaxed text-theme-muted">
            Tính năng chăm sóc chuyên sâu này dành cho hội viên gói{' '}
            <span className="font-bold text-theme-ink">{tierNameVi}</span>. Nâng cấp để trải nghiệm trọn vẹn lộ trình cá nhân hóa cho mẹ và bé.
          </p>
          <button
            type="button"
            onClick={() => navigate('/upgrade')}
            className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-theme-brand px-6 py-2.5 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
          >
            <span>Xem gói nâng cấp</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
