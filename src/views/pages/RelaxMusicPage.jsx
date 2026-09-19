import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, Waves } from 'lucide-react';
import toast from 'react-hot-toast';
import wellnessService from '../../models/services/wellnessService';

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

export default function RelaxMusicPage() {
  const [library, setLibrary] = useState(null);
  const [activeTrack, setActiveTrack] = useState(null);
  const [volume, setVolume] = useState(0.35);
  const audioRef = useRef(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.timers?.forEach((timer) => clearInterval(timer));

      if (audioRef.current.audioElement) {
        audioRef.current.audioElement.pause();
        audioRef.current.audioElement.src = '';
      }

      audioRef.current.nodes?.forEach((node) => {
        try { node.stop?.(); } catch { /* already stopped */ }
        try { node.disconnect?.(); } catch { /* already disconnected */ }
      });

      audioRef.current.context?.close();
      audioRef.current = null;
    }
    setActiveTrack(null);
  };

  useEffect(() => {
    wellnessService.getRelaxTracks()
      .then(setLibrary)
      .catch((error) => {
        console.error(error);
        toast.error('Không thể tải danh sách âm thanh.');
      });
    return () => stopAudio();
  }, []);

  const playTrack = async (track) => {
    stopAudio();

    if (track.audioUrl) {
      const audioElement = new Audio(track.audioUrl);
      audioElement.loop = true;
      audioElement.volume = volume;

      try {
        await audioElement.play();
        audioRef.current = { audioElement, nodes: [], timers: [] };
        setActiveTrack(track.id);
      } catch (error) {
        console.error(error);
        toast.error('Chưa phát được nguồn âm thanh này.');
      }
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      toast.error('Trình duyệt chưa hỗ trợ âm thanh thư giãn.');
      return;
    }

    const context = new AudioContext();
    const master = context.createGain();
    master.gain.value = volume;
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
        nodes.push(playSoftNote(
          context,
          master,
          root * Math.pow(2, interval / 12),
          now + index * 0.08,
          1.9,
          index === 0 ? 0.11 : 0.07
        ));
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
    setActiveTrack(track.id);
  };

  useEffect(() => {
    if (audioRef.current?.master) audioRef.current.master.gain.value = volume;
    if (audioRef.current?.audioElement) audioRef.current.audioElement.volume = volume;
  }, [volume]);

  const tracks = library?.tracks || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 text-momPurple px-3 py-1 text-[11px] font-black uppercase tracking-wider">
          <Waves className="w-4 h-4" /> Thư giãn
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-3">{library?.title || 'Âm thanh phục hồi thư giãn'}</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">{library?.description || 'Đang tải thư viện âm thanh...'}</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
        <Volume2 className="w-5 h-5 text-momPink" />
        <input
          type="range"
          min="0"
          max="0.8"
          step="0.05"
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          className="w-full accent-pink-500"
        />
        <span className="text-xs font-black text-gray-500">{Math.round(volume * 100)}%</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tracks.map((track) => {
          const isActive = activeTrack === track.id;
          return (
            <button
              key={track.id}
              onClick={() => (isActive ? stopAudio() : playTrack(track))}
              className="text-left bg-white rounded-3xl border border-pink-100 p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-momPink to-momPurple text-white flex items-center justify-center mb-4">
                {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </div>
              <h2 className="text-base font-black text-gray-900">{track.title}</h2>
              <p className="text-sm font-semibold text-gray-600 mt-2 leading-relaxed">{track.description}</p>
              <p className="text-xs font-bold text-gray-500 mt-3">{track.durationMinutes} phút · {track.modeLabel || track.mode}</p>
              <p className="text-[11px] font-semibold text-gray-400 mt-3">{isActive ? 'Đang phát trong trình duyệt' : 'Bấm để bắt đầu'}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
