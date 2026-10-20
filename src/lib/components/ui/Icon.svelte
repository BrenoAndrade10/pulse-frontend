<script lang="ts" module>
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ChartNoAxesColumn from '@lucide/svelte/icons/chart-no-axes-column';
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Copy from '@lucide/svelte/icons/copy';
	import Download from '@lucide/svelte/icons/download';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Flame from '@lucide/svelte/icons/flame';
	import Image from '@lucide/svelte/icons/image';
	import Info from '@lucide/svelte/icons/info';
	import Layers from '@lucide/svelte/icons/layers';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import Link from '@lucide/svelte/icons/link';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Mail from '@lucide/svelte/icons/mail';
	import Megaphone from '@lucide/svelte/icons/megaphone';
	import Menu from '@lucide/svelte/icons/menu';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Pause from '@lucide/svelte/icons/pause';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Play from '@lucide/svelte/icons/play';
	import Plug from '@lucide/svelte/icons/plug';
	import Plus from '@lucide/svelte/icons/plus';
	import Rocket from '@lucide/svelte/icons/rocket';
	import Search from '@lucide/svelte/icons/search';
	import Send from '@lucide/svelte/icons/send';
	import Settings from '@lucide/svelte/icons/settings';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import Tag from '@lucide/svelte/icons/tag';
	import Target from '@lucide/svelte/icons/target';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import UserPlus from '@lucide/svelte/icons/user-plus';
	import Users from '@lucide/svelte/icons/users';
	import Video from '@lucide/svelte/icons/video';
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import VolumeX from '@lucide/svelte/icons/volume-x';
	import Wallet from '@lucide/svelte/icons/wallet';
	import X from '@lucide/svelte/icons/x';
	import { siFacebook, siInstagram, siMeta, siWhatsapp } from 'simple-icons';

	const interfaceIcons = {
		dashboard: LayoutDashboard,
		users: Users,
		'user-plus': UserPlus,
		megaphone: Megaphone,
		'bar-chart': ChartNoAxesColumn,
		plug: Plug,
		'message-circle': MessageCircle,
		flame: Flame,
		send: Send,
		'shopping-bag': ShoppingBag,
		settings: Settings,
		logout: LogOut,
		mail: Mail,
		menu: Menu,
		x: X,
		plus: Plus,
		'arrow-left': ArrowLeft,
		'chevron-right': ChevronRight,
		'chevron-down': ChevronDown,
		video: Video,
		image: Image,
		play: Play,
		pause: Pause,
		'volume-on': Volume2,
		'volume-off': VolumeX,
		'external-link': ExternalLink,
		download: Download,
		copy: Copy,
		'chevron-left': ChevronLeft,
		layers: Layers,
		rocket: Rocket,
		trash: Trash2,
		pencil: Pencil,
		check: Check,
		search: Search,
		link: Link,
		'trending-up': TrendingUp,
		wallet: Wallet,
		target: Target,
		tag: Tag,
		bag: ShoppingBag,
		info: Info
	} as const;

	const brandIcons = {
		instagram: siInstagram.path,
		facebook: siFacebook.path,
		meta: siMeta.path,
		whatsapp: siWhatsapp.path
	} as const;

	type InterfaceIconName = keyof typeof interfaceIcons;
	type BrandIconName = keyof typeof brandIcons;
	export type IconName = InterfaceIconName | BrandIconName;
</script>

<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	let {
		name,
		size = 18,
		class: className
	}: { name: IconName; size?: number; class?: ClassValue } = $props();

	const isBrand = $derived(Object.hasOwn(brandIcons, name));
	const InterfaceIcon = $derived(interfaceIcons[name as InterfaceIconName]);
	const brandPath = $derived(brandIcons[name as BrandIconName]);
	const classes = $derived(['icon inline shrink-0 align-baseline', className]);
</script>

{#if isBrand}
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="currentColor"
		aria-hidden="true"
		focusable="false"
		class={classes}
	>
		<path d={brandPath} />
	</svg>
{:else}
	<InterfaceIcon {size} strokeWidth={1.8} aria-hidden="true" focusable="false" class={classes} />
{/if}
