import { APP_NAME } from '#lib/config.js';

/**
 * Dados usados nos Termos de Uso e na Política de Privacidade.
 *
 * Os valores entre colchetes são PENDÊNCIAS: precisam ser preenchidos com os
 * dados reais da empresa antes de publicar. Enquanto houver algum, as páginas
 * legais exibem um aviso no ambiente de desenvolvimento.
 */
export const LEGAL = {
	productName: APP_NAME,
	/** Razão social da pessoa jurídica que opera o serviço (controladora). */
	companyName: '[RAZÃO SOCIAL]',
	cnpj: '[CNPJ]',
	address: '[ENDEREÇO COMPLETO]',
	supportEmail: '[contato@seudominio.com.br]',
	/** Canal do encarregado (DPO) — art. 41 da LGPD. */
	privacyEmail: '[privacidade@seudominio.com.br]',
	dpoName: '[NOME DO ENCARREGADO]',
	/** Foro para usuários que não sejam consumidores (art. 63 do CPC). */
	forum: '[CIDADE/UF]',
	/** País/região onde ficam os servidores do banco de dados e das sessões. */
	dataRegion: '[PAÍS/REGIÃO DOS SERVIDORES]',
	/** Hospedagem do site/API (ex.: provedor de nuvem escolhido para o deploy). */
	hostingProvider: '[PROVEDOR DE HOSPEDAGEM]',
	/** Prazo para eliminar os dados após o encerramento da conta. */
	accountDeletionDays: 30,
	termsUpdatedAt: '2026-10-18',
	privacyUpdatedAt: '2026-10-18'
} as const;

export const pendingLegalFields = Object.entries(LEGAL)
	.filter(([, value]) => typeof value === 'string' && value.startsWith('['))
	.map(([key]) => key);

export function formatLegalDate(isoDate: string): string {
	return new Intl.DateTimeFormat('pt-BR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	}).format(new Date(`${isoDate}T00:00:00Z`));
}
