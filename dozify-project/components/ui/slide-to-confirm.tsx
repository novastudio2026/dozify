"use client";

import { Check, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

export function SlideToConfirm({ label = "İlacımı Yuttum", onConfirm }: { label?: string; onConfirm: () => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [complete, setComplete] = useState(false);
  const [offset, setOffset] = useState(0);
  const reset = () => {
    window.setTimeout(() => { setComplete(false); setOffset(0); }, 900);
  };
  const move = (clientX: number) => {
    if (!dragging || !track.current || complete) return;
    const rect = track.current.getBoundingClientRect();
    const max = rect.width - 52;
    const next = Math.max(0, Math.min(max, clientX - rect.left - 26));
    setOffset(next);
    if (next >= max * 0.8) { setComplete(true); setDragging(false); setOffset(max); onConfirm(); reset(); }
  };
  const end = () => { setDragging(false); if (!complete) setOffset(0); };
  const touchMove = (event: React.TouchEvent<HTMLDivElement>) => { event.preventDefault(); move(event.touches[0]?.clientX ?? 0); };
  const touchEnd = (event: React.TouchEvent<HTMLDivElement>) => { event.preventDefault(); end(); };
  return <div ref={track} style={{ touchAction: "none" }} className={`relative h-14 select-none overflow-hidden rounded-xl transition-colors ${complete ? "bg-emerald-500" : "bg-sky-100"}`} onPointerMove={(e) => move(e.clientX)} onPointerUp={end} onPointerCancel={end} onTouchMove={touchMove} onTouchEnd={touchEnd} onTouchCancel={touchEnd}>
    <span className={`pointer-events-none absolute inset-0 grid place-items-center pl-9 text-base font-semibold ${complete ? "text-white" : "text-sky-800"}`}>{complete ? "Doz alındı" : `${label} — sağa kaydır`}</span>
    <button type="button" aria-label={complete ? "Doz alındı" : `${label} için sağa kaydır`} onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setDragging(true); }} onTouchStart={() => setDragging(true)} className={`absolute top-1 grid h-12 w-12 touch-none place-items-center rounded-lg shadow-md transition-[transform,colors] duration-200 ${complete ? "bg-white text-emerald-600" : "bg-sky-600 text-white"}`} style={{ transform: `translateX(${offset}px)` }}>
      {complete ? <Check /> : <ChevronRight />}
    </button>
  </div>;
}
