export type Point = { x: number; y: number };

export function smoothPath(items: Point[]) {
	let path = `M ${items[0].x} ${items[0].y}`;
	for (let index = 1; index < items.length; index++) {
		const previous = items[index - 1];
		const current = items[index];
		const midX = (previous.x + current.x) / 2;
		path += ` C ${midX} ${previous.y}, ${midX} ${current.y}, ${current.x} ${current.y}`;
	}
	return path;
}

export function buildChart(values: number[], width: number, height: number, padding = 8) {
	const max = Math.max(...values) * 1.1;
	const points = values.map((value, index) => ({
		x: padding + (index / (values.length - 1)) * (width - padding * 2),
		y: height - padding - (value / max) * (height - padding * 2)
	}));
	const line = smoothPath(points);
	const area = `${line} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
	return { line, area, last: points[points.length - 1] };
}
