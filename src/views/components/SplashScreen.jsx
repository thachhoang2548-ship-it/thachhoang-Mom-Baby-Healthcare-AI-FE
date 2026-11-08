import React, { useEffect, useState } from 'react';
import momOiLogo from '../../assets/Logo/mom-oi-submark-cropped.png';

const SPLASH_SESSION_KEY = 'momoi_splash_seen';

const SplashScreen = ({ onFinish }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(SPLASH_SESSION_KEY, '1');
    } catch {
      // Ignore storage restrictions in private browsing
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      const quickTimer = setTimeout(() => onFinish(), 320);
      return () => clearTimeout(quickTimer);
    }

    const fadeTimer = setTimeout(() => setFade(true), 550);
    const finishTimer = setTimeout(() => onFinish(), 780);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-theme-page px-6 font-display text-theme-ink transition-opacity duration-200 ${
        fade ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex max-w-sm flex-col items-center rounded-3xl border border-theme-line bg-theme-surface px-8 py-9 text-center shadow-sm">
        <div className="mb-5 rounded-full border border-theme-line bg-theme-page p-2">
          <img
            src={momOiLogo}
            alt="Mom Ơi!"
            className="h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24"
          />
        </div>

        <h1 className="font-brand text-4xl font-extrabold leading-none tracking-normal text-theme-ink sm:text-5xl">
          Mom <span className="text-theme-brand">Ơi!</span>
        </h1>
        <p className="mt-2.5 text-sm font-medium leading-relaxed text-theme-muted">
          Sức khỏe dinh dưỡng &amp; tinh thần cho Mẹ và Bé
        </p>

        <div className="mt-6 h-1.5 w-36 overflow-hidden rounded-full bg-theme-brand-soft" aria-hidden="true">
          <div className="h-full w-2/3 rounded-full bg-theme-brand transition-all duration-500" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
