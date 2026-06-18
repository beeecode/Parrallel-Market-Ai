"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { APP_NAME } from "@/constants/app";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  activePath: string;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
};

export function MobileNav({ activePath, isOpen, onClose, onToggle }: MobileNavProps) {
  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 w-screen max-w-full items-center gap-3 border-b border-border bg-ink-950/88 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-brand-light/35 bg-brand-soft text-sm font-bold text-brand-light">
            PM
          </span>
          <span className="text-sm font-bold text-slate-100">{APP_NAME}</span>
        </div>
        <Button
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
          className="shrink-0"
          onClick={onToggle}
          size="icon"
          variant="secondary"
        >
          <span className="sr-only">Menu</span>
          <span className="relative block h-4 w-5">
            <span
              className={cn(
                "absolute left-0 top-0 h-0.5 w-5 rounded bg-current transition",
                isOpen && "translate-y-2 rotate-45",
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-2 h-0.5 w-5 rounded bg-current transition",
                isOpen && "opacity-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-4 h-0.5 w-5 rounded bg-current transition",
                isOpen && "-translate-y-2 -rotate-45",
              )}
            />
          </span>
        </Button>
      </header>

      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={onClose}
            type="button"
          />
          <div className="absolute inset-y-0 left-0 w-[min(21rem,86vw)]">
            <Sidebar activePath={activePath} onNavigate={onClose} />
          </div>
        </div>
      ) : null}
    </>
  );
}
