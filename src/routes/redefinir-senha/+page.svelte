<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import AuthShell from '#lib/components/auth/AuthShell.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import TextField from '#lib/components/ui/TextField.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { AuthError, logout, resetPassword } from '#lib/services/auth.js';
	import {
		getPasswordStrength,
		MIN_PASSWORD_LENGTH,
		validatePassword
	} from '#lib/utils/validation.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let token = $state(untrack(() => data.token));
	let password = $state('');
	let confirmPassword = $state('');
	let passwordTouched = $state(false);
	let confirmationTouched = $state(false);
	let submitted = $state(false);
	let submitting = $state(false);
	let formError = $state<string>();
	let retryUntil = $state(0);
	let retrySeconds = $state(0);

	const strength = $derived(getPasswordStrength(password));
	const errors = $derived({
		password: validatePassword(password),
		confirmPassword: !confirmPassword
			? 'Confirme sua senha.'
			: confirmPassword !== password
				? 'As senhas não coincidem.'
				: undefined
	});

	onMount(() => {
		const interval = window.setInterval(() => {
			retrySeconds = Math.max(0, Math.ceil((retryUntil - Date.now()) / 1000));
		}, 1000);
		return () => window.clearInterval(interval);
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		formError = undefined;
		if (!token || errors.password || errors.confirmPassword || retrySeconds > 0) return;

		submitting = true;
		try {
			await resetPassword(token, password);
			token = null;
			password = '';
			confirmPassword = '';
			await logout();
			await goto('/login?passwordReset=1', { replaceState: true });
		} catch (error) {
			if (error instanceof AuthError && error.reason === 'PASSWORD_RESET_TOKEN_INVALID') {
				token = null;
				return;
			}
			formError =
				error instanceof AuthError
					? error.message
					: 'Não foi possível alterar sua senha. Tente novamente.';
			if (error instanceof AuthError && error.retryAfterSeconds) {
				retryUntil = Date.now() + error.retryAfterSeconds * 1000;
				retrySeconds = error.retryAfterSeconds;
			}
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Redefinir senha · {APP_NAME}</title>
	<meta name="referrer" content="no-referrer" />
</svelte:head>

<AuthShell
	title={token ? 'Crie uma nova senha' : 'Link inválido ou expirado'}
	subtitle={token
		? 'Escolha uma senha segura para voltar a acessar sua conta.'
		: 'Solicite um novo link para redefinir sua senha.'}
>
	{#if !token}
		<Alert>Este link de redefinição não é válido ou já expirou.</Alert>
		<div class="mt-4">
			<a class={buttonClass({ fullWidth: true })} href="/esqueci-senha">Pedir novo link</a>
		</div>
	{:else}
		<form class="flex flex-col gap-4.5" novalidate onsubmit={handleSubmit}>
			{#if formError}
				<Alert>{formError}</Alert>
			{/if}

			<div class="flex flex-col gap-2">
				<TextField
					id="password"
					name="password"
					type="password"
					label="Nova senha"
					placeholder="Crie uma senha"
					autocomplete="new-password"
					bind:value={password}
					onblur={() => (passwordTouched = true)}
					error={submitted || passwordTouched ? errors.password : undefined}
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
						<span class="text-[12px] whitespace-nowrap text-fg-muted">
							Força: {strength.label}
						</span>
					</div>
				{/if}
			</div>

			<TextField
				id="confirm-password"
				name="confirmPassword"
				type="password"
				label="Confirmar nova senha"
				placeholder="Repita a senha"
				autocomplete="new-password"
				bind:value={confirmPassword}
				onblur={() => (confirmationTouched = true)}
				error={submitted || confirmationTouched ? errors.confirmPassword : undefined}
			/>

			<Button type="submit" fullWidth loading={submitting} disabled={retrySeconds > 0}>
				Alterar senha
			</Button>
		</form>
	{/if}

	{#snippet footer()}
		<a class="font-semibold" href="/login">Voltar ao login</a>
	{/snippet}
</AuthShell>
