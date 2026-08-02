import type { Metadata } from "next";
import "./globals.css";
import { OfflineSyncProvider } from "@/components/offline-sync-provider";
import { ProfileProvider } from "@/components/profile-provider";

export const metadata: Metadata = {
  title: "Dozify | Akıllı İlaç ve Tahlil Asistanı",
  description: "İlaç dozlarınızı ve tahlil sonuçlarınızı takip edin.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body><OfflineSyncProvider><ProfileProvider>{children}</ProfileProvider></OfflineSyncProvider></body></html>;
}
