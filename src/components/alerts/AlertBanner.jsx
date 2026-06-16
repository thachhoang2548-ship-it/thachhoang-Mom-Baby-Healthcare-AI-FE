import React from 'react';
import { AlertCircle, Lightbulb } from 'lucide-react';

export default function AlertBanner({ alert, onDismiss }) {
  if (!alert) return null;

  const severityClasses = {
    info: 'bg-pink-50/90 border-momPink text-gray-800',
    warning: 'bg-amber-50/90 border-momAmber text-gray-800',
    critical: 'bg-red-50/90 border-red-400 text-gray-805',
  };

  const titleColors = {
    info: 'text-momPink-dark',
    warning: 'text-amber-700',
    critical: 'text-red-700',
  };

  return (
    <div className={`p-4 rounded-2xl border-l-4 ${severityClasses[alert.severity || 'info']} shadow-sm flex items-start gap-3 transition-all duration-300 animate-slide-in`}>
      <AlertCircle className={`w-5 h-5 mt-0.5 shrink-0 ${titleColors[alert.severity || 'info']}`} />
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-bold leading-none ${titleColors[alert.severity || 'info']}`}>
          {alert.title}
        </h4>
        <p className="mt-1.5 text-xs font-medium leading-relaxed">
          {alert.message}
        </p>
        {alert.suggestion && (
          <div className="mt-2.5 bg-white/70 dark:bg-gray-850/40 p-2.5 rounded-xl border border-pink-100/50 flex items-start gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-momPink shrink-0" />
            <span className="text-[10px] text-gray-500 font-semibold leading-normal">
              AI khuyên mami: {alert.suggestion}
            </span>
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 font-bold text-sm shrink-0 self-start p-1"
        >
          ✕
        </button>
      )}
    </div>
  );
}
