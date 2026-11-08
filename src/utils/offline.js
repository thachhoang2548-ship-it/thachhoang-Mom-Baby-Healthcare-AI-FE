// Hỗ trợ dùng app khi không có mạng (phối hợp với public/sw.js).
// Chỉ đăng ký ở bản build chính thức (xem src/main.jsx).
// Công tắc khẩn cấp theo từng máy: mở /?sw=off (gỡ và nhớ lựa chọn), /?sw=on (bật lại).
// Muốn tắt cho mọi người: triển khai một sw.js chỉ gồm self.registration.unregister() rồi xóa các cache bắt đầu bằng "momoi-".

const SHELL_PREFIX = 'momoi-shell-';
const DATA_PREFIX = 'momoi-data-';
export const AUDIO_CACHE = 'momoi-audio-v1';
const OFF_FLAG = 'momoi_sw_off';

export function isOfflineSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'caches' in window;
}

// Đăng ký service worker; apiBase để service worker biết gốc API cần lưu danh sách bài thư giãn
export async function registerOffline(apiBase) {
  if (!isOfflineSupported()) return null;

  const sw = new URLSearchParams(window.location.search).get('sw');
  try {
    if (sw === 'on') localStorage.removeItem(OFF_FLAG);
    if (sw === 'off') localStorage.setItem(OFF_FLAG, '1');
  } catch {
    /* bỏ qua */
  }
  let off = false;
  try {
    off = localStorage.getItem(OFF_FLAG) === '1';
  } catch {
    off = false;
  }
  if (off) {
    await disableOffline();
    return null;
  }

  let apiOrigin = '';
  try {
    apiOrigin = new URL(apiBase, window.location.href).origin;
  } catch {
    apiOrigin = '';
  }

  const registration = await navigator.serviceWorker.register(`/sw.js?api=${encodeURIComponent(apiOrigin)}`);
  await navigator.serviceWorker.ready;
  primeShellCache();
  return registration;
}

// Lần đầu mở app, trang chưa do service worker kiểm soát nên các tệp /assets/ đã tải chưa được lưu.
// Lưu bổ sung ngay để lần sau mở được khi không có mạng.
async function primeShellCache() {
  try {
    const keys = await caches.keys();
    const shellName = keys.find((k) => k.startsWith(SHELL_PREFIX));
    if (!shellName) return;
    const cache = await caches.open(shellName);
    const urls = performance
      .getEntriesByType('resource')
      .map((e) => e.name)
      .filter((name) => {
        const u = new URL(name);
        return u.origin === window.location.origin && u.pathname.startsWith('/assets/');
      });
    await Promise.all(
      urls.map(async (u) => {
        if (!(await cache.match(u, { ignoreVary: true }))) {
          try {
            await cache.add(u);
          } catch {
            /* bỏ qua tệp không lưu được */
          }
        }
      })
    );
  } catch {
    /* không ảnh hưởng việc dùng app */
  }
}

// Gỡ service worker và xóa toàn bộ bộ nhớ đệm của app (kể cả nhạc đã tải)
export async function disableOffline() {
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((r) => r.unregister()));
  const keys = await caches.keys();
  await Promise.all(keys.filter((k) => k.startsWith('momoi-')).map((k) => caches.delete(k)));
  const url = new URL(window.location.href);
  url.searchParams.delete('sw');
  window.history.replaceState(null, '', url.toString());
  // Trang hiện tại còn do service worker cũ kiểm soát (có thể điền lại bộ nhớ); tải lại một lần để thoát khỏi nó
  if (navigator.serviceWorker.controller) window.location.reload();
}

// ── File nhạc mẹ chủ động tải để nghe offline ──

// Tải và lưu một file nhạc. Ném lỗi nếu không tải được (mất mạng, máy chủ không bật chia sẻ giữa các tên miền...)
export async function cacheAudio(url) {
  if (!isOfflineSupported()) throw new Error('Trình duyệt này chưa hỗ trợ nghe offline.');
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error('Không tải được file nhạc.');
  const cache = await caches.open(AUDIO_CACHE);
  await cache.put(url, res);
}

export async function isAudioCached(url) {
  if (!('caches' in window)) return false;
  const cache = await caches.open(AUDIO_CACHE);
  return Boolean(await cache.match(url, { ignoreVary: true }));
}

export async function removeAudio(url) {
  if (!('caches' in window)) return false;
  const cache = await caches.open(AUDIO_CACHE);
  return cache.delete(url);
}

export async function listCachedAudio() {
  if (!('caches' in window)) return [];
  const cache = await caches.open(AUDIO_CACHE);
  return (await cache.keys()).map((r) => r.url);
}

// Dung lượng trình duyệt cho phép và đã dùng (nếu hỗ trợ), để báo mẹ khi sắp đầy
export async function getStorageEstimate() {
  if (navigator.storage && navigator.storage.estimate) {
    const { usage, quota } = await navigator.storage.estimate();
    return { usage, quota };
  }
  return null;
}

// Giữ tiền tố để nơi khác (kiểm thử) tham chiếu nếu cần
export const CACHE_PREFIXES = { shell: SHELL_PREFIX, data: DATA_PREFIX, audio: AUDIO_CACHE };
