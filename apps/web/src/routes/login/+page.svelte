<script lang="ts">
	import type { ActionData } from './$types';

	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import LogoMark from '$lib/components/layout/LogoMark.svelte';
	import { APP_NAME } from '$lib/constants/app';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Sign in | Parallel Market AI</title>
</svelte:head>

<main class="grid min-h-screen place-items-center px-4 py-10">
	<section
		class="w-full max-w-md rounded-lg border border-border/90 bg-ink-900/88 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8"
	>
		<div class="flex items-center gap-3">
			<LogoMark />
			<span class="text-sm font-bold text-slate-100">{APP_NAME}</span>
		</div>
		<h1 class="mt-8 text-2xl font-bold text-slate-50">Welcome back</h1>
		<p class="mt-2 text-sm leading-6 text-slate-400">
			Sign in to review your market simulations and reports.
		</p>

		<LoginForm email={form?.email} error={form?.error} />
	</section>
</main>
