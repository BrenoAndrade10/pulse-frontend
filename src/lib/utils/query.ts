/** Query string com as mudanças aplicadas (valor vazio remove o parâmetro). */
export function withQuery(search: string, changes: Record<string, string | undefined>): string {
	const params = new URLSearchParams(search);
	for (const [key, value] of Object.entries(changes)) {
		if (value) params.set(key, value);
		else params.delete(key);
	}
	const query = params.toString();
	return query ? `?${query}` : '';
}
