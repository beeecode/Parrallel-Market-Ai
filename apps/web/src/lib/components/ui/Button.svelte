<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'ghost';
	type Size = 'sm' | 'md' | 'icon';

	let {
		children,
		class: className = '',
		variant = 'primary',
		size = 'md',
		type = 'button',
		disabled = false,
		...rest
	}: HTMLButtonAttributes & {
		children: Snippet;
		variant?: Variant;
		size?: Size;
	} = $props();

	const variantClasses: Record<Variant, string> = {
		primary:
			'bg-brand text-white hover:bg-brand-light focus-visible:ring-brand-light shadow-[0_5px_14px_rgba(124,58,237,0.14)]',
		secondary:
			'border border-border bg-ink-800/70 text-slate-100 hover:border-brand-light/55 hover:bg-brand/10 focus-visible:ring-brand-light',
		ghost: 'text-slate-300 hover:bg-white/5 hover:text-white focus-visible:ring-brand-light'
	};

	const sizeClasses: Record<Size, string> = {
		sm: 'h-8 px-3 text-xs',
		md: 'h-10 px-4 text-sm',
		icon: 'h-10 w-10 p-0'
	};
</script>

<button
	{type}
	{disabled}
	class={[
		'inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 disabled:cursor-not-allowed disabled:opacity-45',
		variantClasses[variant],
		sizeClasses[size],
		className
	]}
	{...rest}
>
	{@render children()}
</button>
