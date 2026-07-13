<script lang="ts">
	import { AlertCircle, ArrowRight, MessageCircleMore, Sparkles } from 'lucide-svelte';

	import { demoPersonas } from '$lib/features/landing/landing.constants';
	import type { DemoPersonaId } from '$lib/features/landing/landing.types';

	let activePersonaId: DemoPersonaId = $state('tunde');
	let activePersona = $derived(
		demoPersonas.find((persona) => persona.id === activePersonaId) ?? demoPersonas[0]
	);
</script>

<section
	aria-labelledby="demo-title"
	class="border-y border-border/55 bg-ink-925/68 py-20 sm:py-24"
>
	<div class="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
		<div class="grid items-center gap-10 lg:grid-cols-[0.7fr_1.3fr]">
			<div>
				<p class="text-sm font-semibold text-green-300">Sample interaction</p>
				<h2 id="demo-title" class="mt-3 text-3xl font-bold text-slate-50 sm:text-4xl">
					Different personas surface different launch questions
				</h2>
				<p class="mt-5 text-base leading-7 text-slate-400">
					Switch between three static example personas. These are illustrative conversations, not
					real customers or live AI responses.
				</p>
				<div
					class="mt-7 flex items-start gap-3 rounded-md border border-warning/20 bg-warning/5 p-4"
				>
					<AlertCircle aria-hidden="true" class="mt-0.5 shrink-0 text-yellow-300" size={17} />
					<p class="text-xs leading-5 text-slate-400">
						Use simulation signals to improve your research plan, then validate important findings
						with real customers.
					</p>
				</div>
			</div>

			<div class="overflow-hidden rounded-lg border border-border bg-ink-900">
				<div class="flex items-center justify-between border-b border-border p-4 sm:p-5">
					<div class="flex items-center gap-2">
						<MessageCircleMore aria-hidden="true" class="text-brand-light" size={18} />
						<div>
							<p class="text-sm font-bold text-slate-100">Customer reaction preview</p>
							<p class="mt-0.5 text-[10px] text-slate-500">Frontend-only sample</p>
						</div>
					</div>
					<span class="rounded bg-success/10 px-2 py-1 text-[10px] font-semibold text-green-300"
						>Demo</span
					>
				</div>

				<div class="grid md:grid-cols-[0.38fr_0.62fr]">
					<div class="border-b border-border p-3 md:border-r md:border-b-0">
						<div class="grid grid-cols-3 gap-2 md:grid-cols-1">
							{#each demoPersonas as persona (persona.id)}
								<button
									aria-pressed={activePersonaId === persona.id}
									class={[
										'flex min-w-0 flex-col items-center gap-2 rounded-md border p-2.5 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light md:flex-row md:text-left',
										activePersonaId === persona.id
											? 'border-brand-light/35 bg-brand/12'
											: 'border-transparent hover:border-border hover:bg-white/[0.035]'
									]}
									onclick={() => (activePersonaId = persona.id)}
									type="button"
								>
									<img
										alt=""
										class="h-9 w-9 rounded-full bg-ink-700 object-cover"
										height="36"
										src={persona.avatar}
										width="36"
									/>
									<span class="min-w-0">
										<span class="block truncate text-xs font-semibold text-slate-200"
											>{persona.name}</span
										>
										<span class="mt-0.5 hidden truncate text-[9px] text-slate-500 sm:block"
											>{persona.label}</span
										>
									</span>
								</button>
							{/each}
						</div>
					</div>

					<div class="flex min-h-[23rem] flex-col p-4 sm:p-6">
						<div class="flex items-center justify-between gap-3">
							<div>
								<p class="text-xs font-bold text-slate-200">
									{activePersona.name} · {activePersona.label}
								</p>
								<p class="mt-1 text-[10px] text-slate-500">Illustrative customer persona</p>
							</div>
							<span
								class="rounded-md border border-danger/20 bg-danger/5 px-2 py-1 text-[10px] font-semibold text-red-300"
								>{activePersona.concern}</span
							>
						</div>

						<div aria-live="polite" class="mt-7 space-y-4">
							<div
								class="max-w-[86%] rounded-md rounded-bl-none bg-slate-100 p-3.5 text-xs leading-5 text-slate-800 sm:text-sm sm:leading-6"
							>
								{activePersona.message}
							</div>
							<div
								class="ml-auto max-w-[86%] rounded-md rounded-br-none bg-emerald-900/90 p-3.5 text-xs leading-5 text-emerald-50 sm:text-sm sm:leading-6"
							>
								{activePersona.reply}
							</div>
						</div>

						<div
							class="mt-auto flex items-center gap-2 border-t border-border/70 pt-4 text-[11px] text-slate-500"
						>
							<Sparkles aria-hidden="true" class="text-brand-light" size={14} />
							Example insight: address {activePersona.concern.toLowerCase()} before launch
							<ArrowRight aria-hidden="true" class="ml-auto text-slate-600" size={14} />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
