<script lang="ts">
	import { page } from '$app/state';
	import Logo from '#lib/components/auth/Logo.svelte';
	import Icon, { type IconName } from '#lib/components/ui/Icon.svelte';
	import { auth } from '#lib/auth/session.svelte.js';
	import { logout } from '#lib/services/auth.js';

	type Props = { open: boolean; onclose: () => void };

	let { open, onclose }: Props = $props();

	type NavItem = { href: string; label: string; icon: IconName };

	const sections: { title: string; items: NavItem[] }[] = [
		{
			title: 'Visão geral',
			items: [{ href: '/dashboard', label: 'Dashboard', icon: 'dashboard' }]
		},
		{
			title: 'Gestão',
			items: [
				{ href: '/experts', label: 'Experts', icon: 'users' },
				{ href: '/campaigns', label: 'Campanhas', icon: 'megaphone' },
				{ href: '/reports', label: 'Relatórios', icon: 'bar-chart' }
			]
		},
		{
			title: 'Integrações',
			items: [{ href: '/facebook-accounts', label: 'Contas do Facebook', icon: 'facebook' }]
		}
	];

	const fullName = $derived(
		[auth.user?.firstName, auth.user?.lastName].filter(Boolean).join(' ') || 'Minha conta'
	);
	const initial = $derived(fullName.charAt(0).toUpperCase());

	let loggingOut = $state(false);

	// O redirecionamento para /login fica a cargo do layout da área logada.
	async function handleLogout() {
		loggingOut = true;
		await logout();
	}

	const isActive = (href: string) =>
		page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
</script>

{#snippet navLink(item: NavItem)}
	{@const active = isActive(item.href)}
	<a
		href={item.href}
		class={[
			'relative flex h-10 items-center gap-3 rounded-sm px-3 text-[14px] font-semibold',
			'[transition:background_0.15s,color_0.15s] hover:no-underline',
			active
				? [
						'bg-[rgb(124_92_255/0.12)] text-fg [&_.icon]:text-primary-hover',
						"before:absolute before:top-2.25 before:bottom-2.25 before:-left-4 before:w-[3px] before:rounded-r-[3px] before:bg-gradient-brand before:content-['']"
					]
				: 'text-fg-muted hover:bg-surface hover:text-fg'
		]}
		aria-current={active ? 'page' : undefined}
	>
		<Icon name={item.icon} />
		<span>{item.label}</span>
	</a>
{/snippet}

<aside
	class={[
		'sticky top-0 flex h-dvh flex-col overflow-y-auto px-4 pt-5.5 pb-4',
		'border-r border-border bg-bg-elevated',
		'max-lg:fixed max-lg:inset-y-0 max-lg:right-auto max-lg:left-0 max-lg:z-50 max-lg:w-[min(280px,85vw)]',
		'max-lg:[transition:transform_0.25s_ease]',
		open
			? 'max-lg:transform-none max-lg:shadow-[0_0_60px_rgb(0_0_0/0.6)]'
			: 'max-lg:[transform:translateX(-100%)]'
	]}
>
	<div class="flex items-center justify-between px-2 pb-6.5">
		<Logo />
		<button
			type="button"
			class="hidden size-9 cursor-pointer place-items-center rounded-sm text-fg-muted max-lg:grid"
			onclick={onclose}
			aria-label="Fechar menu"
		>
			<Icon name="x" />
		</button>
	</div>

	<nav class="flex flex-col gap-5.5" aria-label="Menu principal">
		{#each sections as section (section.title)}
			<div class="flex flex-col gap-0.5">
				<p class="mb-1.5 px-3 text-[11px] font-bold tracking-[0.08em] text-fg-subtle uppercase">
					{section.title}
				</p>
				{#each section.items as item (item.href)}
					{@render navLink(item)}
				{/each}
			</div>
		{/each}
	</nav>

	<div class="mt-auto flex flex-col gap-3 pt-6">
		{@render navLink({ href: '/settings', label: 'Configurações', icon: 'settings' })}

		<div class="flex items-center gap-2.5 rounded-md border border-border bg-surface p-2.5">
			<span
				class="grid size-8.5 shrink-0 place-items-center rounded-full bg-gradient-brand text-[13px] font-extrabold"
				aria-hidden="true">{initial}</span
			>
			<div class="flex min-w-0 flex-1 flex-col">
				<span class="truncate text-[13.5px] font-bold">{fullName}</span>
				<span class="truncate text-[12px] text-fg-subtle" title={auth.user?.email}>
					{auth.activeTenant?.tenantName ?? auth.user?.email ?? ''}
				</span>
			</div>
			<button
				type="button"
				class={[
					'grid size-8 shrink-0 cursor-pointer place-items-center rounded-sm p-0 text-fg-subtle',
					'hover:bg-surface-hover hover:text-danger disabled:cursor-progress disabled:opacity-60'
				]}
				aria-label="Sair"
				title="Sair"
				disabled={loggingOut}
				onclick={handleLogout}
			>
				<Icon name="logout" size={17} />
			</button>
		</div>
	</div>
</aside>

{#if open}
	<button
		type="button"
		class="fixed inset-0 z-40 hidden bg-[rgb(5_5_10/0.6)] backdrop-blur-[2px] max-lg:block"
		tabindex="-1"
		aria-label="Fechar menu"
		onclick={onclose}
	></button>
{/if}
