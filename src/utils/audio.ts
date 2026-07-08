// Simple Web Audio API synthesizer for UI sounds
let audioCtx: AudioContext | null = null;

export function playPopSound() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // A snappy, modern mechanical click/pop sound
    const now = audioCtx.currentTime;
    
    // Frequency drop for a "pop"
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);

    // Envelope for a sharp transient
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.8, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.1);
  } catch (e) {
    // Fail silently if audio isn't supported or allowed
    console.warn('Audio play failed:', e);
  }
}
