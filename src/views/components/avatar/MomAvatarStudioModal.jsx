import React, { useEffect, useId, useRef, useState } from 'react';
import {
  Check,
  Gem,
  Glasses,
  Palette,
  RotateCcw,
  Scissors,
  Shuffle,
  X,
} from 'lucide-react';
import MomAvatar from './MomAvatar';
import {
  ACCESSORY_OPTIONS,
  EARRINGS_OPTIONS,
  EXPRESSION_OPTIONS,
  getAvatarSummaryText,
  HAIR_COLORS,
  HAIR_STYLES,
  NECKLACE_OPTIONS,
  OUTFIT_STYLES,
  OUTFIT_TONES,
  SKIN_TONES,
} from '../../../hooks/useMomAvatar';

const TABS = [
  { id: 'jewelry', label: 'Trang sức', icon: Gem },
  { id: 'hair', label: 'Kiểu tóc', icon: Scissors },
  { id: 'accessory', label: 'Phụ kiện', icon: Glasses },
  { id: 'style', label: 'Trang phục', icon: Palette },
];

function OptionButton({ selected, onClick, label, swatchColor = null }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-[46px] items-center justify-between gap-2.5 rounded-2xl border px-3.5 py-2.5 text-left text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:text-sm ${
        selected
          ? 'border-theme-brand bg-theme-brand-soft font-bold text-theme-ink shadow-sm'
          : 'border-theme-line bg-theme-page text-theme-ink hover:border-theme-brand/45 hover:bg-theme-sidebar'
      }`}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        {swatchColor && (
          <span
            className="h-4 w-4 shrink-0 rounded-full border border-theme-line shadow-sm"
            style={{ backgroundColor: swatchColor }}
            aria-hidden="true"
          />
        )}
        <span className="leading-snug">{label}</span>
      </span>
      {selected && (
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-theme-brand text-theme-surface"
          aria-hidden="true"
        >
          <Check className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}

export default function MomAvatarStudioModal({
  open,
  onClose,
  avatar,
  mood = '',
  onUpdate,
  onReset,
  onRandomize,
}) {
  const [activeTab, setActiveTab] = useState('jewelry');
  const titleId = useId();
  const panelId = useId();
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const tabRefs = useRef([]);

  useEffect(() => {
    if (!open) return undefined;

    const previousFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.requestAnimationFrame(() => {
      closeBtnRef.current?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      if (previousFocused && typeof previousFocused.focus === 'function') {
        previousFocused.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleTabKeyDown = (event, index) => {
    let nextIdx = null;
    if (event.key === 'ArrowRight') nextIdx = (index + 1) % TABS.length;
    else if (event.key === 'ArrowLeft') nextIdx = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === 'Home') nextIdx = 0;
    else if (event.key === 'End') nextIdx = TABS.length - 1;

    if (nextIdx !== null) {
      event.preventDefault();
      setActiveTab(TABS[nextIdx].id);
      tabRefs.current[nextIdx]?.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-theme-line bg-theme-surface font-display text-theme-ink shadow-xl sm:rounded-3xl"
      >
        {/* Thanh tiêu đề hộp thoại */}
        <div className="flex items-center justify-between gap-3 border-b border-theme-line px-5 py-4 sm:px-6">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-theme-ink sm:text-xl">
              Tủ trang sức &amp; diện mạo của mẹ
            </h2>
            <p className="mt-0.5 text-xs font-medium text-theme-muted sm:text-sm">
              Phối trang sức, kiểu tóc và phụ kiện yêu thích cho góc đồng hành riêng của mẹ
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại tùy chỉnh nhân vật"
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-theme-line bg-theme-page text-theme-ink transition-colors hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Nội dung chính: Xem trước trực tiếp + Bảng chọn phân mục */}
        <div className="grid flex-1 grid-cols-1 overflow-y-auto md:grid-cols-12">
          {/* Cột xem trước trực tiếp */}
          <div className="flex flex-col items-center justify-between gap-4 border-b border-theme-line bg-theme-page p-5 md:col-span-5 md:border-b-0 md:border-r sm:p-6">
            <div className="w-full max-w-[210px] overflow-hidden rounded-3xl border border-theme-line bg-theme-surface shadow-sm">
              <MomAvatar
                config={avatar}
                mood={mood}
                variant="scene"
                className="aspect-square w-full"
                label="Xem trước nhân vật của mẹ"
              />
            </div>

            <div className="w-full space-y-3 text-center">
              <p className="rounded-2xl border border-theme-line bg-theme-surface px-3.5 py-2 text-xs font-semibold text-theme-ink">
                {getAvatarSummaryText(avatar)}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onRandomize}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-theme-line bg-theme-surface px-3.5 py-2 text-xs font-bold text-theme-ink transition-colors hover:border-theme-brand/45 hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                >
                  <Shuffle className="h-3.5 w-3.5 text-theme-brand" aria-hidden="true" />
                  <span>Phối ngẫu nhiên</span>
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-theme-line bg-theme-surface px-3.5 py-2 text-xs font-semibold text-theme-muted transition-colors hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Mặc định</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cột lựa chọn chi tiết */}
          <div className="flex flex-col justify-between p-5 md:col-span-7 sm:p-6">
            <div className="space-y-5">
              {/* Thanh chuyển nhóm tùy chỉnh */}
              <div
                role="tablist"
                aria-label="Nhóm tùy chỉnh nhân vật"
                className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              >
                {TABS.map((tab, idx) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      ref={(el) => {
                        tabRefs.current[idx] = el;
                      }}
                      type="button"
                      role="tab"
                      id={`${panelId}-tab-${tab.id}`}
                      aria-selected={active}
                      aria-controls={`${panelId}-panel-${tab.id}`}
                      tabIndex={active ? 0 : -1}
                      onClick={() => setActiveTab(tab.id)}
                      onKeyDown={(e) => handleTabKeyDown(e, idx)}
                      className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                        active
                          ? 'border-theme-brand bg-theme-brand text-theme-surface shadow-sm'
                          : 'border-theme-line bg-theme-page text-theme-ink hover:bg-theme-sidebar'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Nội dung từng nhóm */}
              <div
                role="tabpanel"
                id={`${panelId}-panel-${activeTab}`}
                aria-labelledby={`${panelId}-tab-${activeTab}`}
                className="space-y-5"
              >
                {activeTab === 'jewelry' && (
                  <>
                    <div className="space-y-2.5">
                      <p className="text-xs font-bold text-theme-muted sm:text-sm">
                        Khuyên tai
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {EARRINGS_OPTIONS.map((item) => (
                          <OptionButton
                            key={item.id}
                            selected={avatar.earrings === item.id}
                            label={item.label}
                            onClick={() => onUpdate({ earrings: item.id })}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-xs font-bold text-theme-muted sm:text-sm">
                        Dây chuyền
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {NECKLACE_OPTIONS.map((item) => (
                          <OptionButton
                            key={item.id}
                            selected={avatar.necklace === item.id}
                            label={item.label}
                            onClick={() => onUpdate({ necklace: item.id })}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'hair' && (
                  <>
                    <div className="space-y-2.5">
                      <p className="text-xs font-bold text-theme-muted sm:text-sm">
                        Kiểu tóc của mẹ
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {HAIR_STYLES.map((item) => (
                          <OptionButton
                            key={item.id}
                            selected={avatar.hairStyle === item.id}
                            label={item.label}
                            onClick={() => onUpdate({ hairStyle: item.id })}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-xs font-bold text-theme-muted sm:text-sm">
                        Màu tóc
                      </p>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        {HAIR_COLORS.map((item) => (
                          <OptionButton
                            key={item.id}
                            selected={avatar.hairColor === item.id}
                            label={item.label}
                            swatchColor={item.swatch}
                            onClick={() => onUpdate({ hairColor: item.id })}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'accessory' && (
                  <div className="space-y-2.5">
                    <p className="text-xs font-bold text-theme-muted sm:text-sm">
                      Kẹp tóc, băng đô &amp; kính mắt
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {ACCESSORY_OPTIONS.map((item) => (
                        <OptionButton
                          key={item.id}
                          selected={avatar.accessory === item.id}
                          label={item.label}
                          onClick={() => onUpdate({ accessory: item.id })}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'style' && (
                  <>
                    <div className="space-y-2.5">
                      <p className="text-xs font-bold text-theme-muted sm:text-sm">
                        Kiểu trang phục
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {OUTFIT_STYLES.map((item) => (
                          <OptionButton
                            key={item.id}
                            selected={avatar.outfit === item.id}
                            label={item.label}
                            onClick={() => onUpdate({ outfit: item.id })}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-xs font-bold text-theme-muted sm:text-sm">
                        Tông màu trang phục
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {OUTFIT_TONES.map((item) => (
                          <OptionButton
                            key={item.id}
                            selected={avatar.outfitTone === item.id}
                            label={item.label}
                            swatchColor={item.fill}
                            onClick={() => onUpdate({ outfitTone: item.id })}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-xs font-bold text-theme-muted sm:text-sm">
                        Sắc độ làn da
                      </p>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        {SKIN_TONES.map((item) => (
                          <OptionButton
                            key={item.id}
                            selected={avatar.skinTone === item.id}
                            label={item.label}
                            swatchColor={item.base}
                            onClick={() => onUpdate({ skinTone: item.id })}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-xs font-bold text-theme-muted sm:text-sm">
                        Sắc thái nét mặt
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {EXPRESSION_OPTIONS.map((item) => (
                          <OptionButton
                            key={item.id}
                            selected={avatar.expression === item.id}
                            label={item.label}
                            onClick={() => onUpdate({ expression: item.id })}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Chân hộp thoại */}
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-theme-line pt-4">
              <span className="text-xs font-medium text-theme-muted">
                Tự động lưu cho tài khoản của mẹ
              </span>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-theme-brand px-6 py-2.5 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
