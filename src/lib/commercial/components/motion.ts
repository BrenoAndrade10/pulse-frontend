export const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	typeof window.matchMedia === 'function' &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const settle = (nodes: HTMLElement[], ms: number) =>
	setTimeout(() => {
		for (const node of nodes) {
			node.classList.remove('cl-pre', 'cl-in');
			node.style.removeProperty('--cl-d');
		}
	}, ms);

export function reveal(node: HTMLElement, options: { delay?: number } = {}) {
	if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return {};
	node.classList.add('cl-pre');
	if (options.delay) node.style.setProperty('--cl-d', `${options.delay}ms`);
	let timer: ReturnType<typeof setTimeout> | undefined;
	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				node.classList.add('cl-in');
				observer.disconnect();
				timer = settle([node], (options.delay ?? 0) + 900);
			}
		},
		{ threshold: 0.1, rootMargin: '0px 0px -4% 0px' }
	);
	observer.observe(node);
	return {
		destroy: () => {
			observer.disconnect();
			clearTimeout(timer);
		}
	};
}

export function stagger(node: HTMLElement, options: { step?: number; base?: number } = {}) {
	if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return {};
	const kids = Array.from(node.children) as HTMLElement[];
	const step = options.step ?? 90;
	const base = options.base ?? 0;
	kids.forEach((kid, index) => {
		kid.classList.add('cl-pre');
		kid.style.setProperty('--cl-d', `${base + index * step}ms`);
	});
	let timer: ReturnType<typeof setTimeout> | undefined;
	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				kids.forEach((kid) => kid.classList.add('cl-in'));
				observer.disconnect();
				timer = settle(kids, base + kids.length * step + 900);
			}
		},
		{ threshold: 0.15, rootMargin: '0px 0px -4% 0px' }
	);
	observer.observe(node);
	return {
		destroy: () => {
			observer.disconnect();
			clearTimeout(timer);
		}
	};
}

export function whenVisible(
	node: HTMLElement,
	options: { onenter: () => void; threshold?: number }
) {
	if (typeof IntersectionObserver === 'undefined') {
		options.onenter();
		return {};
	}
	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				observer.disconnect();
				options.onenter();
			}
		},
		{ threshold: options.threshold ?? 0.4 }
	);
	observer.observe(node);
	return { destroy: () => observer.disconnect() };
}

export function watchVisible(
	node: HTMLElement,
	options: { onchange: (visible: boolean) => void; threshold?: number }
) {
	if (typeof IntersectionObserver === 'undefined') {
		options.onchange(true);
		return {};
	}
	let current = false;
	const need = options.threshold ?? 0.55;
	const observer = new IntersectionObserver(
		([entry]) => {
			const height = entry.rootBounds?.height ?? window.innerHeight;
			const shown = entry.intersectionRect.height;
			const enter =
				entry.isIntersecting && (entry.intersectionRatio >= need || shown >= height * 0.6);
			const leave =
				!entry.isIntersecting || (entry.intersectionRatio < 0.2 && shown < height * 0.3);
			if (!current && enter) {
				current = true;
				options.onchange(true);
			} else if (current && leave) {
				current = false;
				options.onchange(false);
			}
		},
		{ threshold: Array.from({ length: 21 }, (_, index) => index / 20) }
	);
	observer.observe(node);
	return { destroy: () => observer.disconnect() };
}

export function live(node: HTMLElement, options: { threshold?: number } = {}) {
	if (typeof IntersectionObserver === 'undefined') return {};
	const observer = new IntersectionObserver(
		([entry]) => node.classList.toggle('is-live', entry.isIntersecting),
		{ threshold: options.threshold ?? 0.2 }
	);
	observer.observe(node);
	return { destroy: () => observer.disconnect() };
}

export function countUp(node: HTMLElement, options: { to: number; duration?: number }) {
	if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return {};
	const format = new Intl.NumberFormat('pt-BR');
	node.textContent = format.format(0);
	let frame = 0;
	const observer = new IntersectionObserver(
		([entry]) => {
			if (!entry.isIntersecting) return;
			observer.disconnect();
			const start = performance.now() + 250;
			const duration = options.duration ?? 1400;
			const tick = (now: number) => {
				const progress = Math.min(1, Math.max(0, (now - start) / duration));
				node.textContent = format.format(Math.round(options.to * (1 - Math.pow(1 - progress, 3))));
				if (progress < 1) frame = requestAnimationFrame(tick);
			};
			frame = requestAnimationFrame(tick);
		},
		{ threshold: 0.3 }
	);
	observer.observe(node);
	return {
		destroy: () => {
			observer.disconnect();
			cancelAnimationFrame(frame);
		}
	};
}

export function parallax(node: HTMLElement) {
	if (
		prefersReducedMotion() ||
		typeof window.matchMedia !== 'function' ||
		!window.matchMedia('(hover: hover) and (pointer: fine)').matches
	)
		return {};
	let frame = 0;
	let x = 0;
	let y = 0;
	const apply = () => {
		frame = 0;
		node.style.setProperty('--px', x.toFixed(3));
		node.style.setProperty('--py', y.toFixed(3));
	};
	const move = (event: PointerEvent) => {
		const rect = node.getBoundingClientRect();
		x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
		y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
		if (!frame) frame = requestAnimationFrame(apply);
	};
	const leave = () => {
		x = 0;
		y = 0;
		if (!frame) frame = requestAnimationFrame(apply);
	};
	node.addEventListener('pointermove', move, { passive: true });
	node.addEventListener('pointerleave', leave);
	return {
		destroy: () => {
			cancelAnimationFrame(frame);
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerleave', leave);
		}
	};
}
