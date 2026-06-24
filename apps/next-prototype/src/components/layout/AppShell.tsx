"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-ink-950 bg-app-radial text-slate-100">
      <MobileNav
        activePath={pathname}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onToggle={() => setMobileOpen((open) => !open)}
      />

      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block lg:w-72">
        <Sidebar activePath={pathname} />
      </div>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:ml-72 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-7xl min-w-0">{children}</div>
      </main>
    </div>
  );
}
