<script lang="ts">
	import type {
		RequestAgentField,
		RequestAgentValues,
		RequestReviewSection
	} from '$lib/types/request-agent';
	import { requestAgentSteps } from '$lib/features/request-agent/request-agent.steps';

	let {
		onedit,
		sections,
		summary,
		values
	}: {
		onedit?: (field: RequestAgentField) => void;
		sections: RequestReviewSection[];
		summary: string;
		values: RequestAgentValues;
	} = $props();
</script>

<div class="space-y-5">
	<div class="rounded-lg border border-success/25 bg-success/8 p-4">
		<p class="text-xs font-semibold uppercase tracking-[0.08em] text-green-300">Summary preview</p>
		<pre class="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-100">{summary}</pre>
		<p class="mt-3 text-xs leading-5 text-slate-400">
			This preview is generated deterministically from your answers. No external AI provider is used
			in this phase.
		</p>
	</div>

	<div class="grid gap-4 lg:grid-cols-2">
		{#each sections as section (section.title)}
			<section class="rounded-lg border border-border/80 bg-ink-950/35 p-4">
				<h2 class="text-sm font-semibold text-slate-100">{section.title}</h2>
				<dl class="mt-4 space-y-3">
					{#each section.items as item (item.field)}
						<div class="grid gap-1">
							<dt class="flex items-center justify-between gap-3 text-xs text-slate-500">
								<span>{item.label}</span>
								<button
									class="rounded-sm text-[0.68rem] font-semibold text-purple-200 underline-offset-4 transition hover:text-purple-100 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
									onclick={() => onedit?.(item.field)}
									type="button"
								>
									Edit
								</button>
							</dt>
							<dd class="break-words text-sm leading-6 text-slate-200">{item.value}</dd>
						</div>
					{/each}
				</dl>
			</section>
		{/each}
	</div>

	{#each requestAgentSteps as step (step.field)}
		<input name={step.field} type="hidden" value={values[step.field]} />
	{/each}
</div>
