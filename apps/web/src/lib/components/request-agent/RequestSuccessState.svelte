<script lang="ts">
	import { resolve } from '$app/paths';
	import { CheckCircle2 } from 'lucide-svelte';

	import type { SubmittedCustomRequestViewModel } from '$lib/types/request-agent';

	let {
		request
	}: {
		request: SubmittedCustomRequestViewModel;
	} = $props();
</script>

<section
	class="rounded-lg border border-success/30 bg-[linear-gradient(145deg,rgba(34,197,94,0.14),rgba(13,19,36,0.92))] p-6"
>
	<div class="flex flex-col gap-5 sm:flex-row sm:items-start">
		<div
			class="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-success/35 bg-success/15 text-green-300"
		>
			<CheckCircle2 aria-hidden="true" size={24} />
		</div>
		<div class="min-w-0 flex-1">
			<p class="text-xs font-semibold uppercase tracking-[0.08em] text-green-300">
				Request submitted
			</p>
			<h2 class="mt-2 text-xl font-bold text-slate-50">Your custom simulation request is in.</h2>
			<p class="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
				Your request can now be reviewed and converted into a product or simulation. We have not
				started a real AI simulation engine or promised a fixed delivery time in this phase.
			</p>

			<dl class="mt-5 grid gap-3 sm:grid-cols-3">
				<div class="rounded-md border border-border/70 bg-ink-950/35 p-3">
					<dt class="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-slate-500">
						Reference
					</dt>
					<dd class="mt-1 text-sm font-semibold text-slate-100">{request.reference}</dd>
				</div>
				<div class="rounded-md border border-border/70 bg-ink-950/35 p-3">
					<dt class="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-slate-500">
						Product
					</dt>
					<dd class="mt-1 truncate text-sm font-semibold text-slate-100">{request.productName}</dd>
				</div>
				<div class="rounded-md border border-border/70 bg-ink-950/35 p-3">
					<dt class="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-slate-500">
						Status
					</dt>
					<dd class="mt-1 text-sm font-semibold text-green-300">{request.status}</dd>
				</div>
			</dl>

			<a
				class="mt-6 inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-ink-800/70 px-4 text-sm font-semibold text-slate-100 transition duration-200 hover:border-brand-light/55 hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
				data-sveltekit-reload
				href={resolve('/request-simulation')}
			>
				Start another request
			</a>
		</div>
	</div>
</section>
