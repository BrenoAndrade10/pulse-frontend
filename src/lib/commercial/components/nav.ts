import { prefersReducedMotion } from './motion';

export function anchorClick(event: MouseEvent, id: string) {
	if (event.defaultPrevented || event.button !== 0) return;
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
	const target = document.getElementById(id);
	if (!target) return;
	event.preventDefault();
	target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
	target.focus({ preventScroll: true });
}
