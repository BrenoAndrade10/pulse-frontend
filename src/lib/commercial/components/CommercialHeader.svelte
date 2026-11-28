<script lang="ts">
	import { onMount, tick } from 'svelte';
	import '../styles/header.css';
	import { track } from '../analytics/index.ts';
	import { signup } from '../signup.svelte.ts';
	import { anchorClick } from './nav';
	import { prefersReducedMotion } from './motion';

	const navItems = [
		{ label: 'Tracking', id: 'tracking' },
		{ label: 'Pulse Heat', id: 'pulse-heat' },
		{ label: 'Automações', id: 'automacoes' },
		{ label: 'Comunicação', id: 'comunicacao' },
		{ label: 'Estratégias', id: 'estrategias' },
		{ label: 'Planos', id: 'planos' }
	];

	const RANGE = 240;

	let menuOpen = $state(false);
	let activeId = $state('');
	let headerEl: HTMLElement | undefined = $state();
	let menuButton: HTMLButtonElement | undefined = $state();
	let current = 0;
	let frame = 0;

	function ease(value: number) {
		return value * value * (3 - 2 * value);
	}

	function step() {
		const target = ease(Math.min(1, Math.max(0, window.scrollY / RANGE)));
		current = prefersReducedMotion() ? target : current + (target - current) * 0.16;
		if (Math.abs(target - current) < 0.001) current = target;
		headerEl?.style.setProperty('--p', current.toFixed(4));
		frame = current === target ? 0 : requestAnimationFrame(step);
	}

	function onScroll() {
		if (!frame) frame = requestAnimationFrame(step);
	}

	function closeMenu(restoreFocus = false) {
		menuOpen = false;
		if (restoreFocus) menuButton?.focus();
	}

	async function openMenu() {
		menuOpen = true;
		await tick();
		headerEl?.querySelector<HTMLAnchorElement>('.cl-nav a')?.focus();
	}

	function goTop(event: MouseEvent) {
		anchorClick(event, 'inicio');
		closeMenu();
	}

	function goTo(event: MouseEvent, id: string) {
		if (id === 'planos') track('PricingClick', { ctaSource: 'header_nav' });
		anchorClick(event, id);
		closeMenu();
	}

	function openSignup() {
		closeMenu();
		signup.open({ source: 'header' });
	}

	onMount(() => {
		const onKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && menuOpen) closeMenu(true);
		};
		const onResize = () => {
			if (window.innerWidth > 900 && menuOpen) menuOpen = false;
		};
		const targets = navItems
			.map((item) => ({ id: item.id, element: document.getElementById(item.id) }))
			.filter((item): item is { id: string; element: HTMLElement } => Boolean(item.element));
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
				if (visible) {
					activeId = targets.find((item) => item.element === visible.target)?.id ?? activeId;
				}
				const first = targets[0]?.element;
				if (first && window.scrollY < first.offsetTop - window.innerHeight) activeId = '';
			},
			{ rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.2, 0.5] }
		);

		targets.forEach((item) => observer.observe(item.element));
		window.addEventListener('keydown', onKeydown);
		window.addEventListener('resize', onResize, { passive: true });
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();

		return () => {
			cancelAnimationFrame(frame);
			frame = 0;
			observer.disconnect();
			window.removeEventListener('keydown', onKeydown);
			window.removeEventListener('resize', onResize);
			window.removeEventListener('scroll', onScroll);
		};
	});
</script>

<div class="cl-header-spacer" aria-hidden="true"></div>
<header class="cl-header" class:cl-menu-open={menuOpen} bind:this={headerEl}>
	<div class="cl-header-inner">
		<a class="cl-brand" href="#inicio" aria-label="Pulse Lead, início" onclick={goTop}>
			<img
				src="/brand/pulse-logo-white-trim.png"
				alt="Pulse Lead"
				width="100"
				height="32"
				decoding="async"
				fetchpriority="high"
			/>
		</a>
		<nav class="cl-nav" class:cl-nav-open={menuOpen} aria-label="Navegação principal">
			{#each navItems as item (item.id)}
				<a
					class:cl-active={activeId === item.id}
					aria-current={activeId === item.id ? 'true' : undefined}
					href={`#${item.id}`}
					onclick={(event) => goTo(event, item.id)}>{item.label}</a
				>
			{/each}
			<div class="cl-nav-cta">
				<button class="cl-btn cl-btn-primary cl-btn-sm" type="button" onclick={openSignup}
					>Acesso antecipado</button
				>
			</div>
		</nav>
		<div class="cl-header-actions">
			<button class="cl-btn cl-btn-primary cl-btn-sm" type="button" onclick={openSignup}
				>Acesso antecipado</button
			>
		</div>
		<button
			class="cl-menu-button"
			type="button"
			aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
			aria-expanded={menuOpen}
			bind:this={menuButton}
			onclick={() => (menuOpen ? closeMenu(true) : openMenu())}
			><span></span><span></span><span></span></button
		>
	</div>
</header>
