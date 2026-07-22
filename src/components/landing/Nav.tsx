"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "#features", label: "Tính năng" },
  { href: "#how", label: "Cách hoạt động" },
  { href: "#templates", label: "Mẫu thiệp" },
  { href: "#pricing", label: "Bảng giá" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-ivory/80 px-[clamp(1.1rem,4vw,3.2rem)] py-3 backdrop-blur">
      <Link href="#top" className="flex items-center gap-2 font-serif text-xl font-bold text-gold-deep">
        <span aria-hidden className="text-rose">
          ⚭
        </span>
        Thiệp Ước
      </Link>

      <div className="hidden items-center gap-8 md:flex">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className="text-sm font-medium text-ink hover:text-gold-deep">
            {l.label}
          </a>
        ))}
        <Link href="/w/quan-linh" className="btn btn-small">
          Xem thiệp mẫu
        </Link>
      </div>

      <button
        type="button"
        aria-label="Mở menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] md:hidden"
      >
        <span className={`h-0.5 w-6 bg-gold-deep transition ${open ? "translate-y-[7px] rotate-45" : ""}`} />
        <span className={`h-0.5 w-6 bg-gold-deep transition ${open ? "opacity-0" : ""}`} />
        <span
          className={`h-0.5 w-6 bg-gold-deep transition ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-ink/30 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 right-0 z-50 flex w-[min(80vw,320px)] flex-col justify-center gap-6 bg-paper p-8 shadow-soft md:hidden">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-lg font-medium text-ink"
              >
                {l.label}
              </a>
            ))}
            <Link href="/w/quan-linh" className="btn" onClick={() => setOpen(false)}>
              Xem thiệp mẫu
            </Link>
          </div>
        </>
      )}
    </nav>
  );
}
