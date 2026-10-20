<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { page } from '$app/state';
	import Logo from '#lib/components/auth/Logo.svelte';
	import Icon, { type IconName } from '#lib/components/ui/Icon.svelte';
	import { auth } from '#lib/auth/session.svelte.js';
	import { logout } from '#lib/services/auth.js';

	type Props = { open: boolean; onclose: () => void };

	let { open, onclose }: Props = $props();

	type NavItem = { href: string; label: string; icon: IconName; nested?: boolean };
	type GroupId = 'attract' | 'capture' | 'relationship' | 'analysis';
	type NavGroup = { id: GroupId; label: string; items: NavItem[] };

	const STORAGE_KEY = 'pulse:sidebar-groups';
	const topItems: NavItem[] = [
		{ href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
		{ href: '/experts', label: 'Experts', icon: 'users' },
		{ href: '/launches', label: 'Lançamentos', icon: 'rocket' }
	];
	const groups: NavGroup[] = [
		{
			id: 'attract',
			label: 'Atrair',
			items: [
				{ href: '/reels', label: 'Publicações', icon: 'image' },
				{ href: '/campaigns', label: 'Campanhas', icon: 'megaphone' }
			]
		},
		{
			id: 'capture',
			label: 'Capturar',
			items: [
				{ href: '/tracking', label: 'Rastreamento', icon: 'target' },
				{ href: '/leads', label: 'Leads', icon: 'user-plus' }
			]
		},
		{
			id: 'relationship',
			label: 'Relacionamento',
			items: [
				{ href: '/whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
				{ href: '/email', label: 'E-mail', icon: 'mail' }
			]
		},
		{
			id: 'analysis',
			label: 'Análise',
			items: [{ href: '/reports', label: 'Relatórios', icon: 'bar-chart' }]
		}
	];
	const integrations: NavItem = { href: '/integrations', label: 'Integrações', icon: 'plug' };

	let expanded = $state<Record<GroupId, boolean>>({
		attract: true,
		capture: true,
		relationship: true,
		analysis: true
	});
	let storageReady = $state(false);

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

	const matchesPath = (href: string, pathname: string) =>
		pathname === href || pathname.startsWith(`${href}/`);
	const isActive = (href: string) => matchesPath(href, page.url.pathname);
	const groupIsActive = (group: NavGroup) => group.items.some((item) => isActive(item.href));

	onMount(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<
				Record<GroupId, unknown>
			>;
			const savedState: Record<GroupId, boolean> = {
				attract: typeof saved.attract === 'boolean' ? saved.attract : expanded.attract,
				capture: typeof saved.capture === 'boolean' ? saved.capture : expanded.capture,
				relationship:
					typeof saved.relationship === 'boolean' ? saved.relationship : expanded.relationship,
				analysis: typeof saved.analysis === 'boolean' ? saved.analysis : expanded.analysis
			};
			const active = groups.find((group) =>
				group.items.some((item) => matchesPath(item.href, page.url.pathname))
			);
			expanded = active ? { ...savedState, [active.id]: true } : savedState;
		} catch {
			// O menu continua funcional quando o armazenamento do navegador está indisponível.
		}
		storageReady = true;
	});

	$effect(() => {
		const pathname = page.url.pathname;
		const active = groups.find((group) =>
			group.items.some((item) => matchesPath(item.href, pathname))
		);
		untrack(() => {
			if (active && !expanded[active.id]) expanded = { ...expanded, [active.id]: true };
		});
	});

	$effect(() => {
		if (!storageReady) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(expanded));
		} catch {
			// Persistência é opcional.
		}
	});

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

	<nav class="flex flex-col gap-1" aria-label="Menu principal">
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
						'flex h-10 w-full cursor-pointer items-center gap-3 rounded-sm px-3 text-[13.5px] font-bold',
						'text-fg-muted [transition:background_0.15s,color_0.15s,box-shadow_0.15s]',
						'hover:bg-surface hover:text-fg focus-visible:shadow-focus',
						active && !isOpen && 'bg-[rgb(124_92_255/0.08)] text-primary-hover'
					]}
					aria-expanded={isOpen}
					aria-controls={`sidebar-group-${group.id}`}
					onclick={() => toggleGroup(group.id)}
				>
					<span class="grid size-[18px] shrink-0 place-items-center" aria-hidden="true">
						<span class={['size-1.5 rounded-full', active ? 'bg-primary' : 'bg-fg-subtle']}></span>
					</span>
					<span class="flex-1 text-left">{group.label}</span>
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
						<div class="flex flex-col gap-0.5 py-0.5">
							{#each group.items as item (item.href)}
								{@render navLink({ ...item, nested: true })}
							{/each}
						</div>
					</div>
				</div>
			</div>
		{/each}

		<div class="my-2 h-px bg-border"></div>
		{@render navLink(integrations)}
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
