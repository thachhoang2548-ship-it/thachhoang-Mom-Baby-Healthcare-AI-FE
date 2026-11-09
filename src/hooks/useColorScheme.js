import { useSyncExternalStore } from 'react';

export const COLOR_MODE_STORAGE_KEY = 'momoi_color_mode_v1';
// Mặc định Sáng cho tới khi mọi trang đã chuyển sang token màu (kiểm xong mới đổi thành 'system').
// Giữ đồng bộ với đoạn script ở đầu index.html (cùng khóa lưu và cùng mặc định).
export const DEFAULT_COLOR_MODE = 'light';

const MODES = ['light', 'dark', 'system'];
const DARK_QUERY = '(prefers-color-scheme: dark)';

function readStoredMode() {
  try {
    const stored = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    return MODES.includes(stored) ? stored : DEFAULT_COLOR_MODE;
  } catch {
    // Chế độ riêng tư hoặc bị chặn lưu trữ: dùng mặc định
    return DEFAULT_COLOR_MODE;
  }
}

function systemPrefersDark() {
  return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(DARK_QUERY).matches;
}

export function resolveColorScheme(mode) {
  return mode === 'dark' || (mode === 'system' && systemPrefersDark()) ? 'dark' : 'light';
}

export function applyColorSchemeToDom(mode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const scheme = resolveColorScheme(mode);
  root.dataset.colorScheme = scheme;
  // Bật luôn class "dark" để các lớp dark: có sẵn ở những trang cũ cùng hoạt động
  root.classList.toggle('dark', scheme === 'dark');
}

let currentMode = typeof window === 'undefined' ? DEFAULT_COLOR_MODE : readStoredMode();
const listeners = new Set();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function setColorMode(mode) {
  if (!MODES.includes(mode)) return;
  currentMode = mode;
  try {
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
  } catch {
    // ignore storage errors
  }
  applyColorSchemeToDom(mode);
  emitChange();
}

// Đang ở "Theo thiết bị" thì đổi theo hệ điều hành ngay khi người dùng đổi
if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia(DARK_QUERY).addEventListener?.('change', () => {
    if (currentMode !== 'system') return;
    applyColorSchemeToDom('system');
    emitChange();
  });
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentMode;
}

export function useColorScheme() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_COLOR_MODE);
  return { mode, scheme: resolveColorScheme(mode), setMode: setColorMode };
}
