<script lang="ts">
	import { onMount } from 'svelte';
	import AuthShell from '#lib/components/auth/AuthShell.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import TextField from '#lib/components/ui/TextField.svelte';
	import { APP_NAME } from '#lib/config.js';
	import {
		AuthError,
		PASSWORD_RESET_EMAIL_STORAGE_KEY,
		requestPasswordReset
	} from '#lib/services/auth.js';
	import { validateEmail } from '#lib/utils/validation.js';

	let email = $state('');
	let touched = $state(false);
	let submitted = $state(false);
	let submitting = $state(false);
	let sent = $state(false);
	let formError = $state<string>();
	let cooldownUntil = $state(0);
	let cooldownSeconds = $state(0);

	const emailError = $derived(validateEmail(email));

	onMount(() => {
		try {
			email = sessionStorage.getItem(PASSWORD_RESET_EMAIL_STORAGE_KEY) ?? '';
			sessionStorage.removeItem(PASSWORD_RESET_EMAIL_STORAGE_KEY);
		} catch {
			email = '';
		}

		const interval = window.setInterval(() => {
			cooldownSeconds = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
		}, 1000);
		return () => window.clearInterval(interval);
	});

	function startCooldown(seconds: number) {
		cooldownUntil = Date.now() + seconds * 1000;
		cooldownSeconds = seconds;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		formError = undefined;
		if (emailError || cooldownSeconds > 0) return;

		submitting = true;
		try {
			await requestPasswordReset(email);
			sent = true;
			startCooldown(60);
		} catch (error) {
			formError =
				error instanceof AuthError
					? error.message
					: 'Não foi possível solicitar a redefinição. Tente novamente.';
			if (error instanceof AuthError && error.retryAfterSeconds) {
				startCooldown(error.retryAfterSeconds);
			}
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Esqueci minha senha · {APP_NAME}</title>
</svelte:head>

<AuthShell
	title="Esqueceu sua senha?"
	subtitle="Informe seu e-mail para receber as instruções de redefinição."
>
	<form class="flex flex-col gap-4.5" novalidate onsubmit={handleSubmit}>
		{#if sent}
			<Alert variant="success">
				Se existir uma conta com este e-mail, enviaremos as instruções para redefinir a senha.
			</Alert>
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
			onblur={() => (touched = true)}
			error={submitted || touched ? emailError : undefined}
		/>

		<Button type="submit" fullWidth loading={submitting} disabled={cooldownSeconds > 0}>
			{sent
				? cooldownSeconds > 0
					? `Reenviar em ${cooldownSeconds}s`
					: 'Reenviar'
				: 'Enviar link'}
		</Button>
	</form>

	{#snippet footer()}
		<a class="font-semibold" href="/login">Voltar ao login</a>
	{/snippet}
</AuthShell>
