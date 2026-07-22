"use client";

import { useEffect, useState } from "react";

function diffParts(target: number) {
  let diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff / 864e5);
  diff -= d * 864e5;
  const h = Math.floor(diff / 36e5);
  diff -= h * 36e5;
  const m = Math.floor(diff / 6e4);
  diff -= m * 6e4;
  const s = Math.floor(diff / 1e3);
  return { d, h, m, s };
}

export function Countdown({ target }: { target: string }) {
  const targetMs = new Date(target).getTime();
  const [parts, setParts] = useState(() => diffParts(targetMs));

  useEffect(() => {
    const id = setInterval(() => setParts(diffParts(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const boxes: Array<[number, string]> = [
    [parts.d, "Ngày"],
    [parts.h, "Giờ"],
    [parts.m, "Phút"],
    [parts.s, "Giây"],
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      {boxes.map(([n, label]) => (
        <div
          key={label}
          className="min-w-[70px] max-w-[96px] flex-1 rounded-2xl border border-gold-soft/50 bg-paper p-4 shadow-soft-sm"
        >
          <div className="font-serif text-[clamp(1.6rem,6vw,2rem)] font-bold leading-none text-gold-deep">
            {String(n).padStart(2, "0")}
          </div>
          <div className="mt-1.5 text-[0.68rem] uppercase tracking-[0.12em] text-muted">{label}</div>
        </div>
      ))}
    </div>
  );
}
