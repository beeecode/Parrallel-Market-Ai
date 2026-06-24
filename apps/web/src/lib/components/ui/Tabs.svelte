<script lang="ts">
	let {
		tabs,
		activeTab,
		onchange,
		ariaLabel,
		class: className = ''
	}: {
		tabs: Array<{ id: string; label: string }>;
		activeTab: string;
		onchange: (tab: string) => void;
		ariaLabel: string;
		class?: string;
	} = $props();
</script>

<div
	aria-label={ariaLabel}
	class={['flex min-w-0 overflow-x-auto border-y border-border/75 bg-ink-900/40 px-3', className]}
	role="tablist"
>
	{#each tabs as tab (tab.id)}
		<button
			aria-selected={activeTab === tab.id}
			class={[
				'relative min-h-11 shrink-0 px-4 text-xs font-medium whitespace-nowrap text-slate-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-light',
				activeTab === tab.id
					? 'bg-brand/8 text-purple-200 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-brand-light'
					: 'hover:bg-white/[0.025] hover:text-slate-200'
			]}
			onclick={() => onchange(tab.id)}
			role="tab"
			type="button"
		>
			{tab.label}
		</button>
	{/each}
</div>
