import { Layers3 } from 'lucide-react';

export function FoundationStatus() {
  return (
    <section
      aria-labelledby="foundation-title"
      className="w-full max-w-xl rounded-lg border border-slate-800 bg-slate-950 p-8"
    >
      <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-violet-600/15 text-violet-400">
        <Layers3 aria-hidden="true" size={24} />
      </div>
      <p className="mb-2 text-sm font-semibold text-violet-400">Version 2 foundation</p>
      <h1 id="foundation-title" className="text-3xl font-semibold text-white">
        Parallel Market AI
      </h1>
      <p className="mt-3 text-base leading-7 text-slate-400">
        The React and Node.js monorepo architecture is ready for feature development.
      </p>
    </section>
  );
}
