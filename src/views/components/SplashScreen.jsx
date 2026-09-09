import React, { useEffect, useState } from 'react';
import momOiLogo from '../../assets/Logo/mom-oi-submark-cropped.png';

const SplashScreen = ({ onFinish }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFade(true), 2500);
    const finishTimer = setTimeout(() => onFinish(), 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background-light dark:bg-background-dark transition-opacity duration-500 ${fade ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="relative flex flex-col items-center">
        <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-2xl animate-pulse" />

        <img
          src={momOiLogo}
          alt="Mom Ơi!"
          className="relative z-10 mb-6 h-24 w-24 rounded-full object-cover shadow-xl shadow-primary/15 animate-float sm:h-32 sm:w-32"
        />

        <h1 className="relative z-10 font-brand text-5xl font-extrabold leading-none tracking-normal text-gray-900 animate-fade-in-up dark:text-white sm:text-6xl">
          Mom <span className="text-primary">Ơi!</span>
        </h1>
        <p className="relative z-10 mt-2 max-w-xs text-center text-sm font-medium text-gray-500 dark:text-gray-400">
          Sức khỏe dinh dưỡng & tinh thần cho Mẹ và Bé
        </p>

        <div className="relative z-10 mt-8 h-1 w-48 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div className="h-full rounded-full bg-primary animate-loading-bar" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
