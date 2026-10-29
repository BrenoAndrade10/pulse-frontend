<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import AuthShell from '#lib/components/auth/AuthShell.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Checkbox from '#lib/components/ui/Checkbox.svelte';
	import TextField from '#lib/components/ui/TextField.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { clearTwoFactorChallenge, getTwoFactorChallenge } from '#lib/auth/twoFactorChallenge.js';
	import { AuthError } from '#lib/services/auth.js';
	import {
		resendEmailChallenge,
		verifyChallenge,
		verifyEmailChallenge
	} from '#lib/services/twoFactor.js';

	const challenge = getTwoFactorChallenge()!;
	let code = $state('');
	let recoveryCode = $state('');
	let usingRecovery = $state(false);
	let trustDevice = $state(true);
	let busy = $state(false);
	let resending = $state(false);
	let errorMessage = $state<string>();
	let successMessage = $state<string>();
	let recoveryCodesRemaining = $state<number>();
	let showLowRecoveryWarning = $state(false);
	let remainingSeconds = $state(0);
	let retryUntil = $state(0);
	let retrySeconds = $state(0);
	let resendUntil = $state(Date.now() + 60_000);
	let resendSeconds = $state(60);

	const countdown = $derived(
		`${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`
	);
	const isEmailChallenge = $derived(challenge.next === 'email');

	onMount(() => {
		const tick = () => {
			remainingSeconds = Math.max(
				0,
				Math.ceil((new Date(challenge.expiresAt).getTime() - Date.now()) / 1000)
			);
			retrySeconds = Math.max(0, Math.ceil((retryUntil - Date.now()) / 1000));
			resendSeconds = Math.max(0, Math.ceil((resendUntil - Date.now()) / 1000));
			if (remainingSeconds === 0) void expireChallenge();
		};
		tick();
		const interval = window.setInterval(tick, 1000);
		focusCode();
		return () => window.clearInterval(interval);
	});

	function focusCode() {
		requestAnimationFrame(() => document.getElementById('two-factor-code')?.focus());
	}

	async function expireChallenge() {
		clearTwoFactorChallenge();
		await goto('/login?twoFactorExpired=1', { replaceState: true });
	}

	function handleError(error: unknown) {
		if (error instanceof AuthError && error.reason === 'AUTH_CHALLENGE_INVALID') {
			void expireChallenge();
			return;
		}
		errorMessage =
			error instanceof AuthError ? error.message : 'Não foi possível verificar. Tente novamente.';
		if (error instanceof AuthError && error.retryAfterSeconds) {
			retryUntil = Date.now() + error.retryAfterSeconds * 1000;
			retrySeconds = error.retryAfterSeconds;
		}
		if (
			error instanceof AuthError &&
			['TWO_FACTOR_CODE_INVALID', 'EMAIL_CODE_INVALID', 'EMAIL_LOGIN_CODE_INVALID'].includes(
				error.reason ?? ''
			)
		) {
			code = '';
			recoveryCode = '';
			focusCode();
		}
	}

	function updateCode(event: Event) {
		code = (event.currentTarget as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6);
		if (code.length === 6) queueMicrotask(() => void submitCode());
	}

	function updateRecoveryCode(event: Event) {
		recoveryCode = (event.currentTarget as HTMLInputElement).value
			.toUpperCase()
			.replace(/[^A-Z0-9-]/g, '')
			.slice(0, 11);
	}

	async function submitCode(event?: SubmitEvent) {
		event?.preventDefault();
		if (busy || retrySeconds > 0) return;
		if (usingRecovery ? !recoveryCode : !/^\d{6}$/.test(code)) return;
		busy = true;
		errorMessage = undefined;
		successMessage = undefined;
		try {
			if (isEmailChallenge) {
				await verifyEmailChallenge(challenge.challengeToken, code, trustDevice);
			} else {
				recoveryCodesRemaining = await verifyChallenge(challenge.challengeToken, {
					...(usingRecovery ? { recoveryCode } : { code }),
					trustDevice
				});
			}
			clearTwoFactorChallenge();
			if (usingRecovery && recoveryCodesRemaining !== undefined && recoveryCodesRemaining <= 3) {
				showLowRecoveryWarning = true;
			} else {
				await goto('/dashboard', { replaceState: true });
			}
		} catch (error) {
			handleError(error);
		} finally {
			busy = false;
		}
	}

	async function resendCode() {
		if (resending || resendSeconds > 0 || retrySeconds > 0) return;
		resending = true;
		errorMessage = undefined;
		successMessage = undefined;
		try {
			await resendEmailChallenge(challenge.challengeToken);
			resendUntil = Date.now() + 60_000;
			resendSeconds = 60;
			code = '';
			successMessage = 'Enviamos um novo código para o seu e-mail.';
			focusCode();
		} catch (error) {
			handleError(error);
		} finally {
			resending = false;
		}
	}

	function toggleRecovery() {
		usingRecovery = !usingRecovery;
		code = '';
		recoveryCode = '';
		errorMessage = undefined;
		successMessage = undefined;
		focusCode();
	}
</script>

<svelte:head><title>Verificação em duas etapas · {APP_NAME}</title></svelte:head>

<AuthShell
	title="Verificação em duas etapas"
	subtitle={isEmailChallenge
		? `Enviamos um código para ${challenge.emailHint ?? 'seu e-mail'}. Ele expira em ${countdown}.`
		: `Informe o código do aplicativo autenticador. Tempo restante: ${countdown}`}
>
	{#if errorMessage}<div class="mb-4"><Alert>{errorMessage}</Alert></div>{/if}
	{#if successMessage}<div class="mb-4"><Alert variant="success">{successMessage}</Alert></div>{/if}
	{#if retrySeconds > 0}
		<div class="mb-4"><Alert variant="warning">Tente novamente em {retrySeconds}s.</Alert></div>
	{/if}

	{#if showLowRecoveryWarning}
		<div class="flex flex-col gap-4">
			<Alert variant="warning">
				Restam {recoveryCodesRemaining} códigos de recuperação. Gere novos em Configurações → Segurança.
			</Alert>
			<Button fullWidth onclick={() => goto('/dashboard')}>Continuar</Button>
		</div>
	{:else}
		<form class="flex flex-col gap-4" onsubmit={submitCode}>
			{#if usingRecovery}
				<TextField
					id="two-factor-code"
					label="Código de recuperação"
					placeholder="XXXXX-XXXXX"
					autocomplete="one-time-code"
					maxlength={11}
					bind:value={recoveryCode}
					oninput={updateRecoveryCode}
				/>
			{:else}
				<TextField
					id="two-factor-code"
					label="Código de 6 dígitos"
					placeholder="000000"
					inputmode="numeric"
					autocomplete="one-time-code"
					maxlength={6}
					bind:value={code}
					oninput={updateCode}
				/>
			{/if}
			<Checkbox id="trust-device" bind:checked={trustDevice}
				>Confiar neste navegador por 30 dias</Checkbox
			>
			<Button type="submit" fullWidth loading={busy} disabled={retrySeconds > 0}>Verificar</Button>
			{#if isEmailChallenge}
				<Button
					variant="ghost"
					fullWidth
					loading={resending}
					disabled={resendSeconds > 0 || retrySeconds > 0}
					onclick={resendCode}
				>
					{resendSeconds > 0 ? `Reenviar código em ${resendSeconds}s` : 'Reenviar código'}
				</Button>
			{:else}
				<button
					type="button"
					class="cursor-pointer text-[13.5px] font-semibold text-primary-hover"
					onclick={toggleRecovery}
				>
					{usingRecovery ? 'Usar código do aplicativo' : 'Usar um código de recuperação'}
				</button>
			{/if}
		</form>
	{/if}
</AuthShell>
