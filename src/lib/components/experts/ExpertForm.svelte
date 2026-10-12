<script lang="ts">
	import { untrack } from 'svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import Card from '#lib/components/ui/Card.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import TextField from '#lib/components/ui/TextField.svelte';
	import type { Expert, ExpertInput } from '#lib/types.js';
	import { parseDecimal, toDecimalInput } from '#lib/utils/format.js';
	import { validateEmail, validateRequired } from '#lib/utils/validation.js';
	import FacebookConnectionCard from './FacebookConnectionCard.svelte';

	type Props = {
		expert?: Expert;
		submitLabel: string;
		cancelHref: string;
		onsubmit: (input: ExpertInput) => Promise<void>;
	};

	let { expert, submitLabel, cancelHref, onsubmit }: Props = $props();

	const NICHES = [
		'Negócios e marketing',
		'Finanças e investimentos',
		'Saúde e bem-estar',
		'Fitness e emagrecimento',
		'Relacionamento',
		'Desenvolvimento pessoal',
		'Educação e concursos',
		'Beleza e estética',
		'Espiritualidade',
		'Outro'
	];
	const nicheOptions = [
		{ value: '', label: 'Selecione' },
		...NICHES.map((n) => ({ value: n, label: n }))
	];

	// Valores iniciais copiados uma única vez; o formulário é recriado ao trocar de expert.
	const initial = untrack(() => expert);

	let form = $state({
		name: initial?.name ?? '',
		email: initial?.email ?? '',
		niche: initial?.niche ?? '',
		instagram: initial?.instagram ?? '',
		adAccountId: initial?.adAccountId ?? '',
		pixelId: initial?.pixelId ?? '',
		roas: toDecimalInput(initial?.goals.roas ?? null),
		maxCpl: toDecimalInput(initial?.goals.maxCpl ?? null),
		dailyBudget: toDecimalInput(initial?.goals.dailyBudget ?? null)
	});

	let submitted = $state(false);
	let submitting = $state(false);
	let formError = $state<string>();

	const numbers = $derived({
		roas: parseDecimal(form.roas),
		maxCpl: parseDecimal(form.maxCpl),
		dailyBudget: parseDecimal(form.dailyBudget)
	});

	const positiveNumber = (value: number | null) =>
		value != null && (Number.isNaN(value) || value <= 0)
			? 'Informe um número maior que zero.'
			: undefined;

	const errors = $derived({
		name: validateRequired(form.name, 'Informe o nome do expert.'),
		email: form.email.trim() ? validateEmail(form.email) : undefined,
		adAccountId:
			form.adAccountId.trim() && !/^(act_)?\d+$/.test(form.adAccountId.trim())
				? 'Use o formato act_123456789 ou apenas os números.'
				: undefined,
		pixelId:
			form.pixelId.trim() && !/^\d+$/.test(form.pixelId.trim())
				? 'O ID do pixel contém apenas números.'
				: undefined,
		roas: positiveNumber(numbers.roas),
		maxCpl: positiveNumber(numbers.maxCpl),
		dailyBudget: positiveNumber(numbers.dailyBudget)
	});

	const show = (error: string | undefined) => (submitted ? error : undefined);

	function normalizeAdAccount(value: string) {
		const digits = value.trim().replace(/^act_/, '');
		return digits ? `act_${digits}` : '';
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		formError = undefined;

		if (Object.values(errors).some(Boolean)) return;

		submitting = true;
		try {
			await onsubmit({
				name: form.name.trim(),
				email: form.email.trim(),
				niche: form.niche,
				instagram: form.instagram.trim().replace(/^@/, ''),
				adAccountId: normalizeAdAccount(form.adAccountId),
				pixelId: form.pixelId.trim(),
				goals: {
					roas: numbers.roas,
					maxCpl: numbers.maxCpl,
					dailyBudget: numbers.dailyBudget
				}
			});
		} catch {
			formError = 'Não foi possível salvar o expert. Tente novamente.';
		} finally {
			submitting = false;
		}
	}
</script>

<form class="flex flex-col gap-5" novalidate onsubmit={handleSubmit}>
	{#if formError}
		<Alert>{formError}</Alert>
	{/if}

	<Card title="Dados do expert" description="Informações de identificação.">
		<div class="grid grid-cols-2 gap-x-5 gap-y-4.5 max-[721px]:grid-cols-1">
			<TextField
				id="name"
				label="Nome *"
				placeholder="Ex.: Ana Souza"
				bind:value={form.name}
				error={show(errors.name)}
			/>
			<TextField
				id="email"
				type="email"
				label="E-mail"
				placeholder="contato@expert.com"
				bind:value={form.email}
				error={show(errors.email)}
			/>
			<Select id="niche" label="Nicho" bind:value={form.niche} options={nicheOptions} />
			<TextField
				id="instagram"
				label="Instagram"
				placeholder="@usuario"
				bind:value={form.instagram}
			/>
		</div>
	</Card>

	<Card
		id="facebook"
		title="Conta do Facebook"
		description="Conexão com a Meta e ativos usados nas campanhas deste expert."
	>
		<div class="flex flex-col gap-5">
			<FacebookConnectionCard expertId={expert?.id ?? null} connection={expert?.facebook ?? null} />
			<div class="grid grid-cols-2 gap-x-5 gap-y-4.5 max-[721px]:grid-cols-1">
				<TextField
					id="ad-account"
					label="ID da conta de anúncios"
					placeholder="act_123456789"
					bind:value={form.adAccountId}
					error={show(errors.adAccountId)}
					hint="Encontrado no Gerenciador de Anúncios."
				/>
				<TextField
					id="pixel"
					label="ID do Pixel"
					placeholder="123456789012345"
					inputmode="numeric"
					bind:value={form.pixelId}
					error={show(errors.pixelId)}
				/>
			</div>
		</div>
	</Card>

	<Card title="Metas" description="Usadas para destacar campanhas fora do esperado.">
		<div class="grid grid-cols-3 gap-x-5 gap-y-4.5 max-[721px]:grid-cols-1">
			<TextField
				id="roas"
				label="ROAS alvo"
				placeholder="Ex.: 3,5"
				inputmode="decimal"
				bind:value={form.roas}
				error={show(errors.roas)}
			/>
			<TextField
				id="max-cpl"
				label="CPL máximo (R$)"
				placeholder="Ex.: 4,50"
				inputmode="decimal"
				bind:value={form.maxCpl}
				error={show(errors.maxCpl)}
			/>
			<TextField
				id="daily-budget"
				label="Orçamento diário (R$)"
				placeholder="Ex.: 500"
				inputmode="decimal"
				bind:value={form.dailyBudget}
				error={show(errors.dailyBudget)}
			/>
		</div>
	</Card>

	<div class="flex justify-end gap-2.5">
		<a class={buttonClass({ variant: 'ghost' })} href={cancelHref}>Cancelar</a>
		<Button type="submit" loading={submitting}>{submitLabel}</Button>
	</div>
</form>
