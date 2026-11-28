import type { FeatureId, OperationType, ScenarioId } from '../../contract.ts';

export type Tone = 'ok' | 'warn' | 'opp' | 'neutral';

export type Evidence =
	| { kind: 'chip'; label: string; value: string; tone: Tone }
	| { kind: 'heat'; value: number }
	| { kind: 'msg'; text: string };

export type Step = {
	id: string;
	icon: string;
	title: string;
	effect: string;
	feature: FeatureId;
	evidence: Evidence[];
};

export type Scenario = {
	id: OperationType;
	scenario: ScenarioId;
	label: string;
	accent: string;
	name: string;
	title: string;
	context: string;
	benefit: string;
	steps: Step[];
};

export const scenarios: Scenario[] = [
	{
		id: 'paid_launch',
		scenario: 'strategy_paid_launch',
		label: 'Lançamento pago',
		accent: '#ff7a59',
		name: 'Lançamento pago',
		title: 'Acompanhe cada participante, além da inscrição.',
		context:
			'Um participante compra o ingresso para um evento pago. A Pulse acompanha sua jornada e permite identificar novas oportunidades durante o lançamento.',
		benefit:
			'Acompanhe o participante desde a compra do ingresso até a oportunidade de venda do produto principal.',
		steps: [
			{
				id: 'ticket',
				icon: 'cart',
				title: 'Compra do ingresso identificada',
				effect: 'Por integração (planejado)',
				feature: 'lead_journey',
				evidence: [
					{ kind: 'chip', label: 'Ingresso', value: 'Comprado', tone: 'ok' },
					{ kind: 'chip', label: 'Oferta principal', value: 'Não iniciada', tone: 'neutral' }
				]
			},
			{
				id: 'confirmation',
				icon: 'send',
				title: 'Comunicação individual',
				effect: 'Confirmação e lembrete',
				feature: 'scheduled_messages',
				evidence: [{ kind: 'msg', text: 'Seu ingresso está confirmado. Até breve!' }]
			},
			{
				id: 'offer',
				icon: 'click',
				title: 'Interage com a oferta principal',
				effect: 'Visita à página da oferta',
				feature: 'lead_journey',
				evidence: [
					{ kind: 'heat', value: 68 },
					{ kind: 'chip', label: 'Oferta principal', value: 'Pendente', tone: 'warn' }
				]
			},
			{
				id: 'opportunity',
				icon: 'spark',
				title: 'Oportunidade comercial identificada',
				effect: 'Com comunicação segmentada',
				feature: 'behavioral_automations',
				evidence: [{ kind: 'chip', label: 'Oferta principal', value: 'Oportunidade', tone: 'opp' }]
			}
		]
	},
	{
		id: 'traditional_launch',
		scenario: 'strategy_traditional_launch',
		label: 'Lançamento tradicional',
		accent: '#38bdf8',
		name: 'Lançamento tradicional',
		title: 'Conecte cada etapa do seu lançamento.',
		context:
			'Você está realizando um lançamento com três CPLs e precisa coordenar a comunicação enquanto acompanha o comportamento dos leads.',
		benefit: 'Coordene sua comunicação e identifique oportunidades durante todo o lançamento.',
		steps: [
			{
				id: 'signup',
				icon: 'user',
				title: 'Lead realiza a inscrição',
				effect: 'Entra no lançamento',
				feature: 'lead_journey',
				evidence: [{ kind: 'chip', label: 'Inscrição', value: 'Confirmada', tone: 'ok' }]
			},
			{
				id: 'reminders',
				icon: 'clock',
				title: 'Recebe os lembretes dos CPLs',
				effect: 'Envios programados',
				feature: 'scheduled_messages',
				evidence: [{ kind: 'msg', text: 'Começamos em 15 minutos. Te vejo lá!' }]
			},
			{
				id: 'interaction',
				icon: 'click',
				title: 'Interage com conteúdos e oferta',
				effect: 'Comportamento registrado',
				feature: 'lead_journey',
				evidence: [{ kind: 'heat', value: 62 }]
			},
			{
				id: 'segmented',
				icon: 'send',
				title: 'Comunicação adequada ao seu momento',
				effect: 'Segmentada pelo comportamento',
				feature: 'event_automations',
				evidence: [{ kind: 'msg', text: 'Viu a oferta? Posso tirar suas dúvidas.' }]
			}
		]
	},
	{
		id: 'evergreen',
		scenario: 'strategy_evergreen',
		label: 'Vendas no perpétuo',
		accent: '#3ddc97',
		name: 'Vendas no perpétuo',
		title: 'Sua operação continua trabalhando, mesmo quando você não está.',
		context: 'Um lead demonstra interesse pela sua oferta, mas ainda não realiza a compra.',
		benefit:
			'Transforme sinais de interesse em novas oportunidades comerciais de forma automatizada.',
		steps: [
			{
				id: 'entry',
				icon: 'user',
				title: 'Lead entra na operação',
				effect: 'Origem registrada',
				feature: 'tracking',
				evidence: [{ kind: 'chip', label: 'Entrada', value: 'Registrada', tone: 'ok' }]
			},
			{
				id: 'interest',
				icon: 'click',
				title: 'Interage e acessa a oferta',
				effect: 'Pulse Heat evolui',
				feature: 'pulse_heat',
				evidence: [{ kind: 'heat', value: 52 }]
			},
			{
				id: 'checkout',
				icon: 'cart',
				title: 'Inicia o checkout sem concluir',
				effect: 'Compra não concluída',
				feature: 'lead_journey',
				evidence: [{ kind: 'chip', label: 'Checkout', value: 'Iniciado', tone: 'warn' }]
			},
			{
				id: 'recovery',
				icon: 'repeat',
				title: 'Automação de recuperação acionada',
				effect: 'Após verificar a compra',
				feature: 'behavioral_automations',
				evidence: [{ kind: 'msg', text: 'Notamos que faltou pouco. Posso ajudar?' }]
			}
		]
	}
];
