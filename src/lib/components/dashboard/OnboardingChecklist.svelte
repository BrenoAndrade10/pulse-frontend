<script lang="ts">
	import Icon from '#lib/components/ui/Icon.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import { t } from '#lib/i18n/index.svelte.js';
	import type { OnboardingStep } from '#lib/onboarding/steps.js';

	type Props = { steps: OnboardingStep[]; ondismiss: () => void; onfinish: () => void };

	let { steps, ondismiss, onfinish }: Props = $props();

	const completed = $derived(steps.filter((s) => s.done).length);
	const allDone = $derived(steps.length > 0 && completed === steps.length);
	const nextId = $derived(steps.find((s) => !s.done)?.id ?? null);
</script>

<section
	class={[
		'relative mb-6 grid grid-cols-[minmax(0,340px)_minmax(0,1fr)] gap-8 overflow-hidden p-6.5',
		'rounded-lg border border-[rgb(124_92_255/0.3)]',
		'[background:radial-gradient(500px_220px_at_0%_0%,rgb(124_92_255/0.16),transparent_70%),radial-gradient(400px_200px_at_100%_100%,rgb(255_77_157/0.08),transparent_70%),var(--color-bg-elevated)]',
		'max-xl:grid-cols-[1fr] max-xl:gap-5 max-[641px]:p-5'
	]}
	aria-labelledby="onboarding-title"
>
	<div>
		<p class="mb-1.5 text-[11.5px] font-bold tracking-[0.08em] text-primary-hover uppercase">
			{allDone ? t('dashboard.checklist.allDoneEyebrow') : t('dashboard.checklist.eyebrow')}
		</p>
		<h2 id="onboarding-title" class="text-[20px] font-extrabold tracking-[-0.02em]">
			{allDone ? t('dashboard.checklist.allDoneTitle') : t('dashboard.checklist.title')}
		</h2>
		<p class="mt-2 mb-5 text-[13.5px] text-fg-muted">
			{allDone ? t('dashboard.checklist.allDoneDescription') : t('dashboard.checklist.description')}
		</p>
		<div
			class="h-1.5 overflow-hidden rounded-[3px] bg-border"
			role="progressbar"
			aria-valuemin="0"
			aria-valuemax={steps.length}
			aria-valuenow={completed}
			aria-label={t('dashboard.checklist.progress')}
		>
			<span
				class="block h-full bg-gradient-brand [transition:width_0.3s] motion-reduce:transition-none"
				style:width="{(completed / steps.length) * 100}%"
			></span>
		</div>
		<p class="mt-2 text-[12.5px] text-fg-subtle">
			{t('dashboard.checklist.progressCount', { completed, total: steps.length })}
		</p>
		{#if allDone}
			<div class="mt-5">
				<Button size="sm" onclick={onfinish}>{t('dashboard.checklist.finish')}</Button>
			</div>
		{:else}
			<div class="mt-5">
				<Button variant="ghost" size="sm" onclick={ondismiss}
					>{t('dashboard.checklist.dismiss')}</Button
				>
			</div>
		{/if}
	</div>

	<ol class="flex flex-col gap-2.5">
		{#each steps as step, i (step.id)}
			{@const next = step.id === nextId}
			<li
				class={[
					'flex items-center gap-3.5 px-4 py-3.5 max-[641px]:flex-wrap',
					'rounded-md border',
					next
						? 'border-[rgb(124_92_255/0.55)] bg-[rgb(124_92_255/0.1)]'
						: 'border-border bg-[rgb(255_255_255/0.02)]'
				]}
				aria-current={next ? 'step' : undefined}
			>
				<span
					class={[
						'grid size-7 shrink-0 place-items-center rounded-full border text-[12.5px] font-bold',
						step.done
							? 'border-transparent bg-success text-[#06281a]'
							: next
								? 'border-primary text-primary-hover'
								: 'border-border-strong text-fg-muted'
					]}
					aria-hidden="true"
				>
					{#if step.done}<Icon name="check" size={14} />{:else}{i + 1}{/if}
				</span>
				<div class="min-w-0 flex-1">
					{#if next}
						<p class="mb-0.5 text-[11px] font-bold tracking-[0.06em] text-primary-hover uppercase">
							{t('dashboard.checklist.next')}
						</p>
					{/if}
					<p class={['text-[14px] font-bold', step.done && 'text-fg-muted line-through']}>
						{step.title}
						{#if step.done}<span class="sr-only">{t('dashboard.checklist.doneSr')}</span>{/if}
					</p>
					<p class="mt-0.5 text-[12.5px] text-fg-subtle">{step.description}</p>
				</div>
				{#if !step.done}
					<a
						class={[
							buttonClass({ variant: next ? 'primary' : 'secondary', size: 'sm' }),
							'max-[641px]:ml-10.5'
						]}
						href={step.href}>{step.cta}</a
					>
				{/if}
			</li>
		{/each}
	</ol>
</section>
