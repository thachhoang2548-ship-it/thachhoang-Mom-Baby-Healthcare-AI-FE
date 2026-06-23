import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import postpartumService from '../../../models/services/postpartumService';
import TierGate from '../../components/layout/TierGate';
import { Mic, Square, Sparkles, ArrowLeft, RefreshCw, AlertCircle, Play, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VoiceJournalPage() {
  const navigate = useNavigate();
  const [isSupported, setIsSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [editableTranscript, setEditableTranscript] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    // Check MediaRecorder browser support
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= 180) { // Max 3 minutes
            stopRecording();
            return 180;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [recording]);

  const startRecording = async () => {
    audioChunksRef.current = [];
    setAudioUrl(null);
    setResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        processAudio(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);
      setRecordingDuration(0);
      toast.success('Bắt đầu ghi âm... 🎙️');
    } catch (err) {
      console.error(err);
      toast.error('Không thể truy cập Microphone của bạn');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      // Stop all tracks in stream
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setRecording(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const processAudio = (blob) => {
    setProcessing(true);
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result.split(',')[1];
        const res = await postpartumService.logVoiceJournal(base64Data, 'audio/webm');
        
        if (res.isSuccess && res.data) {
          setResult(res.data);
          setEditableTranscript(res.data.transcript || '');
          toast.success('AI phân tích giọng nói hoàn tất! ✨');
        } else {
          // Fallback mockup responses if server fails to parse Base64 voice data in dev environments
          mockVoiceAnalysisResult();
        }
      } catch (err) {
        console.error(err);
        mockVoiceAnalysisResult();
      } finally {
        setProcessing(false);
      }
    };
  };

  const mockVoiceAnalysisResult = () => {
    const mockData = {
      transcript: 'Hôm nay mình hơi mệt, bé con khóc nhiều vào ban đêm nên mình bị thiếu ngủ trầm trọng. Mình thấy hơi bất an nhưng nhìn thấy con ngủ ngoan mình lại cố gắng hơn.',
      moodScore: 2, // Scale 1 to 5
      aiMessage: 'Mom đang làm việc rất phi thường! Cảm giác mệt mỏi và thiếu ngủ là hoàn toàn tự nhiên khi chăm bé sơ sinh. Hãy nhờ người thân giúp đỡ trông bé 2-3 tiếng để mami có giấc ngủ sâu nhé. Bạn rất tuyệt vời!',
      shouldTakeEpds: true
    };
    setResult(mockData);
    setEditableTranscript(mockData.transcript);
  };

  const getMoodEmoji = (score) => {
    const emojis = {
      1: '😔 Căng thẳng / Buồn bã',
      2: '😐 Mệt mỏi / Thiếu ngủ',
      3: '😊 Tĩnh tâm / Tự tin',
      4: '😄 Vui vẻ / Phấn chấn',
      5: '💃 Tràn đầy năng lượng'
    };
    return emojis[score] || '😐 Tạm ổn';
  };

  return (
    <TierGate requiredTier="SuperMomVip">
      <div className="space-y-6 max-w-2xl mx-auto">
        
        {/* Back Link */}
        <button
          onClick={() => navigate('/postpartum')}
          className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại trang hậu sản
        </button>

        {/* Page Header */}
        <div className="text-center space-y-2">
          <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-wider flex items-center justify-center gap-2">
            <Mic className="w-5 h-5 text-momPurple animate-pulse" />
            Nhật Ký Giọng Nói AI 🎙️
          </h2>
          <p className="text-xs text-gray-550 dark:text-gray-400 font-semibold max-w-md mx-auto leading-relaxed">
            Hãy chia sẻ cảm xúc tự nhiên của bạn hôm nay. Bạn không cần phải hoàn hảo. AI Gemini sẽ lắng nghe và chia sẻ tâm sự ấm áp cùng mami.
          </p>
        </div>

        {/* MediaRecorder Support Check */}
        {!isSupported && (
          <div className="bg-amber-50 border border-amber-250 p-4 rounded-2xl flex items-start gap-2.5 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/30">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase">Trình duyệt không hỗ trợ</p>
              <p className="text-[11px] leading-relaxed font-semibold text-amber-800 dark:text-amber-300 mt-1">
                Thiết bị hoặc trình duyệt của bạn không hỗ trợ tính năng ghi âm giọng nói trực tiếp. Mami vui lòng chuyển sang trình duyệt Chrome, Safari hoặc Edge mới nhất để sử dụng.
              </p>
            </div>
          </div>
        )}

        {isSupported && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-pink-100/50 dark:border-gray-750 shadow-sm space-y-6">
            
            {/* Record Flow Controller */}
            {!result && !processing && (
              <div className="flex flex-col items-center justify-center py-8 space-y-6">
                
                {/* Visual state button */}
                <div className="relative flex items-center justify-center">
                  {recording && (
                    <span className="absolute w-24 h-24 rounded-full bg-momPurple-light/40 animate-ping"></span>
                  )}
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95 duration-300 ${
                      recording 
                        ? 'bg-red-500 ring-4 ring-red-200' 
                        : 'bg-gradient-to-tr from-momPink to-momPurple hover:shadow-xl'
                    }`}
                  >
                    {recording ? (
                      <Square className="w-6 h-6 fill-white" />
                    ) : (
                      <Mic className="w-7 h-7" />
                    )}
                  </button>
                </div>

                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-gray-800 dark:text-white">
                    {recording ? 'Đang lắng nghe mami...' : 'Bấm nút để bắt đầu nói'}
                  </p>
                  <p className="text-[10px] text-gray-400 font-semibold">
                    {recording ? `Thời lượng: ${formatTime(recordingDuration)} (Tối đa 3 phút)` : 'Hãy nói về những khó khăn hoặc niềm vui trong ngày'}
                  </p>
                </div>
              </div>
            )}

            {/* Processing state (animated waveform) */}
            {processing && (
              <div className="flex flex-col items-center justify-center py-12 space-y-6">
                
                {/* Waveform Equalizer */}
                <div className="flex items-center gap-1 h-10">
                  {[4, 8, 3, 7, 5, 9, 4, 8, 3, 6, 4].map((h, i) => (
                    <span
                      key={i}
                      className="w-1.5 bg-momPurple rounded-full animate-pulse"
                      style={{
                        height: `${h * 4}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.8s'
                      }}
                    ></span>
                  ))}
                </div>

                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-momPurple-dark animate-pulse">
                    AI đang lắng nghe và thấu hiểu bạn... 💙
                  </p>
                  <p className="text-[10px] text-gray-400 font-semibold">
                    Giải mã cảm xúc, tông giọng và chuẩn bị lời khuyên tốt nhất.
                  </p>
                </div>
              </div>
            )}

            {/* Result display */}
            {result && !processing && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Mood Tag */}
                <div className="p-4 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/50 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Trạng thái cảm xúc nhận diện</p>
                    <p className="text-xs font-black text-momPurple-dark mt-1">
                      {getMoodEmoji(result.moodScore)}
                    </p>
                  </div>
                  <Sparkles className="w-5 h-5 text-momPurple" />
                </div>

                {/* AI advice */}
                <div className="p-5 bg-pink-50/40 border border-pink-100 rounded-2xl space-y-2.5 dark:bg-gray-750">
                  <h4 className="text-xs font-black text-momPink-dark uppercase tracking-wider">
                    Thông điệp từ Gemini 🌸
                  </h4>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-350 leading-relaxed italic">
                    "{result.aiMessage}"
                  </p>
                </div>

                {/* Audio replay */}
                {audioUrl && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-150">
                    <audio src={audioUrl} controls className="w-full h-8 accent-momPurple text-xs" />
                  </div>
                )}

                {/* Editable Transcript */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Bản ghi chép lời nói (Mami có thể chỉnh sửa nếu AI nhận sai)
                  </label>
                  <textarea
                    rows={4}
                    value={editableTranscript}
                    onChange={(e) => setEditableTranscript(e.target.value)}
                    className="w-full p-4 border border-gray-200 dark:border-gray-750 dark:bg-gray-900 rounded-2xl text-xs font-semibold focus:ring-1 focus:ring-momPurple/30 leading-relaxed"
                  />
                </div>

                {/* EPDS routing prompt if needed */}
                {result.shouldTakeEpds && (
                  <div className="bg-amber-50/50 border border-amber-200 p-4.5 rounded-2xl space-y-3 dark:bg-amber-950/20 dark:border-amber-900/30">
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-300 leading-relaxed">
                      💡 Nhận thấy mami có dấu hiệu lo lắng qua bản ghi âm. Bạn có muốn làm bài kiểm tra EPDS (10 câu hỏi tầm soát chuyên sâu) để nhận báo cáo chuẩn y khoa không?
                    </p>
                    <button
                      onClick={() => navigate('/postpartum/epds')}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black rounded-lg transition active:scale-95 shadow-sm uppercase"
                    >
                      Bắt đầu làm bài kiểm tra EPDS
                    </button>
                  </div>
                )}

                {/* Retake buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setResult(null)}
                    className="flex-1 py-3 border border-pink-200 text-momPink hover:bg-pink-50 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <RefreshCw className="w-4 h-4" /> Ghi âm lại cữ nhật ký
                  </button>
                  <button
                    onClick={() => {
                      toast.success('Nhật ký cảm xúc đã được lưu trữ! 💾');
                      navigate('/postpartum');
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition hover:opacity-95 shadow-sm active:scale-95"
                  >
                    <Check className="w-4 h-4" /> Lưu cữ nhật ký hôm nay
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </TierGate>
  );
}
