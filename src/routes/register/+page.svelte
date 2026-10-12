<script lang="ts">
	import { goto } from '$app/navigation';
	import AuthShell from '#lib/components/auth/AuthShell.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Checkbox from '#lib/components/ui/Checkbox.svelte';
	import TextField from '#lib/components/ui/TextField.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { AuthError, register } from '#lib/services/auth.js';
	import {
		getPasswordStrength,
		MIN_PASSWORD_LENGTH,
		validateEmail,
		validatePassword,
		validateRequired
	} from '#lib/utils/validation.js';

	let name = $state('');
	let email = $state('');
	let company = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let acceptTerms = $state(false);
	let submitting = $state(false);
	let submitted = $state(false);
	let formError = $state<string>();

	const strength = $derived(getPasswordStrength(password));

	const errors = $derived({
		name: validateRequired(name, 'Informe seu nome.'),
		email: validateEmail(email),
		password: validatePassword(password),
		confirmPassword: !confirmPassword
			? 'Confirme sua senha.'
			: confirmPassword !== password
				? 'As senhas não coincidem.'
				: undefined,
		acceptTerms: acceptTerms ? undefined : 'Você precisa aceitar os termos para continuar.'
	});

	const hasErrors = $derived(Object.values(errors).some(Boolean));

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		formError = undefined;

		if (hasErrors) return;

		submitting = true;
		try {
			await register({ name: name.trim(), email: email.trim(), company: company.trim(), password });
			await goto('/login?registered=1');
		} catch (err) {
			formError =
				err instanceof AuthError
					? err.message
					: 'Não foi possível criar sua conta. Tente novamente.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Criar conta · {APP_NAME}</title>
</svelte:head>

<AuthShell title="Crie sua conta" subtitle="Comece a escalar seus resultados em poucos minutos.">
	<form class="flex flex-col gap-4.5" novalidate onsubmit={handleSubmit}>
		{#if formError}
			<Alert>{formError}</Alert>
		{/if}

		<TextField
			id="name"
			name="name"
			label="Nome completo"
			placeholder="Como devemos te chamar?"
			autocomplete="name"
			bind:value={name}
			error={submitted ? errors.name : undefined}
		/>

		<TextField
			id="email"
			name="email"
			type="email"
			label="E-mail profissional"
			placeholder="voce@empresa.com"
			autocomplete="email"
			bind:value={email}
			error={submitted ? errors.email : undefined}
		/>

		<TextField
			id="company"
			name="company"
			label="Empresa ou agência (opcional)"
			placeholder="Nome da sua empresa"
			autocomplete="organization"
			bind:value={company}
		/>

		<div class="flex flex-col gap-2">
			<TextField
				id="password"
				name="password"
				type="password"
				label="Senha"
				placeholder="Crie uma senha"
				autocomplete="new-password"
				bind:value={password}
				error={submitted ? errors.password : undefined}
				hint="Mínimo de {MIN_PASSWORD_LENGTH} caracteres."
			/>
			{#if password}
				<div
					class={[
						'flex items-center gap-3',
						'[--level-color:var(--color-danger)] data-[score=2]:[--level-color:var(--color-warning)]',
						'data-[score=3]:[--level-color:var(--color-success)] data-[score=4]:[--level-color:var(--color-success)]'
					]}
					data-score={strength.score}
					aria-live="polite"
				>
					<div class="grid flex-1 grid-cols-[repeat(4,1fr)] gap-1.5" aria-hidden="true">
						{#each [1, 2, 3, 4] as level (level)}
							<span
								class={[
									'h-1 rounded-[2px] [transition:background_0.2s]',
									strength.score >= level ? 'bg-(--level-color)' : 'bg-border'
								]}
							></span>
						{/each}
					</div>
					<span class="text-[12px] whitespace-nowrap text-fg-muted">Força: {strength.label}</span>
				</div>
			{/if}
		</div>

		<TextField
			id="confirm-password"
			name="confirmPassword"
			type="password"
			label="Confirmar senha"
			placeholder="Repita a senha"
			autocomplete="new-password"
			bind:value={confirmPassword}
			error={submitted ? errors.confirmPassword : undefined}
		/>

		<Checkbox
			id="terms"
			name="terms"
			bind:checked={acceptTerms}
			error={submitted ? errors.acceptTerms : undefined}
		>
			Li e aceito os
			<a class="font-semibold" href="/termos" target="_blank" rel="noopener">Termos de uso</a>
			e a
			<a class="font-semibold" href="/privacidade" target="_blank" rel="noopener"
				>Política de privacidade</a
			>.
		</Checkbox>

		<Button type="submit" fullWidth loading={submitting}>
			{submitting ? 'Criando conta…' : 'Criar conta'}
		</Button>
	</form>

	{#snippet footer()}
		Já tem uma conta? <a class="font-semibold" href="/login">Entrar</a>
	{/snippet}
</AuthShell>
