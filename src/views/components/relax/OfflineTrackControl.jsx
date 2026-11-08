import React, { useCallback, useEffect, useRef, useState } from 'react';
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

const INITIAL = { cached: false, busy: null, error: null };

export default function OfflineTrackControl({ track }) {
  const isOnline = useOnlineStatus();
  const supported = isOfflineSupported();
  const audioUrl = track?.audioUrl;
  const title = track?.title || 'bản âm thanh';

  // Trạng thái gắn với đúng URL: đổi bài thì tự về trạng thái ban đầu, không giữ kết quả của bài cũ
  const [store, setStore] = useState({ url: audioUrl, ...INITIAL });
  const view = store.url === audioUrl ? store : { url: audioUrl, ...INITIAL };
  const [storageWarning, setStorageWarning] = useState(false);

  const mountedRef = useRef(true);
  const urlRef = useRef(audioUrl);
  // Số thứ tự lượt: tăng khi đổi URL và mỗi lần mẹ bấm tải/xóa; kết quả của lượt cũ bị bỏ qua
  const genRef = useRef(0);

  const patch = useCallback(
    (url, p) => setStore((prev) => ({ ...(prev.url === url ? prev : { url, ...INITIAL }), ...p })),
    []
  );

  // Kết quả chỉ áp dụng khi còn đúng trang, đúng URL và đúng lượt
  const isCurrent = useCallback(
    (url, gen) => mountedRef.current && urlRef.current === url && genRef.current === gen,
    []
  );

  // Dung lượng chỉ là thông tin phụ: lỗi hoặc không có dữ liệu thì không cảnh báo, không ảnh hưởng kết quả tải/xóa
  const refreshStorage = useCallback(() => {
    getStorageEstimate()
      .then((estimate) => {
        if (!mountedRef.current) return;
        setStorageWarning(Boolean(estimate && estimate.quota > 0 && estimate.usage >= 0.8 * estimate.quota));
      })
      .catch(() => {
        if (mountedRef.current) setStorageWarning(false);
      });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    urlRef.current = audioUrl;
    genRef.current += 1;
    const gen = genRef.current;
    const url = audioUrl;

    if (!url || !supported) return undefined;

    isAudioCached(url)
      .then((cached) => {
        if (isCurrent(url, gen)) patch(url, { cached: Boolean(cached) });
      })
      .catch(() => {
        if (isCurrent(url, gen)) patch(url, { cached: false });
      });

    refreshStorage();

    return () => {
      // Đổi bài hoặc rời trang: vô hiệu mọi kết quả đang chờ của URL này
      genRef.current += 1;
    };
  }, [audioUrl, supported, isCurrent, patch, refreshStorage]);

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

  const handleDownload = async () => {
    const url = audioUrl;
    if (!isOnline) {
      toast.error('Cần có mạng để tải bài này.');
      return;
    }

    genRef.current += 1;
    const gen = genRef.current;
    patch(url, { busy: 'download', error: null });

    try {
      await cacheAudio(url);
    } catch {
      if (isCurrent(url, gen)) {
        patch(url, { busy: null, error: 'Chưa tải được, kiểm tra kết nối rồi thử lại' });
        toast.error('Không tải được bản âm thanh.');
      }
      return;
    }

    if (!isCurrent(url, gen)) return;
    patch(url, { busy: null, cached: true, error: null });
    toast.success(`Đã lưu "${title}" để nghe offline.`);
    refreshStorage();
  };

  const handleRemove = async () => {
    const url = audioUrl;

    genRef.current += 1;
    const gen = genRef.current;
    patch(url, { busy: 'remove' });

    try {
      await removeAudio(url);
    } catch {
      if (isCurrent(url, gen)) {
        patch(url, { busy: null });
        toast.error('Không xóa được bản lưu.');
      }
      return;
    }

    if (!isCurrent(url, gen)) return;
    patch(url, { busy: null, cached: false, error: null });
    toast.success(`Đã xóa bản lưu "${title}".`);
    refreshStorage();
  };

  return (
    <div className="space-y-2">
      {/* Cảnh báo dung lượng bộ nhớ */}
      {storageWarning && (
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

      {/* Trạng thái 3: Đã tải */}
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
