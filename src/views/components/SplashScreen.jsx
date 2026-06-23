import React, { useEffect, useState } from 'react';


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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
        
        {/* Inline SVG representing Mother & Child Heart */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 mb-6 relative z-10 animate-float text-primary flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#rose-grad)" />
            <path d="M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" stroke="white" strokeWidth="1.5" />
            <path d="M10 13c0-1.5 1-2.5 2-2.5s2 1 2 2.5-1 2-2 3-2-1.5-2-3z" stroke="white" strokeWidth="1.5" />
            <defs>
              <linearGradient id="rose-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF7A8A" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight animate-fade-in-up relative z-10 font-display">
          Mom <span className="text-primary">Ơi!</span>
        </h1>
        <p className="mt-2 text-sm text-subtle-light font-medium dark:text-gray-400 max-w-xs text-center relative z-10">
          Sức khỏe dinh dưỡng & tinh thần cho Mẹ và Bé
        </p>
        
        <div className="mt-8 w-48 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden relative z-10">
          <div className="h-full bg-primary animate-loading-bar rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
