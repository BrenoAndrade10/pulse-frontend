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
	import { t } from '#lib/i18n/index.svelte.js';
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
		password: validateRequired(password, t('auth.login.passwordRequired'))
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
			formError = err instanceof AuthError ? err.message : t('auth.errors.loginFailed');
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
	<title>{t('auth.login.pageTitle')} · {APP_NAME}</title>
</svelte:head>

<AuthShell title={t('auth.login.title')} subtitle={t('auth.login.subtitle')}>
	<form class="flex flex-col gap-4.5" novalidate onsubmit={handleSubmit}>
		{#if justRegistered}
			<Alert variant="success">{t('auth.login.registered')}</Alert>
		{:else if passwordReset}
			<Alert variant="success">{t('auth.login.passwordReset')}</Alert>
		{:else if sessionExpired}
			<Alert>{t('auth.login.sessionExpired')}</Alert>
		{:else if twoFactorExpired}
			<Alert>{t('auth.twoFactor.expired')}</Alert>
		{/if}
		{#if formError}
			<Alert>{formError}</Alert>
		{/if}

		<TextField
			id="email"
			name="email"
			type="email"
			label={t('auth.fields.email')}
			placeholder={t('auth.fields.emailPlaceholder')}
			autocomplete="email"
			bind:value={email}
			error={submitted ? errors.email : undefined}
		/>

		<TextField
			id="password"
			name="password"
			type="password"
			label={t('auth.fields.password')}
			placeholder={t('auth.login.passwordPlaceholder')}
			autocomplete="current-password"
			bind:value={password}
			error={submitted ? errors.password : undefined}
		/>

		<div class="flex items-center justify-between gap-3 text-[13.5px]">
			<Checkbox id="remember" name="remember" bind:checked={remember}
				>{t('auth.login.remember')}</Checkbox
			>
			<a class="font-semibold" href="/esqueci-senha" onclick={rememberEmail}>
				{t('auth.login.forgot')}
			</a>
		</div>

		<Button type="submit" fullWidth loading={submitting} disabled={retrySeconds > 0}
			>{submitting ? t('auth.login.submitting') : t('auth.login.submit')}</Button
		>
	</form>

	{#snippet footer()}
		{t('auth.login.noAccount')}
		<a class="font-semibold" href="/register">{t('auth.login.createAccount')}</a>
	{/snippet}
</AuthShell>
