const prefersReducedMotion = () =>
	typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function inview(node: HTMLElement, options: { threshold?: number; once?: boolean } = {}) {
	if (prefersReducedMotion()) {
		node.classList.add('in');
		return {};
	}
	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				node.classList.add('in');
				if (options.once !== false) observer.disconnect();
			} else if (options.once === false) {
				node.classList.remove('in');
			}
		},
		{ threshold: options.threshold ?? 0.2, rootMargin: '0px 0px -6% 0px' }
	);
	observer.observe(node);
	return { destroy: () => observer.disconnect() };
}

export function countUp(
	node: HTMLElement,
	options: { to: number; decimals?: number; duration?: number; delay?: number }
) {
	const decimals = options.decimals ?? 0;
	const formatter = new Intl.NumberFormat('pt-BR', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	});
	const render = (value: number) => (node.textContent = formatter.format(value));
	if (prefersReducedMotion()) {
		render(options.to);
		return {};
	}
	render(0);
	let frame = 0;
	const run = () => {
		const duration = options.duration ?? 1600;
		const start = performance.now() + (options.delay ?? 0);
		const tick = (now: number) => {
			const progress = clamp((now - start) / duration);
			const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
			render(options.to * eased);
			if (progress < 1) frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
	};
	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				observer.disconnect();
				run();
			}
		},
		{ threshold: 0.4 }
	);
	observer.observe(node);
	return {
		destroy() {
			observer.disconnect();
			cancelAnimationFrame(frame);
		}
	};
}

export function scrollTilt(node: HTMLElement) {
	if (prefersReducedMotion()) {
		node.style.setProperty('--t', '1');
		return {};
	}
	let frame = 0;
	const update = () => {
		frame = 0;
		const rect = node.getBoundingClientRect();
		const height = window.innerHeight;
		const start = height * 0.98;
		const end = height * 0.3;
		node.style.setProperty('--t', clamp((start - rect.top) / (start - end)).toFixed(3));
	};
	const schedule = () => {
		if (!frame) frame = requestAnimationFrame(update);
	};
	update();
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule);
	return {
		destroy() {
			cancelAnimationFrame(frame);
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
		}
	};
}
