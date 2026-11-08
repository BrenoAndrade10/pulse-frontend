<script lang="ts">
	import { goto } from '$app/navigation';
	import AuthShell from '#lib/components/auth/AuthShell.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Checkbox from '#lib/components/ui/Checkbox.svelte';
	import TextField from '#lib/components/ui/TextField.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { t } from '#lib/i18n/index.svelte.js';
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
		name: validateRequired(name, t('auth.register.nameRequired')),
		email: validateEmail(email),
		password: validatePassword(password),
		confirmPassword: !confirmPassword
			? t('auth.register.confirmRequired')
			: confirmPassword !== password
				? t('auth.register.mismatch')
				: undefined,
		acceptTerms: acceptTerms ? undefined : t('auth.register.termsRequired')
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
			formError = err instanceof AuthError ? err.message : t('auth.errors.registerFailed');
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>{t('auth.register.pageTitle')} · {APP_NAME}</title>
</svelte:head>

<AuthShell title={t('auth.register.title')} subtitle={t('auth.register.subtitle')}>
	<form class="flex flex-col gap-4.5" novalidate onsubmit={handleSubmit}>
		{#if formError}
			<Alert>{formError}</Alert>
		{/if}

		<TextField
			id="name"
			name="name"
			label={t('auth.register.name')}
			placeholder={t('auth.register.namePlaceholder')}
			autocomplete="name"
			bind:value={name}
			error={submitted ? errors.name : undefined}
		/>

		<TextField
			id="email"
			name="email"
			type="email"
			label={t('auth.register.email')}
			placeholder={t('auth.fields.emailPlaceholder')}
			autocomplete="email"
			bind:value={email}
			error={submitted ? errors.email : undefined}
		/>

		<TextField
			id="company"
			name="company"
			label={t('auth.register.company')}
			placeholder={t('auth.register.companyPlaceholder')}
			autocomplete="organization"
			bind:value={company}
		/>

		<div class="flex flex-col gap-2">
			<TextField
				id="password"
				name="password"
				type="password"
				label={t('auth.fields.password')}
				placeholder={t('auth.fields.createPasswordPlaceholder')}
				autocomplete="new-password"
				bind:value={password}
				error={submitted ? errors.password : undefined}
				hint={t('auth.fields.passwordHint', { min: MIN_PASSWORD_LENGTH })}
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
					<span class="text-[12px] whitespace-nowrap text-fg-muted"
						>{t('auth.fields.strength', { label: strength.label })}</span
					>
				</div>
			{/if}
		</div>

		<TextField
			id="confirm-password"
			name="confirmPassword"
			type="password"
			label={t('auth.fields.confirmPassword')}
			placeholder={t('auth.fields.repeatPasswordPlaceholder')}
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
			{t('auth.register.termsPrefix')}
			<a class="font-semibold" href="/termos" target="_blank" rel="noopener"
				>{t('auth.register.termsLink')}</a
			>
			{t('auth.register.termsMiddle')}
			<a class="font-semibold" href="/privacidade" target="_blank" rel="noopener"
				>{t('auth.register.privacyLink')}</a
			>.
		</Checkbox>

		<Button type="submit" fullWidth loading={submitting}>
			{submitting ? t('auth.register.submitting') : t('auth.register.submit')}
		</Button>
	</form>

	{#snippet footer()}
		{t('auth.register.haveAccount')}
		<a class="font-semibold" href="/login">{t('auth.register.signIn')}</a>
	{/snippet}
</AuthShell>
