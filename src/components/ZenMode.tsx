import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, Headphones } from 'lucide-react';
import type { Task } from '../types';

interface ZenModeProps {
  task: Task;
  onClose: () => void;
  onComplete: () => void;
}

const AMBIENT_SOUNDS = [
  { id: 'silence', label: '🤫 Pure Silence', url: null },
  { id: 'lofi', label: '🎵 Lo-Fi Beats', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3' },
  { id: 'rain', label: '🌧️ Rain Shower', url: 'https://cdn.pixabay.com/audio/2021/08/04/audio_3d7904e9c7.mp3' },
  { id: 'typing', label: '⌨️ Mechanical Typing', url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_73228a9b23.mp3' },
];

export default function ZenMode({ task, onClose, onComplete }: ZenModeProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [soundId, setSoundId] = useState('silence');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      // Timer finished!
      const chime = new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_bb630cc098.mp3');
      chime.play().catch(() => {});
      onComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  useEffect(() => {
    if (soundId !== 'silence') {
      const track = AMBIENT_SOUNDS.find(s => s.id === soundId);
      if (track?.url) {
        if (!audioRef.current) {
          audioRef.current = new Audio(track.url);
          audioRef.current.loop = true;
        } else {
          audioRef.current.src = track.url;
        }
        if (isActive) {
          audioRef.current.play().catch(() => {});
        }
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [soundId, isActive]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-fade-in">
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
      >
        <X size={24} />
      </button>

      <div className="text-center max-w-2xl w-full px-6">
        <h2 className="text-sm font-bold tracking-widest text-brand-500 uppercase mb-4">Focus Session</h2>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-16 leading-tight line-clamp-2">
          {task.title}
        </h1>

        <div className="text-[120px] md:text-[180px] font-black text-white leading-none tracking-tighter tabular-nums drop-shadow-2xl mb-16">
          {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
        </div>

        <div className="flex items-center justify-center gap-6 mb-16">
          <button 
            onClick={resetTimer}
            className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <RotateCcw size={24} />
          </button>
          
          <button 
            onClick={toggleTimer}
            className="w-24 h-24 rounded-full bg-brand-500 flex items-center justify-center text-white hover:bg-brand-400 hover:scale-105 shadow-[0_0_40px_rgba(139,92,246,0.4)] transition-all"
          >
            {isActive ? <Pause size={40} className="fill-current" /> : <Play size={40} className="ml-2 fill-current" />}
          </button>

          <div className="relative group">
            <button className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
              {soundId === 'silence' ? <Volume2 size={24} /> : <Headphones size={24} className="text-brand-400" />}
            </button>
            
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              {AMBIENT_SOUNDS.map(sound => (
                <button
                  key={sound.id}
                  onClick={() => setSoundId(sound.id)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${soundId === sound.id ? 'bg-brand-500/20 text-brand-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  {sound.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
