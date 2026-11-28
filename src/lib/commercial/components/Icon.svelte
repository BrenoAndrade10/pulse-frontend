<script lang="ts">
	let { name, size = 18 }: { name: string; size?: number } = $props();

	const paths: Record<string, string> = {
		flame:
			'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5Z',
		target:
			'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
		filter: 'M22 3H2l8 9.5V19l4 2v-8.5Z',
		send: 'm22 2-7 20-4-9-9-4Z M22 2 11 13',
		click:
			'M9 9l11 4.5-4.4 1.1a1 1 0 0 0-.7.7L13.8 19.7Z M14 4.1 12 6 M5.1 8l-2.9-.8 M6 12l-1.9 2 M7.2 2.2 8 5.1',
		user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
		link: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7 M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
		chart: 'M3 3v16a2 2 0 0 0 2 2h16 M18 17V9 M13 17V5 M8 17v-3',
		trend: 'M3 17l6-6 4 4 8-8 M17 7h4v4',
		mail: 'M3 6h18v12H3Z M3 7l9 6 9-6',
		clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 6v6l4 2',
		check: 'M5 12.5l4.5 4.5L19 7.5',
		bolt: 'M13 2 4 14h7l-1 8 9-12h-7Z',
		instagram:
			'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M17.2 6.8h.01',
		phone:
			'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
		chat: 'M7.9 20A9 9 0 1 0 4 16.1L2 22Z',
		grid: 'M3 3h18v18H3Z M3 9h18 M3 15h18 M9 3v18 M15 3v18',
		plug: 'M9 2v6 M15 2v6 M6 8h12v4a6 6 0 0 1-12 0Z M12 18v4',
		database:
			'M12 8c4.4 0 8-1.1 8-2.5S16.4 3 12 3 4 4.1 4 5.5 7.6 8 12 8Z M4 5.5v13C4 19.9 7.6 21 12 21s8-1.1 8-2.5v-13 M4 12c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5',
		calendar: 'M3 5h18v16H3Z M3 10h18 M8 3v4 M16 3v4',
		eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
		cart: 'M3 4h2l2.4 11h11l2-8H6 M9 20h.01 M17 20h.01',
		spark: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z M19 16v4 M17 18h4',
		repeat: 'M17 2l4 4-4 4 M3 11v-1a4 4 0 0 1 4-4h14 M7 22l-4-4 4-4 M21 13v1a4 4 0 0 1-4 4H3',
		layers: 'M12 2 2 7l10 5 10-5Z M2 17l10 5 10-5 M2 12l10 5 10-5',
		arrow: 'M5 12h14 M13 6l6 6-6 6',
		hand: 'M18 11V6a2 2 0 0 0-4 0 M14 10V4a2 2 0 0 0-4 0v2 M10 10.5V6a2 2 0 0 0-4 0v8 M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.9-2.4L3.4 16a2 2 0 0 1 3-2.7L8 15'
	};
</script>

<svg
	viewBox="0 0 24 24"
	width={size}
	height={size}
	fill="none"
	stroke="currentColor"
	stroke-width="1.8"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	focusable="false"><path d={paths[name]} /></svg
>
