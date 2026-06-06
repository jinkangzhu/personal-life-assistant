import { requireSession } from "@/lib/session";
import { AppShell } from "@/components/layout/app-shell";
import { WallpaperSync } from "@/components/wallpaper-sync";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <>
      <WallpaperSync user={session} />
      <AppShell user={session}>{children}</AppShell>
    </>
  );
}
