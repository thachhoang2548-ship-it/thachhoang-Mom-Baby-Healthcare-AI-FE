import React, { useState } from "react";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <button className="hidden sm:flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>
      <input
        type="text"
        className="flex-1 min-w-0 bg-gray-100 border-transparent focus:border-primary focus:ring-primary rounded-full px-4 py-2.5 text-sm placeholder:text-gray-500"
        placeholder="Nhập câu hỏi sức khỏe của bạn..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button className="hidden sm:flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
        <span className="material-symbols-outlined text-2xl">mic</span>
      </button>
      <button
        onClick={handleSend}
        className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-[#181511] hover:opacity-90 transition-opacity shadow-sm"
      >
        <span className="material-symbols-outlined text-2xl">send</span>
      </button>
    </div>
  );
}
