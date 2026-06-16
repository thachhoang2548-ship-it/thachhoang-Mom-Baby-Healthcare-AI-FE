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

    // Type validation
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận các định dạng PNG, JPG, JPEG, WEBP hoặc AVIF.");
      return;
    }

    // Size validation (10MB)
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
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/avif"
        className="hidden"
      />

      {!value ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[160px] ${
            isDragOver
              ? "border-amber-400 bg-amber-50"
              : "border-gray-300 hover:border-amber-400 bg-white"
          }`}
        >
          <Upload className={`w-8 h-8 mb-2 transition-colors ${isDragOver ? "text-amber-500" : "text-gray-400"}`} />
          <p className="text-sm font-bold text-gray-700">
            <span className="text-amber-500">Tải lên tệp</span> hoặc kéo và thả
          </p>
          <p className="text-xs text-gray-400 mt-1.5 font-medium">
            PNG, JPG, WEBP, AVIF tối đa 10MB
          </p>
        </div>
      ) : (
        /* Image Preview Box */
        <div className="bg-gray-50 border border-gray-200/50 rounded-2xl p-4 flex items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-14 h-14 bg-white border border-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
              <img
                src={value.previewUrl}
                alt="Symptom preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-gray-800 truncate max-w-[180px] sm:max-w-xs flex items-center gap-1.5">
                <FileImage className="w-3.5 h-3.5 text-amber-500" />
                {value.file.name}
              </p>
              <p className="text-[10px] font-semibold text-gray-400 mt-1">
                Kích thước: {formatFileSize(value.file.size)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all flex-shrink-0"
            title="Xóa hình ảnh"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
