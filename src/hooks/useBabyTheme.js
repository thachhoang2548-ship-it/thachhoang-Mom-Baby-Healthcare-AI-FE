import { useEffect, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'momoi_active_baby_v1';

// Quy ước của babyService: gender 0 = bé trai, 1 = bé gái.
export function getBabyTheme(gender) {
  if (gender === 0 || gender === '0' || gender === 'male' || gender === 'boy') return 'boy';
  if (gender === 1 || gender === '1' || gender === 'female' || gender === 'girl') return 'girl';
  return null;
}

// Tránh lặp chữ "Bé Bé Duy" khi tên lưu trong hồ sơ đã có sẵn từ "Bé " ở đầu.
export function formatBabyDisplayName(rawName, fallback = 'Bé yêu') {
  const trimmed = String(rawName || '').trim();
  if (!trimmed) return fallback;
  if (/^bé(\s|$)/i.test(trimmed)) return trimmed;
  return `Bé ${trimmed}`;
}

function readStoredBaby() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const theme = getBabyTheme(parsed.gender ?? parsed.theme);
    return theme ? { ...parsed, theme } : null;
  } catch {
    return null;
  }
}

let currentBabyState = readStoredBaby();
const listeners = new Set();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function applyBabyThemeToDom(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'boy' || theme === 'girl') {
    root.dataset.babyTheme = theme;
  } else {
    delete root.dataset.babyTheme;
  }
}

export function setGlobalActiveBaby(baby, ownerKey = null) {
  if (!baby) {
    currentBabyState = null;
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage quota errors
    }
    applyBabyThemeToDom(null);
    emitChange();
    return;
  }

  const theme = getBabyTheme(baby.gender);
  if (!theme) return;

  const next = {
    id: baby.id ?? currentBabyState?.id ?? null,
    name: baby.name || baby.babyName || currentBabyState?.name || '',
    gender: baby.gender,
    ageMonths: baby.ageMonths ?? currentBabyState?.ageMonths ?? null,
    theme,
    ownerKey: ownerKey ?? currentBabyState?.ownerKey ?? null,
  };

  const unchanged =
    currentBabyState &&
    currentBabyState.id === next.id &&
    currentBabyState.name === next.name &&
    currentBabyState.theme === next.theme &&
    currentBabyState.ageMonths === next.ageMonths &&
    currentBabyState.ownerKey === next.ownerKey;

  currentBabyState = next;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage quota errors
  }
  applyBabyThemeToDom(theme);
  if (!unchanged) emitChange();
}

export function clearGlobalActiveBaby() {
  setGlobalActiveBaby(null);
}

// Chọn đúng bé mà mẹ đang xem ở phiên hiện tại thay vì luôn ép về profiles[0]
export function pickPreferredBaby(profiles) {
  if (!Array.isArray(profiles) || profiles.length === 0) return null;
  if (currentBabyState?.id != null) {
    const matched = profiles.find((b) => String(b.id) === String(currentBabyState.id));
    if (matched) return matched;
  }
  return profiles[0];
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentBabyState;
}

export function useActiveBaby() {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

// Giữ chữ ký useBabyTheme(selectedBaby) tương thích hoàn toàn với các trang module bé:
// - Nếu baby có id (hồ sơ thật): lưu làm theme toàn dashboard để chuyển sang trang khác không bị nhấp nháy về màu cũ.
// - Nếu baby chỉ có gender tạm thời (đang chọn radio trên form tạo/sửa): xem trước màu tức thì, rời form chưa lưu thì trả về màu hồ sơ cũ.
export function useBabyTheme(baby) {
  const theme = getBabyTheme(baby?.gender);
  const babyId = baby?.id ?? null;
  const babyName = baby?.name || baby?.babyName || '';
  const babyAgeMonths = baby?.ageMonths ?? null;

  useEffect(() => {
    if (!theme) return undefined;

    if (babyId !== null) {
      setGlobalActiveBaby({
        id: babyId,
        name: babyName,
        gender: theme,
        ageMonths: babyAgeMonths,
      });
      return undefined;
    }

    // Xem trước tạm thời trên form khi chưa có id lưu server
    applyBabyThemeToDom(theme);
    return () => {
      applyBabyThemeToDom(currentBabyState?.theme || null);
    };
  }, [theme, babyId, babyName, babyAgeMonths]);
}
