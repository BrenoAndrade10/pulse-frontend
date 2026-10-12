<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AuthShell from '#lib/components/auth/AuthShell.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Checkbox from '#lib/components/ui/Checkbox.svelte';
	import TextField from '#lib/components/ui/TextField.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { AuthError, login } from '#lib/services/auth.js';
	import { safeRedirectPath } from '#lib/utils/redirect.js';
	import { validateEmail, validateRequired } from '#lib/utils/validation.js';

	let email = $state('');
	let password = $state('');
	let remember = $state(false);
	let submitting = $state(false);
	let submitted = $state(false);
	let formError = $state<string>();

	const justRegistered = $derived(page.url.searchParams.get('registered') === '1');
	const sessionExpired = $derived(page.url.searchParams.get('expired') === '1');

	const errors = $derived({
		email: validateEmail(email),
		password: validateRequired(password, 'Informe sua senha.')
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		formError = undefined;

		if (errors.email || errors.password) return;

		submitting = true;
		try {
			await login({ email: email.trim(), password, remember });
			await goto(safeRedirectPath(page.url.searchParams.get('redirectTo'), page.url.origin), {
				replaceState: true
			});
		} catch (err) {
			// Não mantém a senha em memória/na tela após uma tentativa falha.
			password = '';
			submitted = false;
			formError =
				err instanceof AuthError ? err.message : 'Não foi possível entrar. Tente novamente.';
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
		{:else if sessionExpired}
			<Alert>Sua sessão expirou. Entre novamente para continuar.</Alert>
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
			<a class="font-semibold" href="/recuperar-senha">Esqueci a senha</a>
		</div>

		<Button type="submit" fullWidth loading={submitting}
			>{submitting ? 'Entrando…' : 'Entrar'}</Button
		>
	</form>

	{#snippet footer()}
		Ainda não tem conta? <a class="font-semibold" href="/register">Criar conta grátis</a>
	{/snippet}
</AuthShell>
