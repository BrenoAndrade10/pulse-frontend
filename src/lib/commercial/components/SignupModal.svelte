<script lang="ts">
	import { tick } from 'svelte';
	import { signup } from '../signup.svelte.ts';
	import './signup-modal.css';

	let dialog = $state<HTMLDivElement>();
	let emailInput = $state<HTMLInputElement>();
	let previousOverflow = '';
	let locked = false;

	const FOCUSABLE =
		'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

	const lockScroll = () => {
		if (locked) return;
		locked = true;
		previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
	};
	const unlockScroll = () => {
		if (!locked) return;
		locked = false;
		document.body.style.overflow = previousOverflow;
	};

	$effect(() => {
		if (!signup.isOpen) return;
		lockScroll();
		const phase = signup.phase;
		tick().then(() => {
			if (!dialog) return;
			const fine = window.matchMedia('(pointer: fine)').matches;
			if (phase === 'form' && fine && emailInput) emailInput.focus();
			else dialog.focus();
		});
		return () => {
			unlockScroll();
			const target = signup.returnFocus;
			if (target && document.contains(target)) target.focus();
		};
	});

	const onKeydown = (event: KeyboardEvent) => {
		if (!signup.isOpen) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			signup.close();
			return;
		}
		if (event.key !== 'Tab' || !dialog) return;
		const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
			(el) => el.offsetParent !== null || el === document.activeElement
		);
		if (!items.length) {
			event.preventDefault();
			dialog.focus();
			return;
		}
		const first = items[0];
		const last = items[items.length - 1];
		const active = document.activeElement;
		if (event.shiftKey && (active === first || active === dialog)) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && active === last) {
			event.preventDefault();
			first.focus();
		} else if (active && !dialog.contains(active)) {
			event.preventDefault();
			first.focus();
		}
	};

	const onInteract = (event: Event) => {
		if (event.isTrusted) signup.markInteraction();
	};

	const submit = (event: SubmitEvent) => {
		event.preventDefault();
		void signup.submit();
	};
	const save = (event: SubmitEvent) => {
		event.preventDefault();
		void signup.saveDetails();
	};
	const backdrop = (event: MouseEvent) => {
		if (event.target === event.currentTarget) signup.close();
	};
</script>

<svelte:window onkeydown={onKeydown} />

{#if signup.isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div class="cl-modal-backdrop" onclick={backdrop}>
		<div
			bind:this={dialog}
			class="cl-modal"
			role="dialog"
			aria-modal="true"
			aria-labelledby="cl-signup-title"
			aria-describedby="cl-signup-desc"
			tabindex="-1"
		>
			<button
				type="button"
				class="cl-modal-close"
				aria-label="Fechar"
				onclick={() => signup.close()}
			>
				<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"
					><path
						d="M6 6l12 12M18 6L6 18"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						fill="none"
					/></svg
				>
			</button>

			{#if signup.phase === 'form'}
				<h2 id="cl-signup-title" class="cl-modal-title">Acesso antecipado</h2>
				<p id="cl-signup-desc" class="cl-modal-text">
					A Pulse Lead está em desenvolvimento. Cadastre-se para receber informações sobre o acesso
					antecipado e as condições de lançamento.
				</p>
				<form class="cl-form" onsubmit={submit} novalidate>
					<label class="cl-label" for="cl-signup-email">E-mail</label>
					<input
						bind:this={emailInput}
						id="cl-signup-email"
						class="cl-input"
						type="email"
						name="email"
						inputmode="email"
						autocomplete="email"
						autocapitalize="off"
						spellcheck="false"
						required
						placeholder="voce@exemplo.com"
						aria-invalid={signup.error ? 'true' : undefined}
						aria-describedby={signup.error ? 'cl-signup-error' : undefined}
						bind:value={signup.email}
						onpointerdown={onInteract}
						onkeydown={onInteract}
					/>
					<div class="cl-hp" aria-hidden="true">
						<label for="cl-signup-site">Site</label>
						<input
							id="cl-signup-site"
							type="text"
							name="website"
							tabindex="-1"
							autocomplete="off"
							bind:value={signup.honeypot}
						/>
					</div>
					{#if signup.error}
						<p id="cl-signup-error" class="cl-error" role="alert">{signup.error}</p>
					{/if}
					<label class="cl-check">
						<input type="checkbox" name="comms" bind:checked={signup.commsConsent} />
						<span>Aceito receber novidades e comunicações comerciais da Pulse Lead. (opcional)</span
						>
					</label>
					<button type="submit" class="cl-su-btn" disabled={signup.submitting}>
						{signup.submitting ? 'Enviando…' : 'Quero acesso antecipado'}
					</button>
					<p class="cl-privacy">
						Usaremos seu e-mail para enviar informações sobre o acesso antecipado e as condições de
						lançamento. Saiba mais na
						<a href="/privacidade" target="_blank" rel="noopener">Política de Privacidade</a>.
					</p>
				</form>
			{:else}
				<h2 id="cl-signup-title" class="cl-modal-title">
					Você está na lista de acesso antecipado da Pulse.
				</h2>
				<p id="cl-signup-desc" class="cl-modal-text">
					Estamos construindo uma nova forma de gerenciar operações digitais. Em breve, entraremos
					em contato com novidades sobre o acesso à plataforma.
				</p>
				<form class="cl-form cl-details" onsubmit={save} novalidate>
					<p class="cl-optional">Opcional: conte um pouco mais sobre você.</p>
					<label class="cl-label" for="cl-signup-name">Nome</label>
					<input
						id="cl-signup-name"
						class="cl-input"
						type="text"
						name="name"
						autocomplete="name"
						maxlength="120"
						bind:value={signup.name}
					/>
					<label class="cl-label" for="cl-signup-whatsapp">WhatsApp (com DDD)</label>
					<input
						id="cl-signup-whatsapp"
						class="cl-input"
						type="tel"
						name="whatsapp"
						inputmode="tel"
						autocomplete="tel"
						maxlength="32"
						bind:value={signup.whatsapp}
					/>
					<label class="cl-label" for="cl-signup-op">Tipo de operação</label>
					<select
						id="cl-signup-op"
						class="cl-input"
						name="operationType"
						bind:value={signup.operationType}
					>
						<option value="">Prefiro não informar</option>
						<option value="paid_launch">Lançamento pago</option>
						<option value="traditional_launch">Lançamento tradicional</option>
						<option value="evergreen">Vendas no perpétuo</option>
					</select>
					<label class="cl-check">
						<input
							type="checkbox"
							name="demoInterest"
							checked={signup.demoInterest}
							onchange={(e) => signup.setDemoInterest(e.currentTarget.checked)}
						/>
						<span>Tenho interesse em uma demonstração individual.</span>
					</label>
					{#if signup.detailsError}
						<p class="cl-error" role="alert">{signup.detailsError}</p>
					{/if}
					{#if signup.detailsStatus === 'saved'}
						<p class="cl-ok" role="status">Informações salvas. Obrigado!</p>
					{/if}
					<div class="cl-actions">
						<button type="submit" class="cl-su-btn" disabled={signup.detailsStatus === 'saving'}>
							{signup.detailsStatus === 'saving' ? 'Salvando…' : 'Salvar informações'}
						</button>
						<button type="button" class="cl-su-btn cl-su-btn-ghost" onclick={() => signup.close()}>
							Fechar
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
{/if}
