import { requireSession } from "@/lib/session";
import { AppShell } from "@/components/layout/app-shell";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return <AppShell user={session}>{children}</AppShell>;
}
