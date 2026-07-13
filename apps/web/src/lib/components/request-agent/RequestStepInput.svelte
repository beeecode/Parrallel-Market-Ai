<script lang="ts">
	import FormError from '$lib/components/ui/FormError.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import type { RequestAgentStep } from '$lib/types/request-agent';

	let {
		error,
		onchange,
		step,
		value
	}: {
		error?: string;
		onchange: (value: string) => void;
		step: RequestAgentStep;
		value: string;
	} = $props();

	const inputId = $derived(`request-agent-${step.field}`);
	const errorId = $derived(`${inputId}-error`);
</script>

<div>
	<label class="text-sm font-semibold text-slate-100" for={inputId}>{step.title}</label>
	{#if step.inputKind === 'textarea'}
		<Textarea
			aria-describedby={error ? errorId : undefined}
			aria-invalid={Boolean(error)}
			class="mt-3 min-h-36"
			id={inputId}
			maxlength={step.maxLength}
			oninput={(event) => onchange(event.currentTarget.value)}
			placeholder={step.placeholder}
			{value}
		/>
	{:else if step.inputKind === 'select'}
		<Select
			aria-describedby={error ? errorId : undefined}
			aria-invalid={Boolean(error)}
			class="mt-3"
			id={inputId}
			onchange={(event) => onchange(event.currentTarget.value)}
			{value}
		>
			<option value="">Choose one</option>
			{#each step.options ?? [] as option (option.value)}
				<option value={option.value}>{option.label}</option>
			{/each}
		</Select>
	{:else}
		<Input
			aria-describedby={error ? errorId : undefined}
			aria-invalid={Boolean(error)}
			class="mt-3"
			id={inputId}
			inputmode={step.inputKind === 'number' ? 'decimal' : undefined}
			maxlength={step.maxLength}
			oninput={(event) => onchange(event.currentTarget.value)}
			placeholder={step.placeholder}
			type={step.inputKind}
			{value}
		/>
	{/if}
	<FormError id={errorId} message={error} />
</div>
