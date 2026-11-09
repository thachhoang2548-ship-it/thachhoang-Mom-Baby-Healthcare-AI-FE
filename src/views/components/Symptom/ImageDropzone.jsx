import React, { useState, useRef } from "react";
import { Upload, X, FileImage } from "lucide-react";
import toast from "react-hot-toast";

export default function ImageDropzone({ value, onChange, onRemove }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const validateAndProcessFile = (file) => {
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận các định dạng PNG, JPG, JPEG hoặc WEBP.");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Kích thước tệp vượt quá 10MB. Vui lòng tải lên ảnh nhẹ hơn.");
      return;
    }

    onChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full font-display">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {!value ? (
        <button
          type="button"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`flex min-h-[152px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
            isDragOver
              ? "border-theme-brand bg-theme-brand-soft/60"
              : "border-theme-line bg-theme-page/50 hover:border-theme-brand/50 hover:bg-theme-surface"
          }`}
        >
          <span className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-theme-surface border border-theme-line text-theme-brand">
            <Upload className="h-5 w-5" />
          </span>
          <p className="text-sm font-bold text-theme-ink">
            <span className="text-theme-brand underline">Chọn ảnh từ thiết bị</span> hoặc kéo thả vào đây
          </p>
          <p className="mt-1 text-xs font-medium text-theme-muted">
            Hỗ trợ PNG, JPG, WEBP · Tối đa 10MB
          </p>
        </button>
      ) : (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-theme-line bg-theme-page/60 p-4">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-theme-line bg-theme-surface">
              <img
                src={value.previewUrl}
                alt="Ảnh triệu chứng đã chọn"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden">
              <p className="flex max-w-[200px] items-center gap-1.5 truncate text-sm font-bold text-theme-ink sm:max-w-xs">
                <FileImage className="h-4 w-4 shrink-0 text-theme-brand" />
                <span className="truncate">{value.file.name}</span>
              </p>
              <p className="mt-0.5 text-xs font-medium text-theme-muted">
                Dung lượng: {formatFileSize(value.file.size)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Xóa hình ảnh"
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-theme-line bg-theme-surface text-theme-ink hover:bg-status-danger-bg hover:text-status-danger-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
