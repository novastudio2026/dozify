"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type FamilyProfile = { id: string; dataProfileId: string; name: string; relation: string; familyCode: string; access: "owner" | "managed"; ownerName?: string };
type ProfileContextValue = { profiles: FamilyProfile[]; activeProfile: FamilyProfile; selfProfile: FamilyProfile; setActiveProfileId: (id: string) => void; createPersonalCode: (name?: string) => FamilyProfile; linkFamilyCode: (code: string, relation: string) => { ok: boolean; message: string } };
const PROFILES_KEY = "dozify-family-profiles"; const ACTIVE_KEY = "dozify-active-profile"; const REGISTRY_KEY = "dozify-family-code-registry"; const SELF_KEY = "dozify-self-profile";
const makeCode = () => String(Math.floor(100000 + Math.random() * 900000));
const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

function register(profile: FamilyProfile) {
  const registry: FamilyProfile[] = JSON.parse(localStorage.getItem(REGISTRY_KEY) ?? "[]");
  localStorage.setItem(REGISTRY_KEY, JSON.stringify([...registry.filter((item) => item.familyCode !== profile.familyCode && item.id !== profile.id), profile]));
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<FamilyProfile[]>([]); const [activeId, setActiveId] = useState(""); const [selfProfile, setSelfProfile] = useState<FamilyProfile>(); const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const storedSelf = JSON.parse(localStorage.getItem(SELF_KEY) ?? "null") as (FamilyProfile & { inviteCode?: string }) | null;
    const self: FamilyProfile = storedSelf ? { ...storedSelf, dataProfileId: storedSelf.dataProfileId || storedSelf.id, familyCode: storedSelf.familyCode || storedSelf.inviteCode || makeCode(), access: "owner" } : (() => { const id = crypto.randomUUID(); return { id, dataProfileId: id, name: "Emir", relation: "Ben", familyCode: makeCode(), access: "owner" as const }; })();
    const saved = JSON.parse(localStorage.getItem(PROFILES_KEY) ?? "null") as FamilyProfile[] | null;
    const list = saved?.length ? saved : [self]; if (!list.some((profile) => profile.id === self.id)) list.unshift(self);
    localStorage.setItem(SELF_KEY, JSON.stringify(self)); register(self); setSelfProfile(self); setProfiles(list); setActiveId(localStorage.getItem(ACTIVE_KEY) || self.id); setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); }, [loaded, profiles]);
  useEffect(() => { if (loaded && activeId) localStorage.setItem(ACTIVE_KEY, activeId); }, [activeId, loaded]);
  const createPersonalCode = (name?: string) => {
    const profile = { ...selfProfile!, name: name?.trim() || selfProfile!.name, familyCode: selfProfile!.familyCode || makeCode() };
    localStorage.setItem(SELF_KEY, JSON.stringify(profile)); register(profile); setSelfProfile(profile); setProfiles((items) => items.map((item) => item.id === profile.id ? profile : item)); return profile;
  };
  const linkFamilyCode = (input: string, relation: string) => {
    const code = input.replace(/\D/g, ""); if (code.length !== 6) return { ok: false, message: "6 haneli aile kodunu girin." }; if (code === selfProfile?.familyCode) return { ok: false, message: "Kendi aile kodunuzu bağlayamazsınız." };
    const registry: FamilyProfile[] = JSON.parse(localStorage.getItem(REGISTRY_KEY) ?? "[]"); const owner = registry.find((profile) => profile.familyCode === code);
    if (!owner) return { ok: false, message: "Bu kod bu demo cihazında kayıtlı bir hesaba ait değil." }; if (profiles.some((profile) => profile.familyCode === code)) return { ok: false, message: "Bu aile hesabı zaten bağlı." };
    const linked: FamilyProfile = { ...owner, id: `linked-${owner.id}`, dataProfileId: owner.dataProfileId || owner.id, relation, access: "managed", ownerName: owner.name }; setProfiles((items) => [...items, linked]); setActiveId(linked.id); return { ok: true, message: `${owner.name} hesabı bağlandı.` };
  };
  const activeProfile = profiles.find((profile) => profile.id === activeId) ?? selfProfile!;
  const value = useMemo(() => selfProfile && activeProfile ? ({ profiles, activeProfile, selfProfile, setActiveProfileId: setActiveId, createPersonalCode, linkFamilyCode }) : undefined, [profiles, activeProfile, selfProfile]);
  if (!value) return null; return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
export function useProfile() { const context = useContext(ProfileContext); if (!context) throw new Error("useProfile must be used inside ProfileProvider"); return context; }
