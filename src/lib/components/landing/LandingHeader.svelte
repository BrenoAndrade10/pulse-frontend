<script lang="ts">
	import { onMount, tick } from 'svelte';

	const navItems = [
		{ label: 'Como funciona', id: 'como-funciona' },
		{ label: 'Pulse Heat', id: 'pulse-heat' },
		{ label: 'Canais', id: 'canais' },
		{ label: 'Planos', id: 'planos' },
		{ label: 'FAQ', id: 'faq' }
	];

	let menuOpen = $state(false);
	let headerEl: HTMLElement | undefined = $state();
	let activeSection = $state('');
	let menuButton: HTMLButtonElement | undefined = $state();

	const RANGE = 240;
	let current = 0;
	let frame = 0;

	function ease(value: number) {
		return value * value * (3 - 2 * value);
	}

	function step() {
		const target = ease(Math.min(1, Math.max(0, window.scrollY / RANGE)));
		current += (target - current) * 0.16;
		if (Math.abs(target - current) < 0.001) current = target;
		headerEl?.style.setProperty('--p', current.toFixed(4));
		frame = current === target ? 0 : requestAnimationFrame(step);
	}

	function updateScrolled() {
		if (!frame) frame = requestAnimationFrame(step);
	}

	function closeMenu(restoreFocus = false) {
		menuOpen = false;
		if (restoreFocus) menuButton?.focus();
	}

	async function openMenu() {
		menuOpen = true;
		await tick();
		document.querySelector<HTMLAnchorElement>('.primary-nav > a')?.focus();
	}

	function handleNavClick(event: MouseEvent, id: string) {
		const target =
			document.getElementById(id) ?? (id === 'faq' ? document.querySelector('.faq-section') : null);
		if (target) {
			event.preventDefault();
			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
			history.replaceState(null, '', `#${id}`);
		}
		closeMenu();
	}

	onMount(() => {
		const onKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && menuOpen) closeMenu(true);
		};
		const sections = navItems
			.map((item) => ({
				...item,
				element:
					document.getElementById(item.id) ??
					(item.id === 'faq' ? document.querySelector('.faq-section') : null)
			}))
			.filter((item): item is typeof item & { element: Element } => Boolean(item.element));
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
				if (visible)
					activeSection =
						sections.find((section) => section.element === visible.target)?.id ?? activeSection;
			},
			{ rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.2, 0.5] }
		);

		window.addEventListener('keydown', onKeydown);
		sections.forEach((section) => observer.observe(section.element));
		updateScrolled();

		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('keydown', onKeydown);
			observer.disconnect();
		};
	});
</script>

<svelte:window onscroll={updateScrolled} />

<div class="header-spacer" aria-hidden="true"></div>
<header class:menu-open={menuOpen} class="site-header" bind:this={headerEl}>
	<div class="container header-inner">
		<a class="brand" href="/" aria-label="Pulse Lead, início"
			><img class="brand-logo" src="/brand/pulse-logo-dark-trim.png" alt="Pulse Lead" /></a
		>
		<nav class="primary-nav" class:open={menuOpen} aria-label="Navegação principal">
			{#each navItems as item}
				<a
					class:active={activeSection === item.id}
					href={`#${item.id}`}
					onclick={(event) => handleNavClick(event, item.id)}>{item.label}</a
				>
			{/each}
			<div class="mobile-nav-actions">
				<a class="login-link" href="/login" onclick={() => closeMenu()}>Entrar</a>
				<a class="button header-cta" href="/register" onclick={() => closeMenu()}>Começar agora</a>
			</div>
		</nav>
		<div class="header-actions">
			<a class="login-link" href="/login">Entrar</a>
			<a class="button header-cta" href="/register">Começar agora</a>
		</div>
		<button
			class="menu-button"
			aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
			aria-expanded={menuOpen}
			bind:this={menuButton}
			onclick={() => (menuOpen ? closeMenu(true) : openMenu())}
			><span></span><span></span><span></span></button
		>
	</div>
</header>
