"use client";

import { AlertTriangle } from "lucide-react";

export function DeleteConfirmModal({ title, description, onCancel, onConfirm }: { title: string; description: string; onCancel: () => void; onConfirm: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-title">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><AlertTriangle className="text-red-500" size={32} /><h2 id="delete-title" className="mt-3 text-2xl font-bold text-slate-900">{title}</h2><p className="mt-2 text-base leading-7 text-slate-600">{description}</p><div className="mt-6 flex gap-3"><button onClick={onCancel} className="h-12 flex-1 rounded-xl border border-slate-300 text-base font-bold text-slate-700">Vazgeç</button><button onClick={onConfirm} className="h-12 flex-1 rounded-xl bg-red-600 text-base font-bold text-white hover:bg-red-700">Sil</button></div></div>
  </div>;
}
