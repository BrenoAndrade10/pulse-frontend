<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { page } from '$app/state';
	import Logo from '#lib/components/auth/Logo.svelte';
	import { t, type MessageKey } from '#lib/i18n/index.svelte.js';
	import Icon, { type IconName } from '#lib/components/ui/Icon.svelte';
	import { auth } from '#lib/auth/session.svelte.js';
	import { logout } from '#lib/services/auth.js';

	type Props = { open: boolean; onclose: () => void };

	let { open, onclose }: Props = $props();

	type NavItem = { href: string; label: MessageKey; icon: IconName; nested?: boolean };
	type GroupId = 'operation' | 'audience' | 'intelligence' | 'management';
	type NavGroup = { id: GroupId; label: MessageKey; items: NavItem[] };

	const topItems: NavItem[] = [
		{ href: '/dashboard', label: 'nav.overview', icon: 'dashboard' },
		{ href: '/experts', label: 'nav.experts', icon: 'users' },
		{ href: '/launches', label: 'nav.launches', icon: 'rocket' }
	];
	const groups: NavGroup[] = [
		{
			id: 'operation',
			label: 'nav.groups.operation',
			items: [
				{ href: '/reels', label: 'nav.items.content', icon: 'image' },
				{ href: '/campaigns', label: 'nav.items.campaigns', icon: 'megaphone' },
				{ href: '/links', label: 'nav.items.links', icon: 'link' },
				{ href: '/tracking', label: 'nav.items.tracking', icon: 'target' }
			]
		},
		{
			id: 'audience',
			label: 'nav.groups.audience',
			items: [
				{ href: '/leads', label: 'nav.items.leads', icon: 'user-plus' },
				{ href: '/whatsapp', label: 'nav.items.whatsapp', icon: 'whatsapp' },
				{ href: '/email', label: 'nav.items.email', icon: 'mail' }
			]
		},
		{
			id: 'intelligence',
			label: 'nav.groups.intelligence',
			items: [{ href: '/reports', label: 'nav.items.analytics', icon: 'bar-chart' }]
		},
		{
			id: 'management',
			label: 'nav.groups.management',
			items: [
				{ href: '/integrations', label: 'nav.items.integrations', icon: 'plug' },
				{ href: '/settings', label: 'nav.items.settings', icon: 'settings' }
			]
		}
	];

	const desktop = new MediaQuery('min-width: 1024px');
	const matchesPath = (href: string, pathname: string) =>
		pathname === href || pathname.startsWith(`${href}/`);
	const isActive = (href: string) => matchesPath(href, page.url.pathname);
	const groupIsActive = (group: NavGroup) => group.items.some((item) => isActive(item.href));
	const activeGroupId = (pathname: string) =>
		groups.find((group) => group.items.some((item) => matchesPath(item.href, pathname)))?.id ??
		null;

	function initialExpanded(): Record<GroupId, boolean> {
		const current = activeGroupId(page.url.pathname);

		return {
			operation: current === 'operation',
			audience: current === 'audience',
			intelligence: current === 'intelligence',
			management: current === 'management'
		};
	}

	let expanded = $state<Record<GroupId, boolean>>(initialExpanded());

	$effect(() => {
		const group = activeGroupId(page.url.pathname);
		if (group && !untrack(() => expanded[group])) expanded[group] = true;
	});

	let closeButton = $state<HTMLButtonElement>();
	let returnFocusTo: HTMLElement | null = null;
	let wasOpen = false;

	$effect(() => {
		if (open && !wasOpen) {
			returnFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
			void tick().then(() => closeButton?.focus());
		} else if (!open && wasOpen) {
			returnFocusTo?.focus();
			returnFocusTo = null;
		}
		wasOpen = open;
	});

	const fullName = $derived(
		[auth.user?.firstName, auth.user?.lastName].filter(Boolean).join(' ') ||
			t('nav.account.fallbackName')
	);
	const initial = $derived(fullName.charAt(0).toUpperCase());

	let loggingOut = $state(false);

	// O redirecionamento para /login fica a cargo do layout da área logada.
	async function handleLogout() {
		loggingOut = true;
		await logout();
	}

	function toggleGroup(id: GroupId) {
		expanded = { ...expanded, [id]: !expanded[id] };
	}
</script>

{#snippet navLink(item: NavItem)}
	{@const active = isActive(item.href)}
	<a
		href={item.href}
		class={[
			'relative flex h-10 items-center gap-3 rounded-sm text-[14px] font-semibold',
			item.nested ? 'pr-3 pl-7' : 'px-3',
			'[transition:background_0.15s,color_0.15s] hover:no-underline',
			active
				? [
						'bg-[rgb(124_92_255/0.12)] text-fg [&_.icon]:text-primary-hover',
						"before:absolute before:top-2.25 before:bottom-2.25 before:-left-4 before:w-[3px] before:rounded-r-[3px] before:bg-gradient-brand before:content-['']"
					]
				: 'text-fg-muted hover:bg-surface hover:text-fg'
		]}
		aria-current={active ? 'page' : undefined}
		onclick={onclose}
	>
		<Icon name={item.icon} />
		<span>{t(item.label)}</span>
	</a>
{/snippet}

<aside
	class={[
		'sticky top-0 flex h-dvh flex-col overflow-y-auto px-4 pt-5.5 pb-4',
		'border-r border-border bg-bg-elevated',
		'max-lg:fixed max-lg:inset-y-0 max-lg:right-auto max-lg:left-0 max-lg:z-50 max-lg:w-[min(280px,85vw)]',
		'max-lg:[transition:transform_0.25s_ease]',
		'motion-reduce:transition-none',
		open
			? 'max-lg:transform-none max-lg:shadow-[0_0_60px_rgb(0_0_0/0.6)]'
			: 'max-lg:[transform:translateX(-100%)]'
	]}
	inert={!open && !desktop.current}
>
	<div class="flex items-center justify-between px-2 pb-6.5">
		<Logo />
		<button
			type="button"
			class="hidden size-9 cursor-pointer place-items-center rounded-sm text-fg-muted hover:bg-surface hover:text-fg max-lg:grid"
			bind:this={closeButton}
			onclick={onclose}
			aria-label={t('nav.aria.closeMenu')}
		>
			<Icon name="x" />
		</button>
	</div>

	<nav class="flex flex-col gap-1" aria-label={t('nav.aria.mainMenu')}>
		{#each topItems as item (item.href)}
			{@render navLink(item)}
		{/each}

		<div class="my-2 h-px bg-border"></div>

		{#each groups as group (group.id)}
			{@const isOpen = expanded[group.id]}
			{@const active = groupIsActive(group)}
			<div>
				<button
					type="button"
					class={[
						'flex h-9 w-full cursor-pointer items-center gap-3 rounded-sm px-3 text-[11.5px] font-bold tracking-[0.08em] uppercase',
						'text-fg-muted [transition:background_0.15s,color_0.15s,box-shadow_0.15s]',
						'hover:bg-surface hover:text-fg focus-visible:shadow-focus',
						active && !isOpen && 'bg-[rgb(124_92_255/0.08)] text-primary-hover',
						active && isOpen && 'text-fg'
					]}
					aria-expanded={isOpen}
					aria-controls={`sidebar-group-${group.id}`}
					onclick={() => toggleGroup(group.id)}
				>
					<span class="grid size-[18px] shrink-0 place-items-center" aria-hidden="true">
						<span class={['size-1.5 rounded-full', active ? 'bg-primary' : 'bg-fg-subtle']}></span>
					</span>
					<span class="flex-1 text-left"
						>{t(group.label)}{#if active && !isOpen}<span class="sr-only">
								{t('nav.aria.containsCurrentPage')}</span
							>{/if}</span
					>
					<Icon
						name="chevron-down"
						size={15}
						class={[
							'transition-transform duration-200 motion-reduce:transition-none',
							isOpen && 'rotate-180'
						]}
					/>
				</button>
				<div
					id={`sidebar-group-${group.id}`}
					class={[
						'grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none',
						isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
					]}
					aria-hidden={!isOpen}
					inert={!isOpen}
				>
					<div class="min-h-0 overflow-hidden">
						<ul class="flex flex-col gap-0.5 py-0.5" aria-label={t(group.label)}>
							{#each group.items as item (item.href)}
								<li>{@render navLink({ ...item, nested: true })}</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>
		{/each}
	</nav>

	<div class="mt-auto flex flex-col gap-3 pt-6">
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
				aria-label={t('nav.account.logout')}
				title={t('nav.account.logout')}
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
		aria-label={t('nav.aria.closeMenu')}
		onclick={onclose}
	></button>
{/if}
