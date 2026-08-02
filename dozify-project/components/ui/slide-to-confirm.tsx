"use client";

import { Check, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

export function SlideToConfirm({ label = "İlacımı Yuttum", onConfirm }: { label?: string; onConfirm: () => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [complete, setComplete] = useState(false);
  const [offset, setOffset] = useState(0);
  const move = (clientX: number) => {
    if (!dragging || !track.current || complete) return;
    const rect = track.current.getBoundingClientRect();
    const max = rect.width - 52;
    const next = Math.max(0, Math.min(max, clientX - rect.left - 26));
    setOffset(next);
    if (next >= max * 0.82) { setComplete(true); setDragging(false); setOffset(max); onConfirm(); }
  };
  const end = () => { setDragging(false); if (!complete) setOffset(0); };
  return <div ref={track} className={`relative h-14 select-none overflow-hidden rounded-xl ${complete ? "bg-emerald-500" : "bg-sky-100"}`} onPointerMove={(e) => move(e.clientX)} onPointerUp={end} onPointerCancel={end}>
    <span className={`pointer-events-none absolute inset-0 grid place-items-center pl-9 text-base font-semibold ${complete ? "text-white" : "text-sky-800"}`}>{complete ? "Doz alındı" : `${label} — sağa kaydır`}</span>
    <button type="button" aria-label={complete ? "Doz alındı" : `${label} için sağa kaydır`} onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setDragging(true); }} className={`absolute top-1 grid h-12 w-12 touch-none place-items-center rounded-lg shadow-md transition-transform ${complete ? "bg-white text-emerald-600" : "bg-sky-600 text-white"}`} style={{ transform: `translateX(${offset}px)` }}>
      {complete ? <Check /> : <ChevronRight />}
    </button>
  </div>;
}
