import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatMessage({ message }) {
  const isUser = message.sender === "user";

  return (
    <div className={`flex items-end gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div
          className="w-10 h-10 shrink-0 rounded-full bg-center bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuC-9nTDg9ztznhzElafcvGQEPopF1rUsD32P6Vvao2nfj8k66zZ8KYSPukaqRYVAE1Q-nH_XPqMRyKbuIlvSOpM3Gbt6mfEH2fKSk3zrZXqNWcG9VTRO7eSLcaj8p0JB_ffV2JgMeiZVCccyZjGIAWCc9J9Lr-plYy6UAXQrQ-GK9wojXw_j8mhLX0pbtUcrQ1DoO0aUrXXXj541R_D62sA0OLDbBTH_5mlXJkMaI8xeEJNK7mA5MpwSZ3hhMBBhOwkrhI8JYWFqSlU")`,
          }}
        />
      )}
      <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div 
          className={`relative px-4 py-2 shadow-sm max-w-[85%] sm:max-w-md break-words text-sm leading-relaxed ${
            isUser 
              ? "bg-[#d9fdd3] text-gray-900 rounded-l-lg rounded-tr-lg rounded-br-none" 
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-r-lg rounded-tl-lg rounded-bl-none border border-gray-100 dark:border-gray-700"
          }`}
        >
          {isUser ? (
            message.text
          ) : (
            <div className="markdown-content space-y-2">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-4 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="pl-1" {...props} />,
                  h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-2 mb-1" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-1" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-gray-100" {...props} />,
                  p: ({node, ...props}) => <p className="leading-relaxed mb-1" {...props} />,
                  code: ({node, inline, className, children, ...props}) => (
                    <code className={`${inline ? "bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs" : "block bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-x-auto"}`} {...props}>
                      {children}
                    </code>
                  ),
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          )}
          <span className={`block text-[10px] mt-1 text-right ${isUser ? "text-gray-500" : "text-gray-400"}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </div>
  );
}
