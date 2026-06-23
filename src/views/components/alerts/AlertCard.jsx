import React, { useState } from 'react';
import { AlertTriangle, Info, Heart, CheckCircle, Star, ChevronDown, ChevronUp } from 'lucide-react';

export default function AlertCard({ alert, onMarkRead }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  if (!alert) return null;

  const handleDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => {
      onMarkRead?.(alert.id);
    }, 450); // duration matching the transition
  };

  const isBr05 = alert.ruleId === 'BR05';
  const severity = alert.severity?.toLowerCase() || 'info';

  // Styles mapper
  let cardStyle = '';
  let borderStyle = '';
  let badgeStyle = '';
  let Icon = Heart;
  let iconColor = 'text-momPink';

  if (isBr05) {
    // BR05 is maternal mental health (EPDS) — trauma-informed design: never clinical red
    cardStyle = 'bg-pink-50/70 dark:bg-pink-950/20';
    borderStyle = 'border-l-4 border-pink-400';
    badgeStyle = 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300';
    Icon = Heart;
    iconColor = 'text-pink-500';
  } else {
    switch (severity) {
      case 'critical':
        cardStyle = 'bg-red-50/70 dark:bg-red-950/20';
        borderStyle = 'border-l-4 border-red-400';
        badgeStyle = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
        Icon = AlertTriangle;
        iconColor = 'text-red-500';
        break;
      case 'warning':
        cardStyle = 'bg-amber-50/70 dark:bg-amber-950/20';
        borderStyle = 'border-l-4 border-amber-400';
        badgeStyle = 'bg-amber-100 text-amber-850 dark:bg-amber-900/40 dark:text-amber-300';
        Icon = Info;
        iconColor = 'text-amber-500';
        break;
      case 'positive':
        cardStyle = 'bg-green-50/70 dark:bg-green-950/20';
        borderStyle = 'border-l-4 border-green-400';
        badgeStyle = 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
        Icon = Star;
        iconColor = 'text-green-500';
        break;
      case 'info':
      default:
        cardStyle = 'bg-pink-50/50 dark:bg-gray-800';
        borderStyle = 'border-l-4 border-momPink';
        badgeStyle = 'bg-pink-100 text-momPink-dark dark:bg-pink-900/40 dark:text-pink-300';
        Icon = Heart;
        iconColor = 'text-momPink';
        break;
    }
  }

  return (
    <div
      className={`p-4 rounded-2xl border border-gray-100 dark:border-gray-750 shadow-sm flex flex-col justify-between gap-3 transition-all duration-500 ${cardStyle} ${borderStyle} ${
        isDismissing ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100'
      } ${alert.read ? 'opacity-60' : ''}`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${badgeStyle}`}>
            {alert.ruleId || 'MOM_OI'}
          </span>
          <span className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold">
            {new Date(alert.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <h4 className="text-xs font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
          <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
          {alert.title}
        </h4>

        {/* Message content (2 lines truncate unless expanded) */}
        <p
          className={`mt-1.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-semibold ${
            isExpanded ? '' : 'line-clamp-2'
          }`}
        >
          {alert.message}
        </p>

        {/* Expansion area */}
        {isExpanded && alert.suggestion && (
          <div className="mt-3 text-[11px] text-gray-750 dark:text-gray-450 bg-white/60 dark:bg-gray-900/40 p-2.5 rounded-xl border border-pink-100/30 font-semibold animate-slide-in">
            💡 <span className="font-bold text-momPink-dark">Gợi ý từ chuyên gia:</span> {alert.suggestion}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-200/40">
        {/* Toggle Expand button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[10px] font-extrabold text-gray-500 hover:text-gray-700 dark:text-gray-400 transition"
        >
          {isExpanded ? (
            <>
              Thu gọn <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Chi tiết <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        {/* Mark read button */}
        {!alert.read && onMarkRead && (
          <button
            onClick={handleDismiss}
            className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-750 hover:bg-momPink-light/30 border border-gray-200 dark:border-gray-600 rounded-lg text-[10px] font-extrabold text-momPink hover:text-momPink-dark transition-all duration-300 shadow-sm active:scale-95"
          >
            <CheckCircle className="w-3 h-3 text-momPink" />
            Đã hiểu ✓
          </button>
        )}
      </div>
    </div>
  );
}
