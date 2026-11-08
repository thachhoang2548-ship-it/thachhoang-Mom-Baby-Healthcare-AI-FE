import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useColorScheme } from '../../../hooks/useColorScheme';

const OPTIONS = [
  { value: 'light', label: 'Sáng', Icon: Sun },
  { value: 'dark', label: 'Tối', Icon: Moon },
  { value: 'system', label: 'Theo thiết bị', Icon: Monitor },
];

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2';

// variant:
//  - 'responsive' (mặc định): một nút đổi vòng ở màn hình nhỏ, ba lựa chọn từ lg trở lên
//  - 'compact': luôn là một nút đổi vòng (dùng ở thanh đầu trang chật)
//  - 'segmented': luôn là ba lựa chọn (dùng ở chân trang, trang cài đặt)
export default function ColorSchemeToggle({ variant = 'responsive', className = '' }) {
  const { mode, setMode } = useColorScheme();
  const currentIndex = Math.max(0, OPTIONS.findIndex((option) => option.value === mode));
  const current = OPTIONS[currentIndex];
  const next = OPTIONS[(currentIndex + 1) % OPTIONS.length];
  const CurrentIcon = current.Icon;

  const showCycle = variant !== 'segmented';
  const showSegmented = variant !== 'compact';
  const cycleVisibility = variant === 'responsive' ? 'inline-flex lg:hidden' : 'inline-flex';
  const segmentedVisibility = variant === 'responsive' ? 'hidden lg:inline-flex' : 'inline-flex';

  return (
    <>
      {showCycle && (
        <button
          type="button"
          onClick={() => setMode(next.value)}
          aria-label={`Giao diện: ${current.label}. Bấm để chuyển sang ${next.label}`}
          title={`Giao diện: ${current.label}`}
          className={`${cycleVisibility} min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-theme-line bg-theme-surface text-theme-ink transition-colors hover:border-theme-brand/40 ${FOCUS} ${className}`}
        >
          <CurrentIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {showSegmented && (
        <div
          role="group"
          aria-label="Giao diện sáng hoặc tối"
          className={`${segmentedVisibility} items-center gap-0.5 rounded-full border border-theme-line bg-theme-surface p-0.5 ${className}`}
        >
          {OPTIONS.map((option) => {
            const Icon = option.Icon;
            const isOn = mode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isOn}
                aria-label={option.label}
                title={option.label}
                onClick={() => setMode(option.value)}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors ${FOCUS} ${
                  isOn ? 'bg-theme-brand text-theme-surface' : 'text-theme-muted hover:text-theme-ink'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
