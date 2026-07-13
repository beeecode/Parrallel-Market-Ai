<script lang="ts">
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';
	import type { ActionResult, SubmitFunction } from '@sveltejs/kit';
	import { CheckCircle2 } from 'lucide-svelte';

	import AgentMessage from '$lib/components/request-agent/AgentMessage.svelte';
	import RequestAgentShell from '$lib/components/request-agent/RequestAgentShell.svelte';
	import RequestErrorState from '$lib/components/request-agent/RequestErrorState.svelte';
	import RequestNavigation from '$lib/components/request-agent/RequestNavigation.svelte';
	import RequestProgress from '$lib/components/request-agent/RequestProgress.svelte';
	import RequestReviewCard from '$lib/components/request-agent/RequestReviewCard.svelte';
	import RequestStepInput from '$lib/components/request-agent/RequestStepInput.svelte';
	import RequestSuccessState from '$lib/components/request-agent/RequestSuccessState.svelte';
	import UserAnswerBubble from '$lib/components/request-agent/UserAnswerBubble.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import {
		firstIncompleteRequestStep,
		nextRequestStepIndex,
		previousRequestStepIndex
	} from '$lib/features/request-agent/request-agent.store';
	import { requestAgentSteps } from '$lib/features/request-agent/request-agent.steps';
	import {
		deterministicSummaryPreview,
		formatRequestAnswer,
		requestProgressPercentage,
		reviewSectionsFromValues,
		validateRequestAgentStep,
		validateRequestAgentValues
	} from '$lib/features/request-agent/request-agent.utils';
	import type {
		RequestAgentActionResult,
		RequestAgentErrors,
		RequestAgentField,
		RequestAgentValues,
		SubmittedCustomRequestViewModel
	} from '$lib/types/request-agent';

	let {
		form,
		initialValues
	}: {
		form?: RequestAgentActionResult;
		initialValues: RequestAgentValues;
	} = $props();

	let values = $state<RequestAgentValues>(untrack(() => ({ ...initialValues })));
	let currentStepIndex = $state(untrack(() => firstIncompleteRequestStep(values)));
	let mode = $state<'question' | 'review' | 'success'>('question');
	let localErrors = $state<RequestAgentErrors>({});
	let pending = $state(false);
	let submittedRequest = $state<SubmittedCustomRequestViewModel | null>(null);
	let lastForm = $state<RequestAgentActionResult | undefined>();

	const currentStep = $derived(requestAgentSteps[currentStepIndex]);
	const progress = $derived(requestProgressPercentage(values));
	const reviewSections = $derived(reviewSectionsFromValues(values));
	const summaryPreview = $derived(deterministicSummaryPreview(values));
	const visibleErrors = $derived<RequestAgentErrors>({
		...((form && !form.success ? form.errors : {}) as RequestAgentErrors),
		...localErrors
	});

	$effect(() => {
		if (!form || form === lastForm) return;

		lastForm = form;
		values = { ...values, ...form.values };

		if (form.success) {
			submittedRequest = form.request;
			mode = 'success';
			localErrors = {};
			return;
		}

		mode = 'review';
		localErrors = form.errors;
	});

	function updateValue(field: RequestAgentField, value: string): void {
		values = { ...values, [field]: value };
		const nextErrors = { ...localErrors };
		delete nextErrors[field];
		delete nextErrors.form;
		localErrors = nextErrors;
	}

	function goToField(field: RequestAgentField): void {
		const index = requestAgentSteps.findIndex((step) => step.field === field);
		if (index >= 0) {
			currentStepIndex = index;
			mode = 'question';
		}
	}

	function goBack(): void {
		if (mode === 'review') {
			currentStepIndex = requestAgentSteps.length - 1;
			mode = 'question';
			return;
		}

		currentStepIndex = previousRequestStepIndex(currentStepIndex);
	}

	function continueFlow(): void {
		const error = validateRequestAgentStep(currentStep, values);
		if (error) {
			localErrors = { ...localErrors, [currentStep.field]: error };
			return;
		}

		localErrors = {};

		if (currentStepIndex === requestAgentSteps.length - 1) {
			const validation = validateRequestAgentValues(values);
			if (validation.errors) {
				const errors = validation.errors;
				localErrors = errors;
				const firstInvalid = requestAgentSteps.findIndex((step) => errors[step.field]);
				if (firstInvalid >= 0) currentStepIndex = firstInvalid;
				return;
			}
			mode = 'review';
			return;
		}

		currentStepIndex = nextRequestStepIndex(currentStepIndex);
	}

	function isSuccessResult(
		result: ActionResult<Record<string, unknown>>
	): result is ActionResult<RequestAgentActionResult> & {
		data: Extract<RequestAgentActionResult, { success: true }>;
	} {
		return (
			result.type === 'success' &&
			typeof result.data === 'object' &&
			result.data !== null &&
			Reflect.get(result.data, 'success') === true
		);
	}

	const enhanceSubmit: SubmitFunction = () => {
		pending = true;

		return async ({ result, update }) => {
			try {
				await update({ invalidateAll: false, reset: false });

				if (isSuccessResult(result)) {
					submittedRequest = result.data.request;
					values = result.data.values;
					mode = 'success';
					localErrors = {};
				}
			} finally {
				pending = false;
			}
		};
	};
</script>

<PageHeader
	title="Request Simulation"
	subtitle="Submit a custom market simulation request through a guided business intake assistant."
/>

<RequestAgentShell>
	{#snippet aside()}
		<div class="space-y-4">
			<section class="rounded-lg border border-border bg-ink-900/72 p-4">
				<div class="flex items-center gap-3">
					<div
						class="grid h-9 w-9 place-items-center rounded-lg border border-success/30 bg-success/12 text-green-300"
					>
						<CheckCircle2 aria-hidden="true" size={18} />
					</div>
					<div>
						<p class="text-sm font-semibold text-slate-100">Structured request</p>
						<p class="text-xs text-slate-400">{progress}% captured</p>
					</div>
				</div>
				<div class="mt-4">
					<RequestProgress
						current={mode === 'review' ? requestAgentSteps.length : currentStepIndex + 1}
						percent={progress}
						total={requestAgentSteps.length}
					/>
				</div>
			</section>

			<section class="rounded-lg border border-border bg-ink-900/72 p-4">
				<h2 class="text-sm font-semibold text-slate-100">Previous answers</h2>
				<div class="mt-4 space-y-2">
					{#each requestAgentSteps.filter( (step) => values[step.field]?.trim() ) as step (step.field)}
						<UserAnswerBubble
							field={step.field}
							label={step.title}
							onedit={goToField}
							value={formatRequestAnswer(step.field, values[step.field])}
						/>
					{:else}
						<p
							class="rounded-md border border-dashed border-border/80 px-3 py-4 text-xs leading-5 text-slate-500"
						>
							Your answers will appear here as you move through the assistant.
						</p>
					{/each}
				</div>
			</section>
		</div>
	{/snippet}

	{#if mode === 'success' && submittedRequest}
		<RequestSuccessState request={submittedRequest} />
	{:else if mode === 'review'}
		<section class="rounded-lg border border-border bg-ink-900/72 p-5">
			<div class="mb-5">
				<AgentMessage
					title="Review before submission"
					message="Check the structured request below. You can edit any answer before saving it to Payload."
					helper="Submitting creates a new custom simulation request with status: new."
				/>
			</div>

			<RequestErrorState message={visibleErrors.form} />

			<form class="mt-5 space-y-5" method="POST" use:enhance={enhanceSubmit}>
				<RequestReviewCard
					onedit={goToField}
					sections={reviewSections}
					summary={summaryPreview}
					{values}
				/>

				<div
					class="flex flex-col-reverse gap-3 border-t border-border/80 pt-5 sm:flex-row sm:items-center sm:justify-between"
				>
					<Button disabled={pending} onclick={goBack} type="button" variant="secondary">Back</Button
					>
					<Button disabled={pending} type="submit">
						{pending ? 'Submitting...' : 'Submit request'}
					</Button>
				</div>
			</form>
		</section>
	{:else}
		<section class="rounded-lg border border-border bg-ink-900/72 p-5">
			<RequestProgress
				current={currentStepIndex + 1}
				percent={progress}
				total={requestAgentSteps.length}
			/>

			<div class="mt-6">
				<AgentMessage
					title={`Question ${currentStepIndex + 1}`}
					message={currentStep.question}
					helper={currentStep.helper}
				/>
			</div>

			<div class="mt-6 rounded-lg border border-border/75 bg-ink-950/35 p-4">
				<RequestStepInput
					error={visibleErrors[currentStep.field]}
					onchange={(value) => updateValue(currentStep.field, value)}
					step={currentStep}
					value={values[currentStep.field]}
				/>
			</div>

			<div class="mt-6">
				<RequestNavigation
					canGoBack={currentStepIndex > 0}
					continueLabel={currentStepIndex === requestAgentSteps.length - 1
						? 'Review request'
						: 'Continue'}
					onback={goBack}
					oncontinue={continueFlow}
				/>
			</div>
		</section>
	{/if}
</RequestAgentShell>
