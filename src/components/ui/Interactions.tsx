"use client";

import { useEffect } from "react";

/**
 * Gắn các micro-interaction dùng chung: ripple cho .btn, scroll-reveal cho .reveal,
 * nút "nam châm" (chỉ pointer:fine). Tôn trọng prefers-reduced-motion.
 */
export function Interactions() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

    // ripple
    const onDown = (e: PointerEvent) => {
      const target = (e.target as HTMLElement)?.closest(".btn") as HTMLElement | null;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const r = document.createElement("span");
      r.className = "ripple";
      r.style.width = r.style.height = `${size}px`;
      r.style.left = `${e.clientX - rect.left - size / 2}px`;
      r.style.top = `${e.clientY - rect.top - size / 2}px`;
      target.appendChild(r);
      setTimeout(() => r.remove(), 650);
    };
    document.addEventListener("pointerdown", onDown);

    // scroll reveal
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.14 },
    );
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));

    // magnetic (pointer fine only)
    const cleanups: Array<() => void> = [];
    if (!reduce && window.matchMedia("(pointer:fine)").matches) {
      document.querySelectorAll<HTMLElement>(".btn:not(.btn-small)").forEach((btn) => {
        const move = (e: PointerEvent) => {
          const r = btn.getBoundingClientRect();
          const x = (e.clientX - r.left - r.width / 2) / r.width;
          const y = (e.clientY - r.top - r.height / 2) / r.height;
          btn.style.transform = `translate(${x * 8}px,${y * 8 - 2}px)`;
        };
        const leave = () => (btn.style.transform = "");
        btn.addEventListener("pointermove", move);
        btn.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          btn.removeEventListener("pointermove", move);
          btn.removeEventListener("pointerleave", leave);
        });
      });
    }

    return () => {
      document.removeEventListener("pointerdown", onDown);
      io.disconnect();
      cleanups.forEach((c) => c());
    };
  }, []);

  return null;
}
