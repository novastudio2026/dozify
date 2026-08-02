"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type FamilyProfile = { id: string; name: string; relation: string; inviteCode: string };
const defaultProfiles: FamilyProfile[] = [
  { id: "emir", name: "Emir", relation: "Ben", inviteCode: "" },
  { id: "annem", name: "Annem", relation: "Aile üyesi", inviteCode: "392415" },
  { id: "kardesim", name: "Kardeşim", relation: "Aile üyesi", inviteCode: "782163" },
];
type ProfileContextValue = { profiles: FamilyProfile[]; activeProfile: FamilyProfile; setActiveProfileId: (id: string) => void; addProfile: (name: string, relation: string) => void };
const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState(defaultProfiles); const [activeId, setActiveId] = useState("emir"); const [loaded, setLoaded] = useState(false);
  useEffect(() => { const saved = localStorage.getItem("dozify-family-profiles"); if (saved) setProfiles(JSON.parse(saved)); const active = localStorage.getItem("dozify-active-profile"); if (active) setActiveId(active); setLoaded(true); }, []);
  useEffect(() => { if (loaded) localStorage.setItem("dozify-family-profiles", JSON.stringify(profiles)); }, [loaded, profiles]);
  useEffect(() => { if (loaded) localStorage.setItem("dozify-active-profile", activeId); }, [activeId, loaded]);
  const addProfile = (name: string, relation: string) => { const profile = { id: crypto.randomUUID(), name, relation, inviteCode: String(Math.floor(100000 + Math.random() * 900000)) }; setProfiles((list) => [...list, profile]); setActiveId(profile.id); };
  const activeProfile = profiles.find((profile) => profile.id === activeId) ?? profiles[0];
  return <ProfileContext.Provider value={{ profiles, activeProfile, setActiveProfileId: setActiveId, addProfile }}>{children}</ProfileContext.Provider>;
}
export function useProfile() { const context = useContext(ProfileContext); if (!context) throw new Error("useProfile must be used inside ProfileProvider"); return context; }
