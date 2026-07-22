"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Floating music player — không autoplay (tuân thủ browser policy).
 * Bật/tắt bằng nút nổi góc phải dưới.
 */
export function MusicPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => setPlaying(false);
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {
        // Browser blocked autoplay
        setPlaying(false);
      });
    }
  }

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" />
      <button
        onClick={toggle}
        aria-label={playing ? "Tắt nhạc" : "Bật nhạc"}
        className={`fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
          playing
            ? "animate-spin-slow bg-gold text-white"
            : "bg-paper text-gold-deep border border-gold-soft/50"
        }`}
        style={playing ? { animationDuration: "3s" } : undefined}
      >
        {playing ? (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zM10 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
          </svg>
        )}
      </button>
    </>
  );
}
