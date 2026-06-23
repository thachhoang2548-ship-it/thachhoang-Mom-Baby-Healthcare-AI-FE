import React, { useEffect, useState, useRef } from "react";
import { useAuthController } from "../../controllers/authController";
import ChatHeader from "../components/Chat/ChatHeader";
import ChatMessage from "../components/Chat/ChatMessage";
import ChatInput from "../components/Chat/ChatInput";
import QuickActions from "../components/Chat/QuickAction";
import { useChatController } from "../../controllers/chatController";
import "../styles/ChatPageBackground.css";

export default function ChatPage() {
  const { user } = useAuthController();
  const { messages, sessionId, fetchHistory, sendMessage, clearChat } = useChatController();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSuccess, setRecordingSuccess] = useState(false);
  const [audioAnalysisResult, setAudioAnalysisResult] = useState("");
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, [sessionId, fetchHistory]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  const handleSend = (text) => {
    sendMessage(text);
  };

  const handleClear = () => clearChat();

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording and show mock transcription/analysis
      setIsRecording(false);
      setRecordingSuccess(true);
      setAudioAnalysisResult(
        "Nhật ký: 'Hôm nay bé ngủ ngoan hơn, mình cũng đỡ mệt hơn nhưng thỉnh thoảng vẫn lo lắng vặt.'\n\nAI Đánh giá tâm trạng: Tích cực, không phát hiện dấu hiệu trầm cảm sau sinh (PPD)."
      );
    } else {
      setIsRecording(true);
      setRecordingSuccess(false);
      setAudioAnalysisResult("");
    }
  };

  const isVip = user?.subscriptionTier === "vip";

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-190px)] lg:h-[calc(100vh-150px)] max-w-7xl mx-auto bg-gray-50 dark:bg-background-dark font-display rounded-3xl overflow-hidden border border-white/60 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      
      {/* Column 1: AI Chat Assistant */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <ChatHeader onClear={handleClear} />
        
        <main ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative">
          <div className="bubbles pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bubble"
                style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s` }}
              />
            ))}
          </div>

          {messages.length === 0 && (
            <div className="text-center py-10 max-w-md mx-auto">
              <div className="w-16 h-16 bg-pink-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">smart_toy</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Trợ lý AI Mom Ơi!</h3>
              <p className="text-sm text-gray-500 mt-1">
                Hãy hỏi em bất cứ điều gì về dinh dưỡng cho mẹ, sự phát triển của bé, hoặc tâm sự cùng em những lúc mệt mỏi nhé.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
        </main>
        
        <QuickActions onAction={handleSend} />
        <footer className="p-4 bg-white dark:bg-gray-900 border-t border-gray-150 dark:border-gray-800 shrink-0">
          <ChatInput onSend={handleSend} />
        </footer>
      </div>

      {/* Column 2: VIP Audio Journal & PPD detection */}
      <div className="w-full lg:w-96 bg-gradient-to-br from-pink-50/50 to-orange-50/50 dark:from-pink-950/10 dark:to-orange-950/10 p-6 flex flex-col justify-between border-t lg:border-t-0 border-gray-200 dark:border-gray-800 shrink-0">
        <div className="relative h-full flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">mic</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Nhật Ký Giọng Nói AI</h2>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            Mẹ chỉ cần nói ra những suy nghĩ của mình. AI sẽ phân tích âm sắc giọng nói để đưa ra chẩn đoán sớm và dự phòng trầm cảm sau sinh (PPD).
          </p>

          {isVip ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <button
                onClick={toggleRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  isRecording 
                    ? "bg-red-500 text-white animate-pulse scale-105" 
                    : "bg-primary text-white hover:bg-pink-600"
                }`}
              >
                <span className="material-symbols-outlined text-4xl">
                  {isRecording ? "stop" : "mic"}
                </span>
              </button>
              
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {isRecording ? "Đang lắng nghe mẹ tâm sự..." : "Ấn để bắt đầu ghi âm"}
                </p>
                {isRecording && (
                  <div className="flex space-x-1 justify-center mt-2">
                    <span className="w-1.5 h-4 bg-red-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-6 bg-red-500 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-3 bg-red-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                )}
              </div>

              {recordingSuccess && (
                <div className="w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-pink-100 dark:border-pink-900/30 text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {audioAnalysisResult}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center relative p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10">
                <span className="material-symbols-outlined text-4xl text-yellow-500 mb-3 animate-bounce">lock</span>
                <h3 className="text-sm font-extrabold text-gray-800 dark:text-gray-100">Tính năng VIP</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 max-w-[200px] leading-relaxed">
                  Nâng cấp lên gói <strong>Super Mom VIP</strong> để mở khóa Nhật ký tâm tình giọng nói & nhận cảnh báo sớm trầm cảm sản phụ.
                </p>
                <button className="mt-4 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-md hover:from-yellow-600 hover:to-orange-600 transition-all">
                  Nâng cấp VIP ngay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
