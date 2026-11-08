import React, { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  Download,
  CheckCircle2,
  Trash2,
  Loader2,
  AlertCircle,
  WifiOff,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  isOfflineSupported,
  isAudioCached,
  cacheAudio,
  removeAudio,
  getStorageEstimate,
} from '../../../utils/offline';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';

/*
 * Trạng thái tải/xóa nhạc theo TỪNG URL, nằm ngoài React để:
 *  - đổi bài A→B→A vẫn thấy đúng thao tác A đang chạy (không kẹt "Đang tải", không hiện sai "Đã lưu");
 *  - hai thẻ có cùng URL luôn đồng bộ (query khác nhau là URL khác nên tách biệt);
 *  - kết quả của thao tác cũ không ghi đè thao tác/đọc mới (số thứ tự, phiên bản).
 * Khóa theo chuỗi URL đúng như khóa của Cache API (xem src/utils/offline.js).
 */
const EMPTY = Object.freeze({ cached: false, busy: null, error: null });
const ERROR_MESSAGE = 'Chưa tải được, kiểm tra kết nối rồi thử lại';

const entries = new Map();

function getEntry(url) {
  let entry = entries.get(url);
  if (!entry) {
    entry = { snap: EMPTY, listeners: new Set(), dl: 0, rm: 0, version: 0, readSeq: 0 };
    entries.set(url, entry);
  }
  return entry;
}

const isBusy = (entry) => entry.dl + entry.rm > 0;
const busyOf = (entry) => (entry.dl > 0 ? 'download' : entry.rm > 0 ? 'remove' : null);

function setSnap(entry, patch) {
  const next = { ...entry.snap, ...patch };
  if (next.cached === entry.snap.cached && next.busy === entry.snap.busy && next.error === entry.snap.error) return;
  entry.snap = next;
  entry.listeners.forEach((listener) => listener());
}

// Bỏ mục khi không còn thẻ nào dùng và không có thao tác đang chạy (lần mở sau đọc lại cache từ đầu)
function dropIfIdle(url, entry) {
  if (entry.listeners.size === 0 && !isBusy(entry) && entries.get(url) === entry) entries.delete(url);
}

function subscribeUrl(url, listener) {
  if (!url) return () => {};
  const entry = getEntry(url);
  entry.listeners.add(listener);
  return () => {
    entry.listeners.delete(listener);
    dropIfIdle(url, entry);
  };
}

const snapshotOf = (url) => (url && entries.get(url) ? entries.get(url).snap : EMPTY);

// Đọc cache để biết đã lưu chưa. Chỉ áp dụng khi là lần đọc mới nhất, không có thao tác nào
// bắt đầu/kết thúc kể từ lúc đọc và không có thao tác đang chạy (thao tác sẽ tự chốt trạng thái).
function refreshCached(url) {
  const entry = entries.get(url);
  if (!entry || isBusy(entry)) return;
  entry.readSeq += 1;
  const seq = entry.readSeq;
  const version = entry.version;
  const apply = (cached) => {
    if (entries.get(url) !== entry || entry.readSeq !== seq || entry.version !== version || isBusy(entry)) return;
    setSnap(entry, { cached });
  };
  isAudioCached(url)
    .then((cached) => apply(Boolean(cached)))
    .catch(() => apply(false));
}

async function runDownload(url, title) {
  const entry = getEntry(url);
  if (isBusy(entry)) return;
  entry.version += 1;
  entry.dl += 1;
  setSnap(entry, { busy: 'download', error: null });

  let ok = true;
  try {
    await cacheAudio(url);
  } catch {
    ok = false;
  }

  entry.version += 1;
  entry.dl -= 1;
  setSnap(entry, ok ? { busy: busyOf(entry), cached: true, error: null } : { busy: busyOf(entry), error: ERROR_MESSAGE });
  // Chỉ báo khi vẫn còn thẻ của URL này trên màn hình
  if (entry.listeners.size > 0) {
    if (ok) toast.success(`Đã lưu "${title}" để nghe offline.`);
    else toast.error('Không tải được bản âm thanh.');
  }
  if (ok) refreshStorage();
  dropIfIdle(url, entry);
}

async function runRemove(url, title) {
  const entry = getEntry(url);
  if (isBusy(entry)) return;
  entry.version += 1;
  entry.rm += 1;
  setSnap(entry, { busy: 'remove' });

  let ok = true;
  try {
    await removeAudio(url);
  } catch {
    ok = false;
  }

  entry.version += 1;
  entry.rm -= 1;
  setSnap(entry, ok ? { busy: busyOf(entry), cached: false, error: null } : { busy: busyOf(entry) });
  if (entry.listeners.size > 0) {
    if (ok) toast.success(`Đã xóa bản lưu "${title}".`);
    else toast.error('Không xóa được bản lưu.');
  }
  if (ok) refreshStorage();
  dropIfIdle(url, entry);
}

/*
 * Cảnh báo dung lượng: thông tin phụ, dùng chung cho mọi thẻ. Chỉ lần truy vấn mới nhất được ghi nhận
 * (estimate cũ trả muộn không ghi đè estimate mới); lỗi/không có dữ liệu thì không cảnh báo.
 */
let storageWarning = false;
let storageSeq = 0;
const storageListeners = new Set();

function setStorageWarning(value) {
  if (value === storageWarning) return;
  storageWarning = value;
  storageListeners.forEach((listener) => listener());
}

function refreshStorage() {
  storageSeq += 1;
  const seq = storageSeq;
  getStorageEstimate()
    .then((estimate) => {
      if (seq === storageSeq) {
        setStorageWarning(Boolean(estimate && estimate.quota > 0 && estimate.usage >= 0.8 * estimate.quota));
      }
    })
    .catch(() => {
      if (seq === storageSeq) setStorageWarning(false);
    });
}

function subscribeStorage(listener) {
  storageListeners.add(listener);
  return () => {
    storageListeners.delete(listener);
    if (storageListeners.size === 0) {
      // Không còn thẻ nào: bỏ qua estimate đang chờ và quên cảnh báo cũ
      storageSeq += 1;
      storageWarning = false;
    }
  };
}

const getStorageWarning = () => storageWarning;

export default function OfflineTrackControl({ track }) {
  const isOnline = useOnlineStatus();
  const supported = isOfflineSupported();
  const audioUrl = track?.audioUrl;
  const title = track?.title || 'bản âm thanh';

  const subscribe = useCallback((listener) => subscribeUrl(audioUrl, listener), [audioUrl]);
  const getSnapshot = useCallback(() => snapshotOf(audioUrl), [audioUrl]);
  const view = useSyncExternalStore(subscribe, getSnapshot);
  const storageWarningOn = useSyncExternalStore(subscribeStorage, getStorageWarning);

  useEffect(() => {
    if (!audioUrl || !supported) return;
    refreshCached(audioUrl);
    refreshStorage();
  }, [audioUrl, supported]);

  // Trạng thái 7: Bài tổng hợp Web Audio không có audioUrl
  if (!audioUrl) {
    return (
      <div
        className="py-2 px-3 text-center text-xs font-medium text-theme-muted rounded-2xl bg-theme-page border border-theme-line"
        role="note"
      >
        Bài này nghe được cả khi không có mạng, không cần tải
      </div>
    );
  }

  // Trạng thái 6: Trình duyệt không hỗ trợ Service Worker / Cache API
  if (!supported) {
    return (
      <div
        className="py-2 px-3 text-center text-xs font-medium text-theme-muted rounded-2xl bg-theme-page border border-theme-line"
        role="note"
      >
        Trình duyệt này chưa hỗ trợ nghe offline
      </div>
    );
  }

  const isDownloading = view.busy === 'download';
  const isDeleting = view.busy === 'remove';
  const { cached: isCached, error: errorMessage } = view;

  const handleDownload = () => {
    if (!isOnline) {
      toast.error('Cần có mạng để tải bài này.');
      return;
    }
    runDownload(audioUrl, title);
  };

  const handleRemove = () => {
    runRemove(audioUrl, title);
  };

  return (
    <div className="space-y-2">
      {/* Cảnh báo dung lượng bộ nhớ */}
      {storageWarningOn && (
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-status-warn-line bg-status-warn-bg text-status-warn-text text-xs font-semibold"
          role="alert"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Bộ nhớ trình duyệt sắp đầy</span>
        </div>
      )}

      {/* Trạng thái 2: Đang tải */}
      {isDownloading && (
        <button
          type="button"
          disabled
          aria-busy="true"
          className="w-full min-h-[44px] rounded-2xl px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 border border-theme-line bg-theme-page text-theme-muted cursor-not-allowed"
        >
          <Loader2
            className="w-4 h-4 shrink-0 animate-spin motion-reduce:animate-none text-theme-brand"
            aria-hidden="true"
          />
          <span role="status" aria-live="polite">
            Đang tải để nghe offline...
          </span>
        </button>
      )}

      {/* Trạng thái 4: Lỗi */}
      {!isDownloading && errorMessage && (
        <div className="space-y-1.5" role="alert">
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-2xl border border-status-warn-line bg-status-warn-bg text-status-warn-text">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!isOnline}
            aria-label={`Thử tải lại bài ${title}`}
            className="w-full min-h-[44px] rounded-2xl px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 border border-theme-line bg-theme-surface hover:bg-theme-sidebar text-theme-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand disabled:cursor-not-allowed disabled:bg-theme-page disabled:text-theme-muted"
          >
            <RotateCcw className="w-4 h-4 shrink-0 text-theme-brand" aria-hidden="true" />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {/* Trạng thái 3: Đã tải (kể cả lúc đang xóa) */}
      {!isDownloading && !errorMessage && isCached && (
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-theme-page border border-theme-line">
          <div
            className="flex items-center gap-1.5 text-xs font-bold text-theme-ink px-2"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-status-ok" aria-hidden="true" />
            <span>Đã lưu trên máy này</span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isDeleting}
            aria-label={`Xóa bản lưu ${title}`}
            className="min-h-[44px] px-3 py-1.5 rounded-2xl text-xs font-semibold text-theme-ink hover:bg-theme-sidebar transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand disabled:cursor-not-allowed disabled:text-theme-muted"
          >
            {isDeleting ? (
              <Loader2
                className="w-3.5 h-3.5 shrink-0 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <Trash2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            )}
            <span>{isDeleting ? 'Đang xóa...' : 'Xóa bản tải'}</span>
          </button>
        </div>
      )}

      {/* Trạng thái 5: Đang offline và chưa tải */}
      {!isDownloading && !errorMessage && !isCached && !isOnline && (
        <button
          type="button"
          disabled
          aria-label="Cần có mạng để tải bài này"
          className="w-full min-h-[44px] rounded-2xl px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 border border-theme-line bg-theme-page text-theme-muted cursor-not-allowed"
        >
          <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span role="status">Cần có mạng để tải</span>
        </button>
      )}

      {/* Trạng thái 1: Chưa tải và đang online */}
      {!isDownloading && !errorMessage && !isCached && isOnline && (
        <button
          type="button"
          onClick={handleDownload}
          aria-label={`Tải bài ${title} để nghe offline`}
          className="w-full min-h-[44px] rounded-2xl px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 border border-theme-line bg-theme-surface hover:bg-theme-sidebar text-theme-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
        >
          <Download className="w-4 h-4 shrink-0 text-theme-brand" aria-hidden="true" />
          <span>Tải để nghe offline</span>
        </button>
      )}
    </div>
  );
}
