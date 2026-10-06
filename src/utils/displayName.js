/**
 * Tên hiển thị thân thiện cho người dùng (không bao giờ hiện email).
 * Ưu tiên: user.fullName (API đăng nhập) -> claim "fullname" trong JWT
 * (cho phiên đăng nhập cũ chưa có fullName) -> null.
 */
const readNameFromToken = (token) => {
  if (!token) return null;
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(payload)
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
    return JSON.parse(json).fullname || null;
  } catch {
    return null;
  }
};

export const getFullName = (user, token) => {
  const name = (user?.fullName || readNameFromToken(token) || '').trim();
  return name || null;
};

// Tên gọi theo kiểu Việt: "Nguyễn Thị Lan" -> "Lan"
export const getGivenName = (fullName) => {
  if (!fullName) return null;
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1];
};

export const getTimeGreeting = (date = new Date()) => {
  const h = date.getHours();
  if (h < 11) return 'Chào buổi sáng';
  if (h < 14) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};

export const formatTodayVi = (date = new Date()) =>
  date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
