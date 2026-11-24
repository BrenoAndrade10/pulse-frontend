import { createHash, randomUUID } from 'node:crypto';

type LeadPayload = {
	name?: string;
	email?: string;
	whatsapp?: string;
	role?: string;
	otherRole?: string;
	difficulties?: string[];
	otherDifficulty?: string;
	tools?: string[];
	otherTools?: string;
	investment?: string;
	openAnswer?: string;
	whatsappConsent?: boolean;
	emailConsent?: boolean;
	honeypot?: string;
	attribution?: Record<string, string>;
	idempotencyKey?: string;
};

const headers = {
	'content-type': 'application/json; charset=utf-8',
	'access-control-allow-origin': '*'
};
const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), { status, headers });
const clean = (value: unknown, max = 600) =>
	String(value ?? '')
		.trim()
		.slice(0, max)
		.replace(/[\u0000-\u001f]/g, '');
const formulaSafe = (value: string) => (/^[=+\-@]/.test(value) ? `'${value}` : value);
const normalizePhone = (value: string) => {
	const raw = clean(value, 32).replace(/[^\d+]/g, '');
	if (!raw) return '';
	if (raw.startsWith('+')) return `+${raw.slice(1).replace(/\D/g, '')}`;
	const digits = raw.replace(/\D/g, '');
	return digits.startsWith('55') ? `+${digits}` : `+55${digits}`;
};
const allowedRoles = [
	'Lançador digital',
	'Gestor de lançamentos',
	'Dono ou gestor de agência',
	'Gestor de tráfego',
	'Expert / produtor digital',
	'Outro'
];
const allowedDifficulties = [
	'Rastrear corretamente a origem dos leads e vendas',
	'Entender a jornada completa dos leads',
	'Identificar leads com maior potencial de compra',
	'Centralizar informações de diferentes ferramentas',
	'Acompanhar resultados em tempo real',
	'Automatizar processos operacionais',
	'Gerenciar comunicações por WhatsApp, Instagram e e-mail',
	'Reduzir custos com ferramentas',
	'Outro'
];
const allowedTools = [
	'UTMify',
	'VK Metrics',
	'ManyChat',
	'Leadlovers',
	'SendFlow',
	'Hotmart',
	'Kiwify',
	'n8n',
	'Planilhas',
	'Ferramentas próprias',
	'Outras',
	'Não utilizo ferramentas específicas'
];

async function accessToken() {
	const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
	const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
	if (!email || !privateKey) throw new Error('Integração Google Sheets não configurada.');
	const enc = (v: string) => Buffer.from(v).toString('base64url');
	const now = Math.floor(Date.now() / 1000);
	const header = enc(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
	const claim = enc(
		JSON.stringify({
			iss: email,
			scope: 'https://www.googleapis.com/auth/spreadsheets',
			aud: 'https://oauth2.googleapis.com/token',
			iat: now,
			exp: now + 3600
		})
	);
	const unsigned = `${header}.${claim}`;
	const signer = new (await import('node:crypto')).Sign('RSA-SHA256');
	signer.update(unsigned);
	signer.end();
	const assertion = `${unsigned}.${signer.sign(privateKey, 'base64url')}`;
	const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
			assertion
		})
	});
	if (!tokenResponse.ok) throw new Error('Não foi possível autenticar no Google.');
	return (await tokenResponse.json()).access_token as string;
}

export default async (request: Request) => {
	if (request.method !== 'POST')
		return json({ success: false, message: 'Método não permitido.' }, 405);
	try {
		const payload = (await request.json()) as LeadPayload;
		if (payload.honeypot) return json({ success: true, leadId: 'accepted' });
		const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
		const name = clean(payload.name, 120);
		const email = clean(payload.email, 180).toLowerCase();
		const role = clean(payload.role, 80);
		if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !allowedRoles.includes(role))
			return json({ success: false, message: 'Revise os campos obrigatórios.' }, 400);
		const phone = normalizePhone(payload.whatsapp ?? '');
		if (payload.whatsappConsent && phone.replace(/\D/g, '').length < 10)
			return json(
				{ success: false, message: 'Informe um WhatsApp válido para autorizar o contato.' },
				400
			);
		const selectedDifficulties = (payload.difficulties ?? [])
			.filter((x) => allowedDifficulties.includes(x))
			.slice(0, 3);
		if (!selectedDifficulties.length)
			return json({ success: false, message: 'Selecione pelo menos um desafio.' }, 400);
		const selectedTools = (payload.tools ?? []).filter((x) => allowedTools.includes(x));
		const now = new Date().toISOString();
		const leadId = `pl_${Date.now().toString(36)}_${randomUUID().slice(0, 8)}`;
		if (appsScriptUrl) {
			const scriptResponse = await fetch(appsScriptUrl, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					...payload,
					name,
					email,
					whatsapp: phone,
					role,
					difficulties: selectedDifficulties,
					tools: selectedTools,
					leadId,
					submittedAt: now
				}),
				signal: AbortSignal.timeout(10000)
			});
			const scriptRaw = await scriptResponse.text();
			let scriptResult: { success?: boolean; message?: string } = {};
			try {
				scriptResult = JSON.parse(scriptRaw) as typeof scriptResult;
			} catch {
				throw new Error(
					`O Apps Script retornou uma resposta inválida (HTTP ${scriptResponse.status}). Verifique se a implantação está como Aplicativo da Web e acessível a qualquer pessoa.`
				);
			}
			if (!scriptResponse.ok || scriptResult.success === false)
				throw new Error(scriptResult.message || 'O Google Sheets não confirmou o cadastro.');
			return json({ success: true, leadId });
		}
		const a = payload.attribution ?? {};
		const row = [
			leadId,
			now,
			name,
			formulaSafe(email),
			formulaSafe(phone),
			role,
			clean(payload.otherRole, 120),
			selectedDifficulties.join(' | '),
			clean(payload.otherDifficulty, 400),
			selectedTools.join(' | '),
			clean(payload.otherTools, 180),
			clean(payload.investment, 60),
			clean(payload.openAnswer, 600),
			Boolean(payload.whatsappConsent),
			Boolean(payload.emailConsent),
			now,
			process.env.CONSENT_VERSION || '1.0',
			'',
			clean(a.utm_source, 120),
			clean(a.utm_medium, 120),
			clean(a.utm_campaign, 180),
			clean(a.utm_content, 180),
			clean(a.utm_term, 180),
			clean(a.fbclid, 240),
			clean(a.campaign_id, 120),
			clean(a.adset_id, 120),
			clean(a.ad_id, 120),
			'Novo',
			'',
			''
		];
		const spreadsheet = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
		const tab = process.env.GOOGLE_SHEETS_TAB_NAME || 'Leads';
		if (!spreadsheet) throw new Error('Planilha não configurada.');
		const token = await accessToken();
		const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheet)}/values/${encodeURIComponent(`${tab}!A:AD`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
		const response = await fetch(url, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
			body: JSON.stringify({ values: [row] })
		});
		if (!response.ok) throw new Error('O Google Sheets não confirmou o cadastro.');
		return json({ success: true, leadId });
	} catch (error) {
		console.error('submit-lead failed', error instanceof Error ? error.message : 'unknown');
		return json(
			{ success: false, message: 'Não foi possível concluir agora. Tente novamente em instantes.' },
			502
		);
	}
};
