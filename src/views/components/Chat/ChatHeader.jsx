import React from "react";

export default function ChatHeader({ onClear }) {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center size-10 bg-primary/20 rounded-full text-primary">
          <span className="material-symbols-outlined text-2xl">health_and_safety</span>
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight tracking-[-0.015em] text-[#181511] dark:text-white">
            Trợ lý Sức khỏe AI
          </h1>
          <div className="flex items-center gap-1.5">
            <span className="size-2 bg-green-500 rounded-full"></span>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Trực tuyến</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onClear}
          className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-primary text-[#181511] text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity"
        >
          <span className="truncate">Xóa trò chuyện</span>
        </button>
      </div>
    </header>
  );
}
