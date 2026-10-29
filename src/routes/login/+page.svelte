<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AuthShell from '#lib/components/auth/AuthShell.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Checkbox from '#lib/components/ui/Checkbox.svelte';
	import TextField from '#lib/components/ui/TextField.svelte';
	import { setTwoFactorChallenge } from '#lib/auth/twoFactorChallenge.js';
	import { APP_NAME } from '#lib/config.js';
	import { AuthError, login, PASSWORD_RESET_EMAIL_STORAGE_KEY } from '#lib/services/auth.js';
	import { safeRedirectPath } from '#lib/utils/redirect.js';
	import { validateEmail, validateRequired } from '#lib/utils/validation.js';

	let email = $state('');
	let password = $state('');
	let remember = $state(false);
	let submitting = $state(false);
	let submitted = $state(false);
	let formError = $state<string>();
	let retryUntil = $state(0);
	let retrySeconds = $state(0);

	const justRegistered = $derived(page.url.searchParams.get('registered') === '1');
	const sessionExpired = $derived(page.url.searchParams.get('expired') === '1');
	const passwordReset = $derived(page.url.searchParams.get('passwordReset') === '1');
	const twoFactorExpired = $derived(page.url.searchParams.get('twoFactorExpired') === '1');

	const errors = $derived({
		email: validateEmail(email),
		password: validateRequired(password, 'Informe sua senha.')
	});

	onMount(() => {
		const interval = window.setInterval(() => {
			retrySeconds = Math.max(0, Math.ceil((retryUntil - Date.now()) / 1000));
		}, 1000);
		return () => window.clearInterval(interval);
	});

	function rememberEmail() {
		try {
			if (email.trim()) sessionStorage.setItem(PASSWORD_RESET_EMAIL_STORAGE_KEY, email.trim());
			else sessionStorage.removeItem(PASSWORD_RESET_EMAIL_STORAGE_KEY);
		} catch {
			return;
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		formError = undefined;

		if (errors.email || errors.password) return;

		submitting = true;
		try {
			const challenge = await login({ email: email.trim(), password, remember });
			if (challenge) {
				setTwoFactorChallenge(challenge);
				password = '';
				await goto('/login/2fa');
				return;
			}
			await goto(safeRedirectPath(page.url.searchParams.get('redirectTo'), page.url.origin), {
				replaceState: true
			});
		} catch (err) {
			// Não mantém a senha em memória/na tela após uma tentativa falha.
			password = '';
			submitted = false;
			formError =
				err instanceof AuthError ? err.message : 'Não foi possível entrar. Tente novamente.';
			if (err instanceof AuthError && err.retryAfterSeconds) {
				retryUntil = Date.now() + err.retryAfterSeconds * 1000;
				retrySeconds = err.retryAfterSeconds;
			}
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Entrar · {APP_NAME}</title>
</svelte:head>

<AuthShell title="Bem-vindo de volta" subtitle="Entre para acompanhar suas campanhas.">
	<form class="flex flex-col gap-4.5" novalidate onsubmit={handleSubmit}>
		{#if justRegistered}
			<Alert variant="success">Conta criada com sucesso! Faça login para continuar.</Alert>
		{:else if passwordReset}
			<Alert variant="success">Senha alterada. Entre com a nova senha.</Alert>
		{:else if sessionExpired}
			<Alert>Sua sessão expirou. Entre novamente para continuar.</Alert>
		{:else if twoFactorExpired}
			<Alert>Sua verificação expirou. Entre novamente.</Alert>
		{/if}
		{#if formError}
			<Alert>{formError}</Alert>
		{/if}

		<TextField
			id="email"
			name="email"
			type="email"
			label="E-mail"
			placeholder="voce@empresa.com"
			autocomplete="email"
			bind:value={email}
			error={submitted ? errors.email : undefined}
		/>

		<TextField
			id="password"
			name="password"
			type="password"
			label="Senha"
			placeholder="Sua senha"
			autocomplete="current-password"
			bind:value={password}
			error={submitted ? errors.password : undefined}
		/>

		<div class="flex items-center justify-between gap-3 text-[13.5px]">
			<Checkbox id="remember" name="remember" bind:checked={remember}>Lembrar de mim</Checkbox>
			<a class="font-semibold" href="/esqueci-senha" onclick={rememberEmail}>
				Esqueci minha senha
			</a>
		</div>

		<Button type="submit" fullWidth loading={submitting} disabled={retrySeconds > 0}
			>{submitting ? 'Entrando…' : 'Entrar'}</Button
		>
	</form>

	{#snippet footer()}
		Ainda não tem conta? <a class="font-semibold" href="/register">Criar conta grátis</a>
	{/snippet}
</AuthShell>
