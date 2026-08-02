"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

const disclaimer = "Bu uygulama bir tıbbi teşhis, tedavi veya klinik karar destek sistemi değildir. Tüm kararlarda hekiminize danışınız.";

export function MedicalDisclaimer({ modal = false }: { modal?: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (modal && !localStorage.getItem("dozify-lab-disclaimer-seen")) setOpen(true); }, [modal]);
  const close = () => { localStorage.setItem("dozify-lab-disclaimer-seen", "true"); setOpen(false); };
  return <>
    {open && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="disclaimer-title"><div className="max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex justify-between gap-4"><h2 id="disclaimer-title" className="text-xl font-bold text-slate-900">Önemli tıbbi bilgilendirme</h2><button className="grid h-12 w-12 place-items-center rounded-lg hover:bg-slate-100" onClick={close} aria-label="Kapat"><X /></button></div><p className="mt-4 text-base leading-7 text-slate-700">{disclaimer}</p><button className="mt-6 h-12 w-full rounded-xl bg-sky-600 text-base font-bold text-white hover:bg-sky-700" onClick={close}>Anladım</button></div></div>}
    <footer className="border-t border-sky-100 py-5 text-center text-sm leading-6 text-slate-500"><p><strong>Tıbbi tavsiye değildir.</strong> {disclaimer}</p><p className="mt-2 font-medium text-slate-400">powered by Nova Studio</p></footer>
  </>;
}
