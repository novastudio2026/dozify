"use client";

import { Bell, HeartPulse, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useProfile } from "@/components/profile-provider";

const links = [
  ["/dashboard", "Bugün"], ["/medications", "İlaçlarım"], ["/labs", "Tahlillerim"], ["/family", "Aile"], ["/plans", "Planlar"], ["/settings", "Ayarlar"],
];

export function HeaderWithBranding() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { profiles, activeProfile, setActiveProfileId } = useProfile();
  return <header className="border-b border-sky-100 bg-white/95 backdrop-blur">
    <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4">
      <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold text-sky-700" aria-label="Dozify ana sayfa">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-600 text-white"><HeartPulse aria-hidden="true" /></span> Dozify
      </Link>
      <nav className="hidden items-center gap-1 md:flex" aria-label="Ana menü">
        {links.map(([href, label]) => <Link key={href} href={href} className={`rounded-lg px-3 py-3 text-base font-medium ${pathname === href ? "bg-sky-50 text-sky-700" : "text-slate-600 hover:bg-slate-50"}`}>{label}</Link>)}
      </nav>
      <div className="flex items-center gap-2">
        <label className="block"><span className="sr-only">Aktif profil</span><select value={activeProfile.id} onChange={(event) => setActiveProfileId(event.target.value)} className="h-12 max-w-28 rounded-xl border border-sky-200 bg-sky-50 px-2 text-base font-semibold text-sky-800 sm:max-w-32 sm:px-3">{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</select></label>
        <button className="grid h-12 w-12 place-items-center rounded-xl text-slate-600 hover:bg-sky-50" aria-label="Bildirimler"><Bell /></button>
        <button className="grid h-12 w-12 place-items-center rounded-xl md:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menüyü aç"><>{open ? <X /> : <Menu />}</></button>
      </div>
    </div>
    {open && <nav className="border-t border-sky-100 px-4 pb-3 md:hidden" aria-label="Mobil menü">
      {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-base text-slate-700 hover:bg-sky-50">{label}</Link>)}
    </nav>}
  </header>;
}
