import { useEffect } from 'react';

// Quy ước của babyService: gender 0 = bé trai, 1 = bé gái.
// Giới tính khác hoặc chưa có hồ sơ bé -> không bật theme (giữ màu thương hiệu mặc định).
export function getBabyTheme(gender) {
  if (gender === 0 || gender === 'male' || gender === 'boy') return 'boy';
  if (gender === 1 || gender === 'female' || gender === 'girl') return 'girl';
  return null;
}

// Bật theme màu theo giới tính bé cho tới khi trang rời đi.
// Gọi trong các trang module bé: useBabyTheme(selectedBaby).
export function useBabyTheme(baby) {
  const theme = getBabyTheme(baby?.gender);

  useEffect(() => {
    if (!theme) return undefined;
    const root = document.documentElement;
    root.dataset.babyTheme = theme;
    return () => {
      delete root.dataset.babyTheme;
    };
  }, [theme]);
}
