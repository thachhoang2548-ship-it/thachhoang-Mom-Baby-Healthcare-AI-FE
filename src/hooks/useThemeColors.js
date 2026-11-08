import { useSyncExternalStore } from 'react';

// Biểu đồ (recharts/SVG) cần chuỗi màu thật chứ không dùng được class Tailwind hay biến CSS trong thuộc tính.
// Hook này đọc các token theme hiện hành và tự cập nhật khi đổi sáng/tối hoặc đổi theme bé.
const TOKENS = {
  brand: '--c-brand',
  brandSoft: '--c-brand-soft',
  info: '--c-info',
  ink: '--c-ink',
  muted: '--c-muted',
  line: '--c-line',
  surface: '--c-surface',
  page: '--c-page',
  ok: '--c-ok',
  warn: '--c-warn-line',
  dangerText: '--c-danger-text',
};

// Giá trị theme sáng mặc định, dùng khi chưa đọc được CSS
const FALLBACK = {
  brand: [171, 66, 86],
  brandSoft: [248, 225, 229],
  info: [46, 109, 147],
  ink: [43, 32, 36],
  muted: [107, 91, 96],
  line: [234, 223, 218],
  surface: [255, 255, 255],
  page: [251, 246, 243],
  ok: [79, 127, 102],
  warn: [217, 150, 43],
  dangerText: [153, 27, 27],
};

const toRgb = ([r, g, b]) => `rgb(${r}, ${g}, ${b})`;
const FALLBACK_COLORS = Object.fromEntries(Object.entries(FALLBACK).map(([key, rgb]) => [key, toRgb(rgb)]));

function readColors() {
  if (typeof document === 'undefined') return FALLBACK_COLORS;
  const styles = window.getComputedStyle(document.documentElement);
  const colors = {};
  Object.entries(TOKENS).forEach(([key, cssVar]) => {
    const parts = styles.getPropertyValue(cssVar).trim().split(/\s+/).map(Number);
    colors[key] = parts.length === 3 && parts.every((n) => Number.isFinite(n)) ? toRgb(parts) : FALLBACK_COLORS[key];
  });
  return colors;
}

let cached = null;
const listeners = new Set();
let observer = null;

function subscribe(listener) {
  listeners.add(listener);
  if (!observer && typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver(() => {
      cached = readColors();
      listeners.forEach((fn) => fn());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-color-scheme', 'data-baby-theme', 'class'],
    });
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && observer) {
      observer.disconnect();
      observer = null;
    }
  };
}

function getSnapshot() {
  if (!cached) cached = readColors();
  return cached;
}

export function useThemeColors() {
  return useSyncExternalStore(subscribe, getSnapshot, () => FALLBACK_COLORS);
}
