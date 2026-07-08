import { useState, useRef, useEffect } from 'react';
import { playPopSound } from '../utils/audio';

interface ConfettiButtonProps {
  onComplete: () => void;
  className?: string;
  children: React.ReactNode;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  tx: number; // target x
  ty: number; // target y
  rotation: number;
}

const COLORS = ['#10B981', '#34D399', '#059669', '#FCD34D', '#F472B6'];

export default function ConfettiButton({ onComplete, className = '', children }: ConfettiButtonProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const triggerExplosion = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Play sound
    playPopSound();

    // Create particles
    const rect = buttonRef.current?.getBoundingClientRect();
    const centerX = rect ? rect.width / 2 : 20;
    const centerY = rect ? rect.height / 2 : 20;

    const newParticles: Particle[] = Array.from({ length: 15 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 15 + (Math.random() * 0.5 - 0.25);
      const distance = 40 + Math.random() * 40;
      return {
        id: Math.random().toString(36).slice(2),
        x: centerX,
        y: centerY,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 6,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        rotation: Math.random() * 360,
      };
    });

    setParticles(newParticles);
    
    // Trigger the actual complete action slightly after so we see the pop
    setTimeout(() => {
      onComplete();
    }, 50);

    // Clean up particles
    setTimeout(() => {
      setParticles([]);
    }, 1000);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={triggerExplosion}
        className={`relative z-10 ${className}`}
      >
        {children}
      </button>

      {/* Render particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            transform: `translate(-50%, -50%)`,
            // Use an animation or standard transitions
            animation: `flyOut-${p.id} 0.6s cubic-bezier(0.1, 0.8, 0.3, 1) forwards`,
          }}
        >
          <style>
            {`
              @keyframes flyOut-${p.id} {
                0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); opacity: 1; }
                100% { transform: translate(calc(-50% + ${p.tx}px), calc(-50% + ${p.ty}px)) rotate(${p.rotation}deg) scale(0); opacity: 0; }
              }
            `}
          </style>
        </span>
      ))}
    </div>
  );
}
