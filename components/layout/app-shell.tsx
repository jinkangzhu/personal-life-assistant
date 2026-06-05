import Link from "next/link";
import { NavLinks } from "./nav-links";
import { SearchNavLink } from "./search-nav-link";
import { UserMenu } from "./user-menu";
import { MobileBottomNav } from "./mobile-bottom-nav";

interface AppShellProps {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    avatarKey: string | null;
    updatedAt: Date;
  };
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link
            href="/today"
            className="flex shrink-0 items-center gap-2 font-semibold"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-sm text-indigo-400 ring-1 ring-indigo-500/30">
              ✦
            </span>
            <span className="hidden sm:inline">Life Assistant</span>
          </Link>

          <NavLinks className="hidden min-w-0 flex-1 md:flex" />

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <SearchNavLink />
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-6 md:pb-6">
        {children}
      </main>

      <MobileBottomNav />
    </div>
  );
}
