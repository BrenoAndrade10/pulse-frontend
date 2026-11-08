<script lang="ts">
	import { onMount } from 'svelte';
	import AuthShell from '#lib/components/auth/AuthShell.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import TextField from '#lib/components/ui/TextField.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { t } from '#lib/i18n/index.svelte.js';
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
			formError = error instanceof AuthError ? error.message : t('auth.errors.resetRequestFailed');
			if (error instanceof AuthError && error.retryAfterSeconds) {
				startCooldown(error.retryAfterSeconds);
			}
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>{t('auth.forgot.pageTitle')} · {APP_NAME}</title>
</svelte:head>

<AuthShell title={t('auth.forgot.title')} subtitle={t('auth.forgot.subtitle')}>
	<form class="flex flex-col gap-4.5" novalidate onsubmit={handleSubmit}>
		{#if sent}
			<Alert variant="success">
				{t('auth.forgot.sent')}
			</Alert>
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
			onblur={() => (touched = true)}
			error={submitted || touched ? emailError : undefined}
		/>

		<Button type="submit" fullWidth loading={submitting} disabled={cooldownSeconds > 0}>
			{sent
				? cooldownSeconds > 0
					? t('auth.forgot.resendIn', { seconds: cooldownSeconds })
					: t('auth.forgot.resend')
				: t('auth.forgot.submit')}
		</Button>
	</form>

	{#snippet footer()}
		<a class="font-semibold" href="/login">{t('auth.forgot.backToLogin')}</a>
	{/snippet}
</AuthShell>
