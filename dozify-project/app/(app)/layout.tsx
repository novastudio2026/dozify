import { HeaderWithBranding } from "@/components/ui/header-with-branding";
import { MedicalDisclaimer } from "@/components/ui/disclaimer-modal";
import { ManagedProfileNotice } from "@/components/managed-profile-notice";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <><HeaderWithBranding /><main className="mx-auto min-h-[calc(100vh-64px)] max-w-6xl px-4 py-8"><ManagedProfileNotice />{children}</main><div className="mx-auto max-w-6xl px-4"><MedicalDisclaimer modal /></div></>;
}
