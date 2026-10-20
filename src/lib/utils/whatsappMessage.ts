export const WHATSAPP_NAME_LIMIT = 60;
export const WHATSAPP_HEADER_LIMIT = 60;
export const WHATSAPP_BODY_LIMIT = 1024;
export const WHATSAPP_FOOTER_LIMIT = 60;
export const WHATSAPP_BUTTON_LABEL_LIMIT = 20;
export const WHATSAPP_BUTTON_REPLY_LIMIT = 1024;
export const WHATSAPP_MAX_QUICK_REPLIES = 3;

export const WHATSAPP_VARIABLES = [
	'primeiro_nome',
	'nome',
	'email',
	'telefone',
	'lancamento',
	'pagina'
] as const;

const variableSet = new Set<string>(WHATSAPP_VARIABLES);
const samples: Record<(typeof WHATSAPP_VARIABLES)[number], string> = {
	primeiro_nome: 'Maria',
	nome: 'Maria Oliveira',
	email: 'maria@exemplo.com',
	telefone: '(11) 99999-0000',
	lancamento: 'Turma Outubro',
	pagina: 'Página de inscrição'
};

export type WhatsAppTextToken = {
	text: string;
	style?: 'bold' | 'italic' | 'strike' | 'mono';
};

export function extractWhatsAppVariables(text: string): string[] {
	return [...text.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g)].map((match) => match[1]);
}

export function unknownWhatsAppVariables(text: string): string[] {
	return [...new Set(extractWhatsAppVariables(text).filter((name) => !variableSet.has(name)))];
}

export function replaceWhatsAppVariables(text: string): string {
	return text.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (source, name: string) =>
		variableSet.has(name) ? samples[name as keyof typeof samples] : source
	);
}

export function tokenizeWhatsAppText(text: string): WhatsAppTextToken[] {
	const value = replaceWhatsAppVariables(text);
	const pattern = /(```)([\s\S]+?)\1|([*_~])([^\n]+?)\3/g;
	const tokens: WhatsAppTextToken[] = [];
	let cursor = 0;
	for (const match of value.matchAll(pattern)) {
		const index = match.index ?? 0;
		if (index > cursor) tokens.push({ text: value.slice(cursor, index) });
		if (match[1]) tokens.push({ text: match[2], style: 'mono' });
		else {
			const style = match[3] === '*' ? 'bold' : match[3] === '_' ? 'italic' : 'strike';
			tokens.push({ text: match[4], style });
		}
		cursor = index + match[0].length;
	}
	if (cursor < value.length) tokens.push({ text: value.slice(cursor) });
	return tokens;
}

export function isValidHttpsUrl(value: string): boolean {
	try {
		return new URL(value).protocol === 'https:';
	} catch {
		return false;
	}
}

export function uniqueWhatsAppEventNames(values: string[]): string[] {
	return [...new Set(values)];
}
