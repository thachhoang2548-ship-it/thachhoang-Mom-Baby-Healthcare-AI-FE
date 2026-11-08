/*
  Mom Ơi! — service worker hỗ trợ nghe nhạc khi không có mạng.
  Viết tay, không dùng thư viện. Chỉ lưu những thứ không chứa dữ liệu cá nhân:
    - giao diện app (index.html và các tệp /assets/ có mã băm),
    - danh sách bài thư giãn (/api/wellness/relax-tracks),
    - file nhạc mà mẹ chủ động bấm tải.
  KHÔNG lưu các API khác (hồ sơ, sức khỏe, thanh toán...).

  Đổi VERSION khi đổi logic để bộ nhớ cũ được dọn. Công tắc khẩn cấp: mở /?sw=off
  (xem src/utils/offline.js) sẽ gỡ service worker và xóa bộ nhớ đệm.
*/
const VERSION = 'v1';
const SHELL_CACHE = `momoi-shell-${VERSION}`;
const DATA_CACHE = `momoi-data-${VERSION}`;
// Tên cố định: file nhạc do mẹ chủ động tải, không xóa khi đổi VERSION
const AUDIO_CACHE = 'momoi-audio-v1';
const KEEP = [SHELL_CACHE, DATA_CACHE, AUDIO_CACHE];

// Máy chủ có thể trả `Vary: Origin`; thẻ <script crossorigin> gửi kèm Origin nên bản đã lưu sẽ không khớp.
// Khóa của bộ nhớ này là địa chỉ nên bỏ qua Vary là an toàn.
const MATCH = { ignoreVary: true };

const TRACKS_PATH = '/api/wellness/relax-tracks';
const AUDIO_EXT = /\.(mp3|m4a|aac|ogg|oga|wav)$/i;

// Gốc của API được truyền qua tham số ?api= khi đăng ký (không biết lúc viết file này)
const API_ORIGIN = (() => {
  try {
    return new URL(self.location.href).searchParams.get('api') || '';
  } catch {
    return '';
  }
})();

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.add(new Request('/index.html', { cache: 'reload' })))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('momoi-') && !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  const sameOrigin = url.origin === self.location.origin;

  // 1. Mở trang: mạng trước; mất mạng thì dùng giao diện đã lưu (app một trang dùng chung index.html)
  if (req.mode === 'navigate' && sameOrigin) {
    event.respondWith(handleNavigate(req));
    return;
  }

  // 2. File nhạc: chỉ can thiệp để phục vụ bản mẹ đã tải (kèm hỗ trợ Range, Safari bắt buộc)
  if (req.destination === 'audio' || AUDIO_EXT.test(url.pathname)) {
    event.respondWith(handleAudio(req));
    return;
  }

  // 3. Tệp /assets/ có mã băm (không đổi nội dung): lấy bộ nhớ trước
  if (sameOrigin && url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(req, SHELL_CACHE));
    return;
  }

  // 4. Danh sách bài thư giãn: mạng trước, mất mạng dùng bản đã lưu
  if (API_ORIGIN && url.origin === API_ORIGIN && url.pathname === TRACKS_PATH) {
    event.respondWith(networkFirst(req, DATA_CACHE));
    return;
  }

  // 5. Ảnh, biểu tượng... cùng gốc (không thuộc /api): mạng trước, mất mạng dùng bản lưu
  if (sameOrigin && !url.pathname.startsWith('/api/') && ['image', 'font', 'manifest'].includes(req.destination)) {
    event.respondWith(networkFirst(req, SHELL_CACHE));
    return;
  }
  // Mọi yêu cầu khác (API cá nhân...) đi thẳng ra mạng, không lưu.
});

async function handleNavigate(req) {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const copy = res.clone();
      caches.open(SHELL_CACHE).then((c) => c.put('/index.html', copy));
    }
    return res;
  } catch {
    const cache = await caches.open(SHELL_CACHE);
    return (await cache.match('/index.html', MATCH)) || Response.error();
  }
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req, MATCH);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    // Khóa theo địa chỉ (bỏ qua tiêu đề Authorization) để mất mạng vẫn tìm lại được
    if (res.ok) cache.put(req.url, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req.url, MATCH);
    if (hit) return hit;
    throw err;
  }
}

async function handleAudio(req) {
  const cache = await caches.open(AUDIO_CACHE);
  const hit = await cache.match(req.url, MATCH);
  if (!hit) return fetch(req); // chưa tải: đi thẳng ra mạng, không tự lưu file lớn
  const range = req.headers.get('range');
  return range ? rangeResponse(range, hit) : hit;
}

// Trình duyệt (nhất là Safari) phát nhạc bằng yêu cầu Range; bộ nhớ đệm phải trả 206 đúng đoạn
async function rangeResponse(rangeHeader, cached) {
  const m = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
  if (!m) return cached;
  const buf = await cached.arrayBuffer();
  const size = buf.byteLength;
  let start = m[1] === '' ? null : Number(m[1]);
  let end = m[2] === '' ? null : Number(m[2]);
  if (start === null) {
    // dạng "bytes=-N": N byte cuối
    start = Math.max(0, size - (end || 0));
    end = size - 1;
  } else if (end === null || end >= size) {
    end = size - 1;
  }
  if (start > end || start >= size) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }
  const headers = new Headers(cached.headers);
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  headers.set('Accept-Ranges', 'bytes');
  if (!headers.get('Content-Type')) headers.set('Content-Type', 'audio/mpeg');
  return new Response(buf.slice(start, end + 1), { status: 206, statusText: 'Partial Content', headers });
}
