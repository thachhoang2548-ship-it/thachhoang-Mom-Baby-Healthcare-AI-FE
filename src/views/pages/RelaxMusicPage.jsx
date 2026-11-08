import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Pause,
  Play,
  Square,
  Volume2,
  VolumeX,
  Waves,
  Clock,
  RotateCcw,
  AlertCircle,
  Loader2,
  Music2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import wellnessService from '../../models/services/wellnessService';
import OfflineTrackControl from '../components/relax/OfflineTrackControl';

function buildNoiseBuffer(audioContext) {
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < output.length; i += 1) {
    output[i] = (Math.random() * 2 - 1) * 0.5;
  }
  return buffer;
}

function playSoftNote(context, master, frequency, start, length, gainValue = 0.13) {
  const osc = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(frequency, start);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1800, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  osc.start(start);
  osc.stop(start + length + 0.05);
  return osc;
}

function playSoftKick(context, master, start) {
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(82, start);
  osc.frequency.exponentialRampToValueAtTime(44, start + 0.22);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.12, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
  osc.connect(gain);
  gain.connect(master);
  osc.start(start);
  osc.stop(start + 0.32);
  return osc;
}

const TIMER_OPTIONS = [
  { value: 0, label: 'Không hẹn giờ' },
  { value: 15, label: '15 phút' },
  { value: 30, label: '30 phút' },
  { value: 45, label: '45 phút' },
  { value: 60, label: '60 phút' },
];

export default function RelaxMusicPage() {
  const [library, setLibrary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTrackId, setActiveTrackId] = useState(null);
  const [volume, setVolume] = useState(0.4);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.4);

  // Hẹn giờ tắt (phút và giây còn lại)
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const audioRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  // Mốc giờ kết thúc hẹn giờ (ms) và thời gian còn lại (ms) lúc chưa đếm; chỉ làm tròn khi hiển thị
  const deadlineRef = useRef(null);
  const remainingMsRef = useRef(0);
  // Số thứ tự lượt phát: mỗi lần dừng/đổi bài/rời trang tăng lên để vô hiệu hóa lượt đang chờ play()
  const playSeqRef = useRef(0);
  // Audio đang chờ play() chưa vào audioRef; cần để dừng ngay khi bị hủy
  const pendingAudioRef = useRef(null);

  const setRemainingMs = useCallback((ms) => {
    remainingMsRef.current = ms;
    setSecondsRemaining(Math.ceil(ms / 1000));
  }, []);

  // Dừng toàn bộ âm thanh (Audio Element & Web Audio Context)
  const stopAudio = useCallback(() => {
    playSeqRef.current += 1;

    if (pendingAudioRef.current) {
      try {
        pendingAudioRef.current.pause();
        pendingAudioRef.current.src = '';
      } catch (e) {
        console.error('Error stopping pending audio element:', e);
      }
      pendingAudioRef.current = null;
    }

    if (audioRef.current) {
      if (audioRef.current.timers) {
        audioRef.current.timers.forEach((timer) => clearInterval(timer));
      }

      if (audioRef.current.audioElement) {
        try {
          audioRef.current.audioElement.pause();
          audioRef.current.audioElement.src = '';
        } catch (e) {
          console.error('Error stopping audio element:', e);
        }
      }

      if (audioRef.current.nodes) {
        audioRef.current.nodes.forEach((node) => {
          try { node.stop?.(); } catch { /* already stopped */ }
          try { node.disconnect?.(); } catch { /* already disconnected */ }
        });
      }

      if (audioRef.current.context) {
        try {
          audioRef.current.context.close?.();
        } catch (e) {
          console.error('Error closing audio context:', e);
        }
      }

      audioRef.current = null;
    }
    setActiveTrackId(null);
  }, []);

  // Xóa bộ đếm hẹn giờ
  const clearTimer = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    deadlineRef.current = null;
    setRemainingMs(0);
  }, [setRemainingMs]);

  // Đổi lựa chọn hẹn giờ; timerEpoch buộc effect đếm ngược tính lại mốc kết thúc
  const [timerEpoch, setTimerEpoch] = useState(0);
  const handleSelectTimer = (minutes) => {
    setTimerMinutes(minutes);
    clearTimer();
    if (minutes > 0) {
      setRemainingMs(minutes * 60000);
      toast.success(`Đã hẹn giờ tự dừng sau ${minutes} phút.`);
    } else {
      toast('Đã tắt hẹn giờ.');
    }
    setTimerEpoch((e) => e + 1);
  };

  // Đồng hồ đếm ngược hẹn giờ: chỉ chạy khi có bài đang phát. Số giây còn lại tính từ
  // mốc kết thúc (Date.now) nên callback bị trễ vẫn bù đủ thời gian đã trôi.
  useEffect(() => {
    if (!activeTrackId || remainingMsRef.current <= 0) return undefined;

    deadlineRef.current = Date.now() + remainingMsRef.current;

    countdownIntervalRef.current = setInterval(() => {
      const leftMs = deadlineRef.current - Date.now();
      if (leftMs <= 0) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        deadlineRef.current = null;
        setRemainingMs(0);
        stopAudio();
        setTimerMinutes(0);
        toast.success('Đã tự động dừng phát theo hẹn giờ tắt.');
        return;
      }
      setSecondsRemaining(Math.ceil(leftMs / 1000));
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      // Dừng/đổi bài: giữ nguyên số ms còn lại (không làm tròn) để đổi bài liên tiếp không gia hạn hẹn giờ.
      // Nếu hạn đã qua trước khi nhịp kế tiếp chạy thì chốt hết hạn đúng một lần, không dựng lại thời gian.
      if (deadlineRef.current) {
        const leftMs = deadlineRef.current - Date.now();
        deadlineRef.current = null;
        if (leftMs > 0) {
          setRemainingMs(leftMs);
        } else {
          setRemainingMs(0);
          setTimerMinutes(0);
          toast.success('Đã tự động dừng phát theo hẹn giờ tắt.');
        }
      }
    };
  }, [activeTrackId, timerEpoch, stopAudio, setRemainingMs]);

  // Tải danh sách âm thanh từ service
  const fetchLibrary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await wellnessService.getRelaxTracks();
      if (data && (Array.isArray(data.tracks) || Array.isArray(data))) {
        setLibrary(data);
      } else if (data && typeof data === 'object') {
        setLibrary(data);
      } else {
        setError('Dữ liệu âm thanh chưa sẵn sàng.');
      }
    } catch (err) {
      console.error('Failed to load relax tracks:', err);
      setError('Không thể kết nối đến thư viện âm thanh thư giãn.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLibrary();

    // Dọn dẹp âm thanh và timer khi unmount
    return () => {
      stopAudio();
      clearTimer();
    };
  }, [fetchLibrary, stopAudio, clearTimer]);

  // Cập nhật âm lượng khi volume state thay đổi
  useEffect(() => {
    const effectiveVolume = isMuted ? 0 : volume;
    if (audioRef.current?.master) {
      audioRef.current.master.gain.value = effectiveVolume;
    }
    if (audioRef.current?.audioElement) {
      audioRef.current.audioElement.volume = effectiveVolume;
    }
    if (pendingAudioRef.current) {
      pendingAudioRef.current.volume = effectiveVolume;
    }
  }, [volume, isMuted]);

  // Bật / tắt âm lượng (Mute toggle)
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolume > 0 ? prevVolume : 0.4);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (newVal) => {
    const val = Number(newVal);
    setVolume(val);
    if (val > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  // Bắt đầu phát bài
  const playTrack = async (track) => {
    stopAudio();


    const effectiveVolume = isMuted ? 0 : volume;

    // Trường hợp 1: Có URL file âm thanh
    if (track.audioUrl) {
      // stopAudio() ở trên đã tăng playSeqRef; lượt này giữ số thứ tự hiện tại
      const seq = playSeqRef.current;
      const audioElement = new Audio(track.audioUrl);
      audioElement.loop = true;
      audioElement.volume = effectiveVolume;
      pendingAudioRef.current = audioElement;

      try {
        await audioElement.play();
        if (seq !== playSeqRef.current) {
          // Đã đổi bài/dừng/rời trang trong lúc chờ: không nhận nguồn đến muộn
          try {
            audioElement.pause();
            audioElement.src = '';
          } catch { /* đã được dọn */ }
          return;
        }
        pendingAudioRef.current = null;
        audioRef.current = { audioElement, nodes: [], timers: [] };
        setActiveTrackId(track.id);
        toast.success(`Đang phát: ${track.title}`);
      } catch (err) {
        // Lượt cũ bị hủy (pause khi đang chờ play) sẽ reject AbortError: bỏ qua, không báo lỗi
        if (seq !== playSeqRef.current) return;
        pendingAudioRef.current = null;
        audioElement.pause();
        audioElement.src = '';
        console.error('Failed to play audio element:', err);
        toast.error('Chưa thể phát nguồn âm thanh này trên trình duyệt.');
      }
      return;
    }

    // Trường hợp 2: Tạo âm thanh tổng hợp qua Web Audio API
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      toast.error('Trình duyệt hiện tại chưa hỗ trợ âm thanh Web Audio.');
      return;
    }

    try {
      const context = new AudioContext();
      const master = context.createGain();
      master.gain.value = effectiveVolume;
      master.connect(context.destination);

      const nodes = [];
      const timers = [];
      const beatMs = Math.max(700, Math.round(60000 / Number(track.bpm || 56)));
      const chordOffsets = Array.isArray(track.chords) && track.chords.length > 0 ? track.chords : [0, 7, 9, 5];
      const chordIntervals = [0, 4, 7, 12];
      let step = 0;

      const playPattern = () => {
        const now = context.currentTime + 0.03;
        const root = Number(track.tone || 220) * Math.pow(2, chordOffsets[step % chordOffsets.length] / 12);

        chordIntervals.forEach((interval, index) => {
          nodes.push(
            playSoftNote(
              context,
              master,
              root * Math.pow(2, interval / 12),
              now + index * 0.08,
              1.9,
              index === 0 ? 0.11 : 0.07
            )
          );
        });

        if (track.mode === 'lofi') {
          nodes.push(playSoftKick(context, master, now));
          nodes.push(playSoftNote(context, master, root * 2, now + beatMs / 2000, 0.35, 0.035));
        }

        step += 1;
      };

      playPattern();
      timers.push(setInterval(playPattern, beatMs * 2));

      if (Number(track.noise || 0) > 0) {
        const noise = context.createBufferSource();
        const noiseGain = context.createGain();
        const filter = context.createBiquadFilter();
        noise.buffer = buildNoiseBuffer(context);
        noise.loop = true;
        noiseGain.gain.value = Number(track.noise || 0);
        filter.type = 'lowpass';
        filter.frequency.value = track.mode === 'nature-piano' ? 950 : 520;
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(master);
        noise.start();
        nodes.push(noise);
      }

      audioRef.current = { context, master, nodes, timers };
      setActiveTrackId(track.id);
      toast.success(`Đang phát: ${track.title}`);
    } catch (err) {
      console.error('Web Audio init error:', err);
      toast.error('Lỗi khi khởi tạo âm thanh tổng hợp.');
    }
  };

  const tracks = library?.tracks || (Array.isArray(library) ? library : []);
  const activeTrackObj = tracks.find((t) => t.id === activeTrackId);

  // Định dạng thời gian đếm ngược MM:SS
  const formatCountdown = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="font-display space-y-6 text-theme-ink pb-[calc(15rem+env(safe-area-inset-bottom))] sm:pb-[calc(12rem+env(safe-area-inset-bottom))] lg:pb-32">
      {/* 1. Header Trang Thư Giãn (Tiêu đề trung tính, không khẳng định phương pháp) */}
      <section className="bg-theme-surface rounded-3xl border border-theme-line p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-brand-soft text-theme-ink text-xs font-bold">
              <Waves className="w-4 h-4 shrink-0 text-theme-brand" aria-hidden="true" />
              <span>Thư giãn & Phục hồi</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-theme-ink">
              Âm thanh thư giãn
            </h1>
            <p className="text-xs sm:text-sm text-theme-muted font-medium max-w-2xl leading-relaxed">
              Những giai điệu êm dịu và âm thanh tự nhiên giúp mami nghỉ ngơi, thả lỏng tâm trí sau những giờ chăm sóc bé yêu.
            </p>
          </div>

          {activeTrackObj && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-theme-brand-soft border border-theme-line text-xs font-bold text-theme-brand self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-theme-brand" aria-hidden="true" />
              <span>Đang phát: {activeTrackObj.title}</span>
            </div>
          )}
        </div>
      </section>

      {/* 2. Bảng điều khiển: Âm lượng & Hẹn giờ tắt */}
      <section className="bg-theme-surface rounded-2xl border border-theme-line p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* 2.1. Điều khiển âm lượng */}
          <div className="p-3.5 rounded-2xl bg-theme-page border border-theme-line space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-theme-ink">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-theme-brand" aria-hidden="true" />
                <span>Âm lượng phát</span>
              </span>
              <span className="text-theme-muted">
                {isMuted ? 'Đang tắt tiếng' : `${Math.round(volume * 100)}%`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
                className="min-h-[40px] min-w-[40px] rounded-2xl border border-theme-line bg-theme-surface hover:bg-theme-sidebar flex items-center justify-center text-theme-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand shrink-0"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-theme-muted" aria-hidden="true" />
                ) : (
                  <Volume2 className="w-4 h-4 text-theme-brand" aria-hidden="true" />
                )}
              </button>

              <label htmlFor="volume-slider" className="sr-only">Điều chỉnh âm lượng</label>
              <input
                id="volume-slider"
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(e.target.value)}
                className="w-full h-2 bg-theme-sidebar rounded-full appearance-none cursor-pointer accent-theme-brand"
              />
            </div>
          </div>

          {/* 2.2. Hẹn giờ tắt nhạc (Sleep Timer) */}
          <div className="p-3.5 rounded-2xl bg-theme-page border border-theme-line space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-theme-ink">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-theme-brand" aria-hidden="true" />
                <span>Hẹn giờ tự dừng</span>
              </span>
              {secondsRemaining > 0 && activeTrackId && (
                <span className="text-theme-brand font-bold bg-theme-brand-soft px-2 py-0.5 rounded-md">
                  Còn lại: {formatCountdown(secondsRemaining)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {TIMER_OPTIONS.map((opt) => {
                const isSelected = timerMinutes === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectTimer(opt.value)}
                    className={`min-h-[38px] px-3 py-1.5 rounded-md text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                      isSelected
                        ? 'bg-theme-ink text-theme-surface'
                        : 'bg-theme-surface border border-theme-line text-theme-ink hover:bg-theme-sidebar'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Danh sách các bản âm thanh thư giãn */}
      <section className="space-y-4">
        {/* Trạng thái đang tải */}
        {loading && (
          <div className="rounded-2xl border border-theme-line bg-theme-surface p-8 text-center space-y-3">
            <Loader2 className="w-7 h-7 mx-auto text-theme-ink animate-spin motion-reduce:animate-none" aria-hidden="true" />
            <p className="text-sm font-bold text-theme-ink">Đang tải thư viện âm thanh thư giãn...</p>
          </div>
        )}

        {/* Trạng thái lỗi trung thực */}
        {!loading && error && (
          <div className="rounded-2xl border border-status-warn-line bg-status-warn-bg p-6 text-center text-status-warn-text space-y-3">
            <AlertCircle className="w-8 h-8 mx-auto text-status-warn-text" aria-hidden="true" />
            <div className="space-y-1">
              <h2 className="text-sm font-bold">Không thể tải danh sách âm thanh</h2>
              <p className="text-xs sm:text-sm font-medium">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchLibrary}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-2xl bg-theme-ink text-theme-surface hover:bg-theme-sidebar hover:text-theme-ink text-xs sm:text-sm font-bold transition-colors"
            >
              <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Thử kết nối lại</span>
            </button>
          </div>
        )}

        {/* Trạng thái hiển thị danh sách bài */}
        {!loading && !error && tracks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.map((track) => {
              const isActive = activeTrackId === track.id;
              return (
                <article
                  key={track.id}
                  className={`rounded-2xl border bg-theme-surface p-5 shadow-sm flex flex-col justify-between gap-4 transition-colors ${
                    isActive ? 'border-theme-brand ring-1 ring-theme-brand' : 'border-theme-line'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
                        <Music2 className="w-5 h-5" aria-hidden="true" />
                      </div>
                      {isActive && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-ok text-theme-surface text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-theme-surface" aria-hidden="true" />
                          <span>Đang phát</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-base font-bold text-theme-ink leading-snug">
                        {track.title}
                      </h2>
                      <p className="text-xs text-theme-muted font-medium leading-relaxed line-clamp-2">
                        {track.description || 'Giai điệu thư giãn nhẹ nhàng hỗ trợ nghỉ ngơi.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold text-theme-muted">
                      <span className="rounded-md bg-theme-page border border-theme-line px-2 py-0.5">
                        {track.durationMinutes ? `${track.durationMinutes} phút` : 'Lặp liên tục'}
                      </span>
                      {track.modeLabel || track.mode ? (
                        <span className="rounded-md bg-theme-page border border-theme-line px-2 py-0.5">
                          {track.modeLabel || track.mode}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Nút phát / dừng bài & điều khiển tải offline */}
                  <div className="pt-2 border-t border-theme-line space-y-2">
                    <button
                      type="button"
                      onClick={() => (isActive ? stopAudio() : playTrack(track))}
                      aria-label={isActive ? `Dừng phát ${track.title}` : `Phát bài ${track.title}`}
                      className={`w-full min-h-[44px] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                        isActive
                          ? 'bg-status-ok text-theme-surface hover:bg-theme-ink'
                          : 'bg-theme-brand hover:bg-theme-ink text-theme-surface shadow-sm'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Pause className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>Tạm dừng</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>Bắt đầu nghe</span>
                        </>
                      )}
                    </button>
                    <OfflineTrackControl track={track} />
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Trạng thái không có bản ghi nào */}
        {!loading && !error && tracks.length === 0 && (
          <div className="rounded-2xl border border-theme-line bg-theme-surface p-8 text-center space-y-2">
            <Music2 className="w-8 h-8 mx-auto text-theme-muted" aria-hidden="true" />
            <h2 className="text-sm font-bold text-theme-ink">Chưa có bản âm thanh nào</h2>
            <p className="text-xs text-theme-muted">Thư viện âm thanh đang được chuẩn bị và cập nhật.</p>
          </div>
        )}
      </section>

      {/* 4. Thanh "Đang phát" cố định chân trang (Now Playing Bar) */}
      {activeTrackObj && (
        <aside
          role="region"
          aria-label="Thanh điều khiển âm thanh đang phát"
          className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] lg:bottom-3 inset-x-3 sm:inset-x-6 z-40 max-w-4xl mx-auto rounded-2xl border border-theme-line bg-theme-surface/95 backdrop-blur-md p-3.5 sm:p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in motion-reduce:animate-none"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-theme-brand text-theme-surface flex items-center justify-center shrink-0">
              <Waves className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-theme-brand">Đang phát:</span>
                <h3 className="text-xs sm:text-sm font-bold text-theme-ink truncate">
                  {activeTrackObj.title}
                </h3>
              </div>
              <p className="text-xs text-theme-muted font-medium truncate">
                {secondsRemaining > 0
                  ? `Tự dừng sau: ${formatCountdown(secondsRemaining)}`
                  : 'Phát lặp liên tục'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={stopAudio}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-2xl border border-theme-line bg-theme-page hover:bg-theme-sidebar text-xs font-bold text-theme-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
            >
              <Square className="w-3.5 h-3.5 text-theme-brand shrink-0" aria-hidden="true" />
              <span>Dừng hẳn</span>
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
