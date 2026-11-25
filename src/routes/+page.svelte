<script lang="ts">
	import { onMount } from 'svelte';
	import './prelaunch.css';
	import { createTracker, type Tracker } from './tracker';
	import {
		initPixel,
		observeFormStart,
		observeFormView,
		setConsent,
		trackCustom,
		trackLead,
		type Consent
	} from './pixel';
	type FormData = {
		name: string;
		email: string;
		whatsapp: string;
		role: string;
		otherRole: string;
		difficulties: string[];
		otherDifficulty: string;
		tools: string[];
		otherTools: string;
		investment: string;
		openAnswer: string;
		whatsappConsent: boolean;
		emailConsent: boolean;
		honeypot: string;
	};
	const roles = [
		'Lançador digital',
		'Gestor de lançamentos',
		'Dono ou gestor de agência',
		'Gestor de tráfego',
		'Expert / produtor digital',
		'Outro'
	];
	const difficulties = [
		'Rastrear corretamente a origem dos leads e vendas',
		'Entender a jornada completa dos leads',
		'Identificar leads com maior potencial de compra',
		'Centralizar informações de diferentes ferramentas',
		'Acompanhar resultados em tempo real',
		'Automatizar processos operacionais',
		'Gerenciar comunicações por WhatsApp, Instagram e e-mail',
		'Reduzir custos com ferramentas',
		'Outro'
	];
	const tools = [
		'UTMify',
		'VK Metrics',
		'ManyChat',
		'Leadlovers',
		'SendFlow',
		'Hotmart',
		'Kiwify',
		'n8n',
		'Planilhas',
		'Ferramentas próprias',
		'Outras',
		'Não utilizo ferramentas específicas'
	];
	const investments = [
		'Até R$100',
		'R$101 a R$300',
		'R$301 a R$600',
		'R$601 a R$1.000',
		'Mais de R$1.000',
		'Não sei informar',
		'Prefiro não responder'
	];
	const initial: FormData = {
		name: '',
		email: '',
		whatsapp: '',
		role: '',
		otherRole: '',
		difficulties: [],
		otherDifficulty: '',
		tools: [],
		otherTools: '',
		investment: '',
		openAnswer: '',
		whatsappConsent: false,
		emailConsent: false,
		honeypot: ''
	};
	let form = $state<FormData>({ ...initial });
	let step = $state(1);
	let errors = $state<Record<string, string>>({});
	let submitting = $state(false);
	let submitted = $state(false);
	let submitError = $state('');
	let attribution = $state<Record<string, string>>({});
	let started = $state(false);
	let launchDate = $state('');
	let remaining = $state({ days: 0, hours: 0, minutes: 0, valid: false, expired: false });
	let timer: ReturnType<typeof setInterval> | undefined;
	let tracker: Tracker | undefined;
	let consent = $state<Consent | null>(null);
	let consentChecked = $state(false);
	let leadTracked = false;
	const track = trackCustom;
	const start = () => {
		if (!started) started = true;
	};
	const answerConsent = (value: Consent) => {
		consent = value;
		setConsent(value);
	};
	const maskPhone = (value: string) => {
		const trimmed = value.trim();
		const digits = trimmed.replace(/\D/g, '').slice(0, 15);
		if (!digits) return trimmed.startsWith('+') ? '+' : '';
		if (trimmed.startsWith('+')) {
			if (!digits.startsWith('55')) return `+${digits}`;
			const local = digits.slice(2, 13);
			if (local.length <= 2) return `+55 (${local}`;
			if (local.length <= 6) return `+55 (${local.slice(0, 2)}) ${local.slice(2)}`;
			return `+55 (${local.slice(0, 2)}) ${local.length === 11 ? local.slice(2, 7) : local.slice(2, 6)}-${local.length === 11 ? local.slice(7) : local.slice(6)}`;
		}
		const local = digits.slice(0, 11);
		if (local.length <= 2) return `(${local}`;
		if (local.length <= 6) return `(${local.slice(0, 2)}) ${local.slice(2)}`;
		return `(${local.slice(0, 2)}) ${local.length === 11 ? local.slice(2, 7) : local.slice(2, 6)}-${local.length === 11 ? local.slice(7) : local.slice(6)}`;
	};
	const handlePhoneInput = (event: Event) => {
		form.whatsapp = maskPhone((event.currentTarget as HTMLInputElement).value);
	};
	const toggle = (key: 'difficulties' | 'tools', value: string) => {
		if (key === 'tools' && value === 'Não utilizo ferramentas específicas') {
			form.tools = form.tools.includes(value) ? [] : [value];
			return;
		}
		const current = form[key].filter((x) => x !== 'Não utilizo ferramentas específicas');
		form[key] = current.includes(value) ? current.filter((x) => x !== value) : [...current, value];
	};
	const validateOne = () => {
		errors = {};
		if (!form.name.trim()) errors.name = 'Informe seu nome.';
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
			errors.email = 'Informe um e-mail válido.';
		if (form.whatsapp && form.whatsapp.replace(/\D/g, '').length < 10)
			errors.whatsapp = 'Informe um WhatsApp válido ou deixe o campo em branco.';
		if (!form.role) errors.role = 'Selecione sua atuação.';
		if (form.role === 'Outro' && !form.otherRole.trim())
			errors.otherRole = 'Conte qual é sua atuação.';
		return !Object.keys(errors).length;
	};
	const next = () => {
		start();
		if (validateOne()) {
			step = 2;
			tracker?.step(2);
			track('FormStepCompleted', { step: 1 });
		}
	};
	const validateTwo = () => {
		errors = {};
		if (!form.difficulties.length) errors.difficulties = 'Selecione pelo menos um desafio.';
		if (form.difficulties.includes('Outro') && !form.otherDifficulty.trim())
			errors.otherDifficulty = 'Conte qual é a dificuldade.';
		if (form.tools.includes('Outras') && !form.otherTools.trim())
			errors.otherTools = 'Conte quais ferramentas você usa.';
		if (form.whatsappConsent && form.whatsapp.replace(/\D/g, '').length < 10)
			errors.whatsapp = 'Para autorizar o contato, informe um WhatsApp válido.';
		return !Object.keys(errors).length;
	};
	const submit = async () => {
		start();
		if (!validateTwo()) return;
		submitting = true;
		submitError = '';
		const key = crypto.randomUUID();
		try {
			const r = await fetch('/.netlify/functions/submit-lead', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-idempotency-key': key },
				body: JSON.stringify({
					...form,
					attribution,
					idempotencyKey: key,
					sessionId: tracker?.sessionId ?? ''
				})
			});
			const rawResponse = await r.text();
			let j: { success?: boolean; message?: string; leadId?: string };
			try {
				j = JSON.parse(rawResponse) as typeof j;
			} catch {
				throw new Error(
					r.status === 404
						? 'A função de cadastro não está disponível neste ambiente. Execute com npx netlify dev ou publique no Netlify.'
						: 'O servidor retornou uma resposta inválida. Verifique a configuração da Netlify Function.'
				);
			}
			if (!r.ok || !j.success)
				throw new Error(j.message || 'Não foi possível salvar seu cadastro.');
			submitted = true;
			tracker?.submitted(j.leadId ?? '');
			if (!leadTracked && j.leadId && j.leadId !== 'accepted') {
				leadTracked = true;
				trackLead(j.leadId);
			}
		} catch (e) {
			submitError =
				e instanceof Error ? e.message : 'Não foi possível concluir agora. Tente novamente.';
		} finally {
			submitting = false;
		}
	};
	const getRemaining = () => {
		const target = Date.parse(launchDate);
		if (!launchDate || Number.isNaN(target))
			return { days: 0, hours: 0, minutes: 0, valid: false, expired: false };
		const diff = Math.max(0, target - Date.now());
		return {
			days: Math.floor(diff / 86400000),
			hours: Math.floor((diff % 86400000) / 3600000),
			minutes: Math.floor((diff % 3600000) / 60000),
			valid: true,
			expired: diff === 0
		};
	};
	onMount(() => {
		consent = initPixel();
		consentChecked = true;
		const stopFormView = observeFormView();
		const stopFormStart = observeFormStart();
		tracker = createTracker();
		tracker.start();
		const p = new URLSearchParams(location.search);
		const keys = [
			'utm_source',
			'utm_medium',
			'utm_campaign',
			'utm_content',
			'utm_term',
			'fbclid',
			'campaign_id',
			'adset_id',
			'ad_id'
		];
		attribution = Object.fromEntries(keys.filter((k) => p.get(k)).map((k) => [k, p.get(k) ?? '']));
		launchDate = import.meta.env.PUBLIC_LAUNCH_DATE ?? '';
		remaining = getRemaining();
		timer = setInterval(() => (remaining = getRemaining()), 30000);
		const onVisibility = () => {
			if (!document.hidden) remaining = getRemaining();
		};
		document.addEventListener('visibilitychange', onVisibility);
		return () => {
			if (timer) clearInterval(timer);
			tracker?.stop();
			stopFormView();
			stopFormStart();
			document.removeEventListener('visibilitychange', onVisibility);
		};
	});
</script>

<svelte:head
	><title>Pulse Lead — O futuro dos seus lançamentos começa aqui</title><meta
		name="description"
		content="Participe da pesquisa Pulse Lead e receba 30 dias gratuitos no lançamento da plataforma de gestão e inteligência de lançamentos digitais."
	/><meta
		property="og:title"
		content="Pulse Lead — O futuro dos seus lançamentos começa aqui"
	/><meta
		property="og:description"
		content="Participe da pesquisa e receba 30 dias gratuitos quando a Pulse Lead for lançada."
	/><meta property="og:type" content="website" /><meta
		property="og:image"
		content="/brand/pulse-lead-og.svg"
	/><meta name="twitter:card" content="summary_large_image" /><link
		rel="canonical"
		href={import.meta.env.PUBLIC_SITE_URL || ''}
	/></svelte:head
>
<div class="prelaunch-shell">
	<header class="site-header">
		<a href="/" class="brand" aria-label="Pulse Lead, início"
			><img src="/brand/pulse-logo.png" alt="Pulse Lead" /></a
		><span class="prelaunch-pill"><i></i> pré-lançamento</span>
	</header>
	<main>
		<section class="hero-grid" aria-labelledby="hero-title">
			<div class="hero-copy">
				<p class="eyebrow">PARA QUEM VIVE DE LANÇAMENTOS DIGITAIS</p>
				<h1 id="hero-title">O futuro dos seus lançamentos <em>começa aqui.</em></h1>
				<p class="hero-lede">
					Estamos construindo a Pulse Lead, uma plataforma para conectar seus dados, acompanhar a
					jornada dos seus leads e identificar novas oportunidades nos seus lançamentos.
				</p>
				<div class="offer-line">
					<span class="offer-icon"><span aria-hidden="true">✦</span></span>
					<div>
						<strong>30 dias grátis da Pulse Lead.</strong><span
							>Participe da pesquisa e receba acesso gratuito quando a plataforma for lançada.</span
						>
					</div>
				</div>
				<a href="#pesquisa" class="primary-cta" onclick={start}
					>Garantir meus 30 dias grátis <span>↗</span></a
				>
				<p class="microcopy">Pesquisa rápida. Sem compromisso financeiro.</p>
				<div class="launch-strip">
					<div>
						<span class="eyebrow">PREVISÃO DE LANÇAMENTO</span><strong
							>Uma nova era para seus lançamentos.</strong
						>
					</div>
					{#if remaining.valid && !remaining.expired}<div
							class="countdown"
							aria-label={`Previsão de lançamento: ${remaining.days} dias, ${remaining.hours} horas e ${remaining.minutes} minutos`}
						>
							<div><b>{String(remaining.days).padStart(2, '0')}</b><small>DIAS</small></div>
							<span>:</span>
							<div><b>{String(remaining.hours).padStart(2, '0')}</b><small>HORAS</small></div>
							<span>:</span>
							<div><b>{String(remaining.minutes).padStart(2, '0')}</b><small>MINUTOS</small></div>
						</div>{:else if remaining.expired}<p class="launch-ended">
							Chegou o grande dia.<small>Acompanhe as novidades da Pulse Lead.</small>
						</p>{:else}<p class="launch-ended muted">
							Definiremos a previsão oficial em breve.
						</p>{/if}
				</div>
			</div>
			<div class="product-stage" aria-label="Prévia conceitual da Pulse Lead">
				<div class="ambient ambient-one"></div>
				<div class="ambient ambient-two"></div>
				<div class="stage-top">
					<span class="stage-label">PULSE / INTELLIGENCE LAYER</span><span class="stage-live"
						><i></i> em construção</span
					>
				</div>
				<div class="product-card main-card">
					<div class="card-heading">
						<div>
							<span class="mini-label">VISÃO INTEGRADA</span><strong>Jornada do lançamento</strong>
						</div>
						<span class="card-period">Próxima decisão⌄</span>
					</div>
					<div class="journey">
						<div class="journey-line"></div>
						<div class="journey-node active">
							<span>01</span><b>Captação</b><small>1.248 leads</small>
						</div>
						<div class="journey-node">
							<span>02</span><b>Engajamento</b><small>842 leads</small>
						</div>
						<div class="journey-node hot">
							<span>03</span><b>Oportunidades</b><small>126 leads</small>
						</div>
						<div class="journey-node"><span>04</span><b>Conversão</b><small>em análise</small></div>
					</div>
					<div class="insight-row">
						<span class="heat-dot">✦</span>
						<div>
							<small>PULSE HEAT · PRÉVIA CONCEITUAL</small><strong
								>42 leads pedem atenção agora</strong
							>
						</div>
						<span class="insight-arrow">↗</span>
					</div>
				</div>
				<div class="product-card event-card">
					<span class="mini-label">EVENTOS CONECTADOS</span>
					<div class="event-list">
						<div>
							<i class="event-icon purple">↗</i><span>Checkout iniciado<small>há 2 min</small></span
							><b>+24</b>
						</div>
						<div>
							<i class="event-icon pink">◌</i><span>Lead reengajado<small>há 8 min</small></span><b
								>+12</b
							>
						</div>
						<div>
							<i class="event-icon blue">⌁</i><span
								>Mensagem respondida<small>há 14 min</small></span
							><b>+08</b>
						</div>
					</div>
				</div>
				<span class="floating-tag tag-one">dados conectados <b>↗</b></span><span
					class="floating-tag tag-two">decisões mais claras <b>✦</b></span
				>
			</div>
		</section>
		<section class="research-wrap" id="pesquisa" aria-labelledby="form-title">
			<div class="research-intro">
				<p class="eyebrow">PESQUISA DE MERCADO</p>
				<h2>Construa a Pulse <em>com a gente.</em></h2>
				<p>
					Quanto mais entendemos sua operação, mais útil a plataforma pode ser para quem vive
					lançamentos de verdade.
				</p>
				<div class="benefit-list">
					<div>
						<span>01</span><b>Experimente gratuitamente</b><small
							>30 dias reservados quando a plataforma for lançada.</small
						>
					</div>
					<div>
						<span>02</span><b>Sua experiência importa</b><small
							>Ajude a direcionar o desenvolvimento.</small
						>
					</div>
					<div>
						<span>03</span><b>Acompanhe nossa evolução</b><small
							>Receba novidades se fizer sentido para você.</small
						>
					</div>
				</div>
			</div>
			<div class="form-panel">
				{#if submitted}<div class="confirmation">
						<div class="checkmark">✓</div>
						<p class="eyebrow">CADASTRO CONFIRMADO</p>
						<h2>Você faz parte do <em>futuro da Pulse.</em></h2>
						<p>
							Sua participação foi registrada com sucesso. Obrigado por ajudar a construir uma
							plataforma pensada para quem vive de lançamentos digitais.
						</p>
						<div class="reserved">
							<strong>Seus 30 dias gratuitos estão reservados.</strong><span
								>Você receberá as instruções para resgatar o benefício quando a Pulse Lead for
								lançada.</span
							>
						</div>
						<a class="secondary-cta" href="/">Voltar ao início <span>↗</span></a>
					</div>{:else}<div class="form-head">
						<div>
							<p class="eyebrow">PESQUISA PULSE LEAD</p>
							<h2 id="form-title">
								{step === 1 ? 'Vamos começar?' : 'Queremos entender sua realidade.'}
							</h2>
							<p>
								{step === 1
									? 'Conte um pouco sobre você para participar da pesquisa.'
									: 'Suas respostas ajudam a construir uma plataforma alinhada aos desafios de quem trabalha com lançamentos.'}
							</p>
						</div>
						<span class="step-count">0{step} / 02</span>
					</div>
					<div class="progress"><span style={`width:${step === 1 ? 50 : 100}%`}></span></div>
					{#if step === 1}<div class="form-fields">
							<label
								>Nome<input
									bind:value={form.name}
									onfocus={start}
									placeholder="Seu nome"
									autocomplete="name"
									aria-invalid={!!errors.name}
								/>{#if errors.name}<small class="error">{errors.name}</small>{/if}</label
							><label
								>E-mail<input
									bind:value={form.email}
									onfocus={start}
									placeholder="Seu melhor e-mail"
									type="email"
									autocomplete="email"
									aria-invalid={!!errors.email}
								/>{#if errors.email}<small class="error">{errors.email}</small>{/if}</label
							><label
								>WhatsApp <span>(opcional)</span><input
									bind:value={form.whatsapp}
									oninput={handlePhoneInput}
									placeholder="(00) 00000-0000"
									inputmode="tel"
									autocomplete="tel"
									aria-invalid={!!errors.whatsapp}
								/>{#if errors.whatsapp}<small class="error">{errors.whatsapp}</small>{/if}</label
							>
							<fieldset>
								<legend>Qual é sua atuação no mercado digital?</legend>
								<div class="option-grid">
									{#each roles as option}<button
											type="button"
											class:chosen={form.role === option}
											onclick={() => (form.role = option)}>{option}</button
										>{/each}
								</div>
								{#if errors.role}<small class="error">{errors.role}</small>{/if}
							</fieldset>
							{#if form.role === 'Outro'}<label
									>Conte qual é sua atuação<input
										bind:value={form.otherRole}
										placeholder="Sua atuação"
									/>{#if errors.otherRole}<small class="error">{errors.otherRole}</small
										>{/if}</label
								>{/if}
						</div>
						<div class="honeypot" aria-hidden="true">
							<input bind:value={form.honeypot} tabindex="-1" autocomplete="off" />
						</div>
						<button class="form-cta" type="button" onclick={next}>Continuar <span>→</span></button>
						<p class="form-foot">Etapa 1 de 2 · leva menos de 2 minutos</p>{:else}<div
							class="form-fields compact"
						>
							<fieldset>
								<legend
									>Qual é seu maior desafio na operação dos lançamentos? <span>(até 3)</span
									></legend
								>
								<div class="option-grid">
									{#each difficulties as option}<button
											type="button"
											class:chosen={form.difficulties.includes(option)}
											onclick={() =>
												form.difficulties.length < 3 || form.difficulties.includes(option)
													? toggle('difficulties', option)
													: null}>{option}</button
										>{/each}
								</div>
								{#if errors.difficulties}<small class="error">{errors.difficulties}</small>{/if}
							</fieldset>
							{#if form.difficulties.includes('Outro')}<label
									>Conte qual é a dificuldade<input
										bind:value={form.otherDifficulty}
										placeholder="O que mais pesa hoje?"
									/>{#if errors.otherDifficulty}<small class="error">{errors.otherDifficulty}</small
										>{/if}</label
								>{/if}
							<fieldset>
								<legend>Quais ferramentas você utiliza? <span>(opcional)</span></legend>
								<div class="option-grid">
									{#each tools as option}<button
											type="button"
											class:chosen={form.tools.includes(option)}
											onclick={() => toggle('tools', option)}>{option}</button
										>{/each}
								</div>
							</fieldset>
							{#if form.tools.includes('Outras')}<label
									>Quais ferramentas?<input
										bind:value={form.otherTools}
										placeholder="Ex.: CRM, ferramenta própria..."
									/>{#if errors.otherTools}<small class="error">{errors.otherTools}</small
										>{/if}</label
								>{/if}
							<fieldset>
								<legend>Quanto investe mensalmente em ferramentas? <span>(opcional)</span></legend>
								<div class="option-grid two-col">
									{#each investments as option}<button
											type="button"
											class:chosen={form.investment === option}
											onclick={() => (form.investment = option)}>{option}</button
										>{/each}
								</div>
							</fieldset>
							<label
								>Se pudesse resolver um único problema hoje, qual seria? <span>(opcional)</span
								><textarea
									bind:value={form.openAnswer}
									maxlength="600"
									placeholder="Conte com suas palavras..."></textarea></label
							>
							<div class="consents">
								<label class="check-row"
									><input type="checkbox" bind:checked={form.whatsappConsent} /><span
										>Autorizo a Pulse Lead a entrar em contato comigo pelo WhatsApp para conversar
										sobre minha experiência, apresentar novidades e convidar-me para testar a
										plataforma.</span
									></label
								><label class="check-row"
									><input type="checkbox" bind:checked={form.emailConsent} /><span
										>Quero receber novidades sobre o desenvolvimento e lançamento da Pulse Lead por
										e-mail.</span
									></label
								>
								<p>
									Ao participar, você concorda com o uso das informações para esta pesquisa.
									Consulte nossa <a href="/privacidade">política de privacidade</a>. Você pode
									retirar autorizações posteriormente.
								</p>
							</div>
						</div>
						{#if submitError}<div class="submit-error" role="alert">{submitError}</div>{/if}
						<div class="form-actions">
							<button
								class="back-button"
								type="button"
								onclick={() => {
									step = 1;
									errors = {};
								}}>← Voltar</button
							><button class="form-cta" type="button" disabled={submitting} onclick={submit}
								>{submitting ? 'Salvando…' : 'Garantir meus 30 dias grátis'}
								<span>{submitting ? '◌' : '↗'}</span></button
							>
						</div>
						<p class="form-foot">Etapa 2 de 2 · seus dados ficam protegidos</p>{/if}{/if}
			</div>
		</section>
	</main>
	<footer>
		<img src="/brand/pulse-logo.png" alt="Pulse Lead" /><span
			>Gestão e inteligência para lançamentos digitais.</span
		><a href="/privacidade">Privacidade</a>
	</footer>
	{#if consentChecked && consent === null}
		<div
			class="cookie-banner"
			role="dialog"
			aria-live="polite"
			aria-label="Preferências de cookies"
		>
			<p>
				Usamos cookies para melhorar sua experiência. <a href="/privacidade">Privacidade</a>
			</p>
			<div class="cookie-actions">
				<button type="button" class="cookie-deny" onclick={() => answerConsent('denied')}
					>Recusar</button
				>
				<button type="button" class="cookie-accept" onclick={() => answerConsent('granted')}
					>Aceitar</button
				>
			</div>
		</div>
	{/if}
</div>
