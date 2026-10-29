<script lang="ts">
	import { onMount } from 'svelte';
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import RecoveryCodesPanel from '#lib/components/auth/RecoveryCodesPanel.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import TextField from '#lib/components/ui/TextField.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { AuthError } from '#lib/services/auth.js';
	import {
		confirmTwoFactor,
		getTwoFactorStatus,
		listTrustedDevices,
		regenerateRecoveryCodes,
		revokeTrustedDevice,
		setupTwoFactor,
		type TrustedDevice,
		type TwoFactorSetup,
		type TwoFactorStatus
	} from '#lib/services/twoFactor.js';
	import { formatDate } from '#lib/utils/format.js';

	let status = $state<TwoFactorStatus>();
	let devices = $state<TrustedDevice[]>([]);
	let loading = $state(true);
	let errorMessage = $state<string>();
	let code = $state('');
	let generating = $state(false);
	let recoveryCodes = $state<string[]>([]);
	let recoveryDialog = $state<HTMLDialogElement>();
	let setupDialog = $state<HTMLDialogElement>();
	let removeDialog = $state<HTMLDialogElement>();
	let removing = $state<TrustedDevice>();
	let revoking = $state(false);
	let setup = $state<TwoFactorSetup>();
	let setupQrCode = $state('');
	let setupCode = $state('');
	let settingUp = $state(false);
	let setupError = $state<string>();
	let setupRecoveryCodes = $state<string[]>([]);
	let copiedSecret = $state(false);

	const formattedSecret = $derived(setup?.secret.match(/.{1,4}/g)?.join(' ') ?? '');

	onMount(() => void loadSecurity());

	async function loadSecurity() {
		loading = true;
		errorMessage = undefined;
		try {
			[status, devices] = await Promise.all([getTwoFactorStatus(), listTrustedDevices()]);
		} catch {
			errorMessage = 'Não foi possível carregar as configurações de segurança.';
		} finally {
			loading = false;
		}
	}

	function updateCode(event: Event) {
		code = (event.currentTarget as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6);
	}

	function updateSetupCode(event: Event) {
		setupCode = (event.currentTarget as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6);
	}

	async function beginAuthenticatorSetup() {
		settingUp = true;
		setupError = undefined;
		setupRecoveryCodes = [];
		try {
			setup = await setupTwoFactor();
			const { default: QRCode } = await import('qrcode');
			setupQrCode = await QRCode.toDataURL(setup.otpauthUri, {
				width: 240,
				margin: 1,
				color: { dark: '#11111b', light: '#ffffff' }
			});
			setupDialog?.showModal();
			requestAnimationFrame(() => document.getElementById('setup-2fa-code')?.focus());
		} catch (error) {
			errorMessage =
				error instanceof AuthError ? error.message : 'Não foi possível iniciar a configuração.';
		} finally {
			settingUp = false;
		}
	}

	async function copySecret() {
		if (!setup) return;
		await navigator.clipboard.writeText(setup.secret);
		copiedSecret = true;
	}

	async function activateAuthenticator(event: SubmitEvent) {
		event.preventDefault();
		if (!/^\d{6}$/.test(setupCode) || settingUp) return;
		settingUp = true;
		setupError = undefined;
		try {
			setupRecoveryCodes = await confirmTwoFactor(setupCode);
			status = {
				enabled: true,
				confirmedAt: new Date().toISOString(),
				recoveryCodesRemaining: setupRecoveryCodes.length
			};
			setupCode = '';
		} catch (error) {
			setupError =
				error instanceof AuthError
					? error.message
					: 'Não foi possível ativar o aplicativo autenticador.';
			setupCode = '';
			requestAnimationFrame(() => document.getElementById('setup-2fa-code')?.focus());
		} finally {
			settingUp = false;
		}
	}

	function closeSetup() {
		setupDialog?.close();
		setup = undefined;
		setupQrCode = '';
		setupCode = '';
		setupError = undefined;
		setupRecoveryCodes = [];
		copiedSecret = false;
	}

	async function generateCodes(event: SubmitEvent) {
		event.preventDefault();
		if (!/^\d{6}$/.test(code) || generating) return;
		generating = true;
		errorMessage = undefined;
		try {
			recoveryCodes = await regenerateRecoveryCodes(code);
			code = '';
			status = status ? { ...status, recoveryCodesRemaining: recoveryCodes.length } : status;
		} catch (error) {
			errorMessage =
				error instanceof AuthError ? error.message : 'Não foi possível gerar novos códigos.';
		} finally {
			generating = false;
		}
	}

	function confirmRemove(device: TrustedDevice) {
		removing = device;
		removeDialog?.showModal();
	}

	async function removeDevice() {
		if (!removing) return;
		revoking = true;
		try {
			await revokeTrustedDevice(removing.id);
			devices = devices.filter((device) => device.id !== removing?.id);
			removeDialog?.close();
		} catch {
			errorMessage = 'Não foi possível remover o navegador confiável.';
			removeDialog?.close();
		} finally {
			revoking = false;
			removing = undefined;
		}
	}
</script>

<svelte:head>
	<title>Configurações · {APP_NAME}</title>
</svelte:head>

<PageHeader title="Configurações" description="Dados da sua conta, equipe e segurança." />

<section id="seguranca" class="max-w-[900px] scroll-mt-6" aria-labelledby="security-title">
	<h2 id="security-title" class="mb-4 text-[18px] font-bold">Segurança</h2>
	{#if errorMessage}<div class="mb-4"><Alert>{errorMessage}</Alert></div>{/if}
	{#if loading}
		<div
			class="h-40 animate-pulse rounded-lg border border-border bg-bg-elevated"
			aria-label="Carregando configurações de segurança"
		></div>
	{:else}
		<div class="flex flex-col gap-4">
			<Card
				title="Aplicativo autenticador (opcional)"
				description="Use um aplicativo autenticador no lugar do código enviado por e-mail."
			>
				<div class="flex flex-wrap items-center justify-between gap-4">
					<div class="flex items-center gap-3">
						<Badge variant={status?.enabled ? 'success' : 'neutral'}
							>{status?.enabled ? 'Ativado' : 'Desativado'}</Badge
						>
						{#if status?.enabled}<span class="text-[13px] text-fg-muted"
								>{status.recoveryCodesRemaining} códigos disponíveis</span
							>{/if}
					</div>
					{#if status?.enabled}<Button
							variant="secondary"
							onclick={() => recoveryDialog?.showModal()}>Gerar novos códigos de recuperação</Button
						>{:else}<Button loading={settingUp} onclick={beginAuthenticatorSetup}
							>Ativar app autenticador</Button
						>{/if}
				</div>
			</Card>

			<Card
				title="Navegadores confiáveis"
				description="Acessos que podem entrar sem solicitar o código por até 30 dias."
				flush
			>
				{#if devices.length === 0}
					<p class="px-5.5 pb-5.5 text-[13.5px] text-fg-muted">Nenhum navegador confiável.</p>
				{:else}
					<ul>
						{#each devices as device (device.id)}
							<li
								class="flex items-center justify-between gap-4 border-t border-border px-5.5 py-4 first:border-t-0 max-[560px]:items-start"
							>
								<div class="min-w-0">
									<div class="flex flex-wrap items-center gap-2">
										<strong>{device.label}</strong>{#if device.current}<Badge variant="success"
												>Este navegador</Badge
											>{/if}
									</div>
									<p class="mt-1 text-[12.5px] text-fg-muted">
										Último uso: {formatDate(device.lastUsedAt)} · Expira em: {formatDate(
											device.expiresAt
										)}
									</p>
								</div>
								<Button size="sm" variant="ghost" onclick={() => confirmRemove(device)}
									>Remover</Button
								>
							</li>
						{/each}
					</ul>
				{/if}
			</Card>
		</div>
	{/if}
</section>

<dialog
	class="m-auto w-[min(560px,calc(100vw-32px))] rounded-lg border border-border-strong bg-bg-elevated p-6 text-fg backdrop:bg-[rgb(5_5_10/0.7)]"
	bind:this={setupDialog}
	aria-labelledby="setup-title"
>
	<h2 id="setup-title" class="text-[18px] font-bold">Ativar app autenticador</h2>
	{#if setupError}<div class="mt-4"><Alert>{setupError}</Alert></div>{/if}
	{#if setupRecoveryCodes.length}
		<div class="mt-4">
			<RecoveryCodesPanel
				codes={setupRecoveryCodes}
				continueLabel="Concluir"
				oncontinue={closeSetup}
			/>
		</div>
	{:else if setup}
		<form class="mt-4 flex flex-col gap-4" onsubmit={activateAuthenticator}>
			<p class="text-[13.5px] text-fg-muted">
				Escaneie o QR Code com seu aplicativo autenticador e informe o código gerado.
			</p>
			<div class="flex justify-center">
				{#if setupQrCode}<img
						class="size-52 rounded-md bg-white p-2"
						src={setupQrCode}
						alt="QR Code para configurar o aplicativo autenticador"
					/>{/if}
			</div>
			<details class="rounded-md border border-border bg-surface p-3">
				<summary class="cursor-pointer font-semibold">Não consegue escanear?</summary>
				<div class="mt-3 flex flex-wrap items-center justify-between gap-2">
					<code class="break-all text-[13px]">{formattedSecret}</code>
					<Button size="sm" variant="secondary" onclick={copySecret}
						>{copiedSecret ? 'Copiada' : 'Copiar chave'}</Button
					>
				</div>
			</details>
			<TextField
				id="setup-2fa-code"
				label="Código de 6 dígitos"
				placeholder="000000"
				inputmode="numeric"
				autocomplete="one-time-code"
				maxlength={6}
				bind:value={setupCode}
				oninput={updateSetupCode}
			/>
			<div class="flex justify-end gap-2">
				<Button variant="ghost" disabled={settingUp} onclick={closeSetup}>Cancelar</Button>
				<Button type="submit" loading={settingUp}>Ativar</Button>
			</div>
		</form>
	{/if}
</dialog>

<dialog
	class="m-auto w-[min(520px,calc(100vw-32px))] rounded-lg border border-border-strong bg-bg-elevated p-6 text-fg backdrop:bg-[rgb(5_5_10/0.7)]"
	bind:this={recoveryDialog}
	aria-labelledby="recovery-title"
>
	<h2 id="recovery-title" class="text-[18px] font-bold">Gerar novos códigos</h2>
	{#if recoveryCodes.length}
		<div class="mt-4">
			<RecoveryCodesPanel
				codes={recoveryCodes}
				continueLabel="Concluir"
				oncontinue={() => {
					recoveryCodes = [];
					recoveryDialog?.close();
				}}
			/>
		</div>
	{:else}
		<form class="mt-4 flex flex-col gap-4" onsubmit={generateCodes}>
			<p class="text-[13.5px] text-fg-muted">
				Informe o código atual do seu aplicativo autenticador.
			</p>
			<TextField
				id="settings-2fa-code"
				label="Código de 6 dígitos"
				inputmode="numeric"
				autocomplete="one-time-code"
				maxlength={6}
				bind:value={code}
				oninput={updateCode}
			/>
			<div class="flex justify-end gap-2">
				<Button variant="ghost" onclick={() => recoveryDialog?.close()}>Cancelar</Button><Button
					type="submit"
					loading={generating}>Gerar códigos</Button
				>
			</div>
		</form>
	{/if}
</dialog>

<dialog
	class="m-auto w-[min(420px,calc(100vw-32px))] rounded-lg border border-border-strong bg-bg-elevated p-6 text-fg backdrop:bg-[rgb(5_5_10/0.7)]"
	bind:this={removeDialog}
	aria-labelledby="remove-device-title"
>
	<h2 id="remove-device-title" class="text-[18px] font-bold">Remover navegador confiável?</h2>
	<p class="mt-2 mb-6 text-[13.5px] text-fg-muted">
		{removing?.label} precisará informar o código de verificação no próximo acesso.
	</p>
	<div class="flex justify-end gap-2">
		<Button variant="ghost" disabled={revoking} onclick={() => removeDialog?.close()}
			>Cancelar</Button
		><Button variant="danger" loading={revoking} onclick={removeDevice}>Remover</Button>
	</div>
</dialog>
