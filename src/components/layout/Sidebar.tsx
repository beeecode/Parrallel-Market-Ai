import Link from "next/link";
import Image from "next/image";

import { APP_NAME, USER_PROFILE } from "@/constants/app";
import { navigationItems } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import type { NavIcon } from "@/types/navigation";

type SidebarProps = {
  activePath: string;
  onNavigate?: () => void;
};

const navIconPaths: Record<NavIcon, string> = {
  dashboard: "/assets/2d/icons/dashboard.svg",
  simulations: "/assets/2d/icons/simulations.svg",
  products: "/assets/2d/icons/products.svg",
  customers: "/assets/2d/icons/customers.svg",
  reports: "/assets/2d/icons/reports.svg",
  insights: "/assets/2d/icons/insights.svg",
  settings: "/assets/2d/icons/settings.svg",
};

function LogoMark() {
  return (
    <div
      aria-hidden="true"
      className="grid h-9 w-9 place-items-center rounded-xl border border-brand-light/35 bg-brand-soft text-brand-light shadow-[0_0_10px_rgba(124,58,237,0.1)]"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path
          d="M7 8.5 12 5l5 3.5M7 15.5 12 19l5-3.5M7 8.5v7m10-7v7M7 8.5 12 12l5-3.5M7 15.5 12 12l5 3.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <circle cx="7" cy="8.5" fill="currentColor" r="1.6" />
        <circle cx="17" cy="8.5" fill="currentColor" r="1.6" />
        <circle cx="7" cy="15.5" fill="currentColor" r="1.6" />
        <circle cx="17" cy="15.5" fill="currentColor" r="1.6" />
      </svg>
    </div>
  );
}

function NavGlyph({ icon }: { icon: NavIcon }) {
  return (
    <span
      aria-hidden="true"
      className="h-[1.125rem] w-[1.125rem] shrink-0 bg-current"
      style={{
        WebkitMask: `url(${navIconPaths[icon]}) center / contain no-repeat`,
        mask: `url(${navIconPaths[icon]}) center / contain no-repeat`,
      }}
    />
  );
}

export function Sidebar({ activePath, onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-full flex-col border-r border-border bg-ink-950/88 px-4 py-5 backdrop-blur-xl">
      <Link
        className="mb-8 flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
        href="/dashboard"
        onClick={onNavigate}
      >
        <LogoMark />
        <span className="text-sm font-bold tracking-tight text-slate-100">{APP_NAME}</span>
      </Link>

      <nav aria-label="Primary navigation" className="space-y-2">
        {navigationItems.map((item) => {
          const isActive = activePath === item.href || activePath.startsWith(`${item.href}/`);
          const itemClasses = cn(
            "group flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
            isActive
              ? "bg-brand-purple text-white shadow-[0_6px_14px_rgba(124,58,237,0.14)]"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
            item.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-slate-400",
          );

          if (item.disabled) {
            return (
              <span aria-disabled="true" className={itemClasses} key={item.label}>
                <NavGlyph icon={item.icon} />
                {item.label}
              </span>
            );
          }

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={itemClasses}
              href={item.href}
              key={item.label}
              onClick={onNavigate}
            >
              <NavGlyph icon={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-border bg-ink-900/70 p-3">
        <div className="flex items-center gap-3">
          <Image
            alt={`${USER_PROFILE.name} avatar`}
            className="h-10 w-10 rounded-full border border-border bg-ink-800 object-cover"
            height={40}
            unoptimized
            src="/assets/2d/avatars/daniel-adeyemi.svg"
            width={40}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-100">{USER_PROFILE.name}</p>
            <p className="text-xs text-slate-500">{USER_PROFILE.plan}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
