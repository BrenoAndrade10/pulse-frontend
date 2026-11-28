export type Segment = { text: string; variable?: string };
export type VariableValues = Record<string, string>;

export type MessageModelId =
	| 'class_reminder'
	| 'paid_confirmation'
	| 'cart_open'
	| 'checkout_recovery'
	| 'reengagement'
	| 'variables_model'
	| 'welcome'
	| 'starting_soon'
	| 'segmented_followup';

export type MessageModel = {
	id: MessageModelId;
	label: string;
	sampleLead: string;
	paragraphs: string[];
	cta: string;
	ctaVariable?: string;
};

export type EmailModel = {
	id: MessageModelId;
	subject: string;
	preview: string;
	paragraphs: string[];
	cta: string;
};

export type Lead = { id: string; firstName: string; values: VariableValues };

export const PRODUCT = 'Método Elite';

export const VARIABLE_LABELS: Record<string, string> = {
	primeiro_nome: 'Primeiro nome',
	nome_do_produto: 'Nome do produto',
	nome_do_expert: 'Nome do expert',
	nome_do_evento: 'Nome do evento',
	link_de_inscricao: 'Link de inscrição',
	link_de_recuperacao: 'Link de recuperação do checkout',
	data_e_horario: 'Data e horário',
	informacoes_da_operacao: 'Informações da operação',
	horario: 'Horário',
	tema_da_aula: 'Tema da aula',
	link_personalizado: 'Link personalizado',
	etapa_da_jornada: 'Etapa da jornada'
};

const shared = {
	nome_do_produto: PRODUCT,
	nome_do_expert: 'Ana Souza',
	nome_do_evento: 'Workshop Método Elite',
	link_de_inscricao: 'exemplo.com/inscricao',
	data_e_horario: 'amanhã, às 19h',
	informacoes_da_operacao: 'Lançamento Método Elite',
	etapa_da_jornada: 'Boas-vindas'
};

export const LEADS: Lead[] = [
	{
		id: 'mariana',
		firstName: 'Mariana',
		values: {
			...shared,
			primeiro_nome: 'Mariana',
			link_de_recuperacao: 'exemplo.com/retomar/mariana',
			link_personalizado: 'exemplo.com/l/mariana',
			horario: '20h',
			tema_da_aula: 'posicionamento no digital'
		}
	},
	{
		id: 'rafael',
		firstName: 'Rafael',
		values: {
			...shared,
			primeiro_nome: 'Rafael',
			link_de_recuperacao: 'exemplo.com/retomar/rafael',
			link_personalizado: 'exemplo.com/l/rafael',
			horario: '19h30',
			tema_da_aula: 'organização da rotina de estudos'
		}
	},
	{
		id: 'camila',
		firstName: 'Camila',
		values: {
			...shared,
			primeiro_nome: 'Camila',
			link_de_recuperacao: 'exemplo.com/retomar/camila',
			link_personalizado: 'exemplo.com/l/camila',
			horario: '20h',
			tema_da_aula: 'criação de conteúdo'
		}
	}
];

export const MESSAGE_MODELS: Record<MessageModelId, MessageModel> = {
	class_reminder: {
		id: 'class_reminder',
		label: 'Lembrete de aula',
		sampleLead: 'Mariana',
		paragraphs: [
			'Oi, {{primeiro_nome}}!',
			'Hoje, às 20h, teremos a segunda aula do nosso treinamento gratuito.',
			'Vamos aprofundar um dos principais conceitos apresentados na primeira aula.',
			'Seu acesso está disponível no link abaixo.'
		],
		cta: 'Acessar aula'
	},
	paid_confirmation: {
		id: 'paid_confirmation',
		label: 'Confirmação e lembrete do evento',
		sampleLead: 'Rafael',
		paragraphs: [
			'Olá, {{primeiro_nome}}!',
			'Sua inscrição no {{nome_do_evento}} está confirmada.',
			'Nosso encontro acontece amanhã, às 19h.',
			'Separe esse horário na sua agenda. Estamos preparando uma experiência especial para você.'
		],
		cta: 'Informações do evento'
	},
	cart_open: {
		id: 'cart_open',
		label: 'Abertura de carrinho',
		sampleLead: 'Camila',
		paragraphs: [
			'Oi, {{primeiro_nome}}!',
			'As inscrições para o {{nome_do_produto}} estão abertas.',
			'Você já pode consultar todos os módulos, os bônus e as condições de inscrição do treinamento.',
			'Se tiver alguma dúvida, nossa equipe está disponível para ajudar.'
		],
		cta: 'Conhecer o treinamento',
		ctaVariable: 'link_de_inscricao'
	},
	checkout_recovery: {
		id: 'checkout_recovery',
		label: 'Recuperação de checkout',
		sampleLead: 'Mariana',
		paragraphs: [
			'Oi, {{primeiro_nome}}! Tudo bem?',
			'Sua inscrição no {{nome_do_produto}} ainda não foi concluída.',
			'Ficou com alguma dúvida sobre o treinamento, o acesso às aulas ou as formas de pagamento?',
			'Nossa equipe está disponível para te ajudar.',
			'Você também pode retomar sua inscrição pelo link abaixo.'
		],
		cta: 'Retomar minha inscrição',
		ctaVariable: 'link_de_recuperacao'
	},
	reengagement: {
		id: 'reengagement',
		label: 'Reengajamento',
		sampleLead: 'Lucas',
		paragraphs: [
			'Olá, {{primeiro_nome}}!',
			'Quero compartilhar com você uma aula complementar sobre um dos temas que trabalhamos durante o treinamento gratuito.',
			'Ela pode ajudar você a entender melhor os próximos passos.'
		],
		cta: 'Assistir ao conteúdo'
	},
	variables_model: {
		id: 'variables_model',
		label: 'Modelo com variáveis',
		sampleLead: 'Mariana',
		paragraphs: [
			'Olá, {{primeiro_nome}}! Tudo bem?',
			'Hoje, às {{horario}}, teremos nossa aula sobre {{tema_da_aula}}.',
			'Preparei um conteúdo especial para ajudar você a avançar nos seus estudos.',
			'Acesse sua aula pelo link abaixo.'
		],
		cta: 'Acessar minha aula'
	},
	welcome: {
		id: 'welcome',
		label: 'Boas-vindas',
		sampleLead: 'Mariana',
		paragraphs: [
			'Oi, {{primeiro_nome}}!',
			'Sua inscrição no treinamento gratuito foi confirmada.',
			'O acesso às aulas está disponível no link abaixo.'
		],
		cta: 'Acessar o treinamento'
	},
	starting_soon: {
		id: 'starting_soon',
		label: 'Aula começando',
		sampleLead: 'Mariana',
		paragraphs: [
			'Oi, {{primeiro_nome}}!',
			'Nossa aula começa em 15 minutos.',
			'Seu acesso está disponível no link abaixo.'
		],
		cta: 'Acessar aula'
	},
	segmented_followup: {
		id: 'segmented_followup',
		label: 'Convite para quem assistiu às aulas',
		sampleLead: 'Camila',
		paragraphs: [
			'Olá, {{primeiro_nome}}!',
			'Você acompanhou as aulas do treinamento gratuito, e as inscrições para o {{nome_do_produto}} seguem abertas.',
			'Você pode rever os módulos, os bônus e as condições de inscrição antes de decidir.',
			'Se tiver alguma dúvida, nossa equipe está disponível para ajudar.'
		],
		cta: 'Conhecer o treinamento',
		ctaVariable: 'link_de_inscricao'
	}
};

export const EMAIL_MODELS: Record<MessageModelId, EmailModel> = {
	class_reminder: {
		id: 'class_reminder',
		subject: 'Hoje, às 20h: segunda aula do treinamento gratuito',
		preview: 'Vamos aprofundar um dos principais conceitos da primeira aula.',
		paragraphs: [
			'Oi, {{primeiro_nome}}!',
			'Hoje, às 20h, teremos a segunda aula do nosso treinamento gratuito. Vamos aprofundar um dos principais conceitos apresentados na primeira aula. Seu acesso está disponível no botão abaixo.'
		],
		cta: 'Acessar aula'
	},
	paid_confirmation: {
		id: 'paid_confirmation',
		subject: 'Inscrição confirmada: {{nome_do_evento}}',
		preview: 'Nosso encontro acontece amanhã, às 19h.',
		paragraphs: [
			'Olá, {{primeiro_nome}}!',
			'Sua inscrição no {{nome_do_evento}} está confirmada. Nosso encontro acontece amanhã, às 19h. Separe esse horário na sua agenda.'
		],
		cta: 'Informações do evento'
	},
	cart_open: {
		id: 'cart_open',
		subject: 'As inscrições para o {{nome_do_produto}} estão abertas',
		preview: 'Consulte os módulos, os bônus e as condições de inscrição.',
		paragraphs: [
			'Oi, {{primeiro_nome}}!',
			'As inscrições para o {{nome_do_produto}} estão abertas. Você já pode consultar os módulos, os bônus e as condições de inscrição do treinamento.'
		],
		cta: 'Conhecer o treinamento'
	},
	checkout_recovery: {
		id: 'checkout_recovery',
		subject: 'Sua inscrição no {{nome_do_produto}} ainda não foi concluída',
		preview: 'Ficou com alguma dúvida? Nossa equipe pode ajudar.',
		paragraphs: [
			'Oi, {{primeiro_nome}}! Tudo bem?',
			'Sua inscrição no {{nome_do_produto}} ainda não foi concluída. Ficou com alguma dúvida sobre o treinamento, o acesso às aulas ou as formas de pagamento? Você também pode retomar pelo botão abaixo.'
		],
		cta: 'Retomar minha inscrição'
	},
	reengagement: {
		id: 'reengagement',
		subject: 'Uma aula complementar para você',
		preview: 'Um conteúdo sobre os próximos passos.',
		paragraphs: [
			'Olá, {{primeiro_nome}}!',
			'Quero compartilhar com você uma aula complementar sobre um dos temas que trabalhamos durante o treinamento gratuito. Ela pode ajudar você a entender melhor os próximos passos.'
		],
		cta: 'Assistir ao conteúdo'
	},
	variables_model: {
		id: 'variables_model',
		subject: 'Hoje, às {{horario}}: aula sobre {{tema_da_aula}}',
		preview: 'Um conteúdo especial para você avançar nos estudos.',
		paragraphs: [
			'Olá, {{primeiro_nome}}! Tudo bem?',
			'Hoje, às {{horario}}, teremos nossa aula sobre {{tema_da_aula}}. Preparei um conteúdo especial para ajudar você a avançar nos seus estudos.'
		],
		cta: 'Acessar minha aula'
	},
	welcome: {
		id: 'welcome',
		subject: 'Sua inscrição no treinamento gratuito foi confirmada',
		preview: 'O acesso às aulas está disponível.',
		paragraphs: [
			'Oi, {{primeiro_nome}}!',
			'Sua inscrição no treinamento gratuito foi confirmada. O acesso às aulas está disponível no botão abaixo.'
		],
		cta: 'Acessar o treinamento'
	},
	starting_soon: {
		id: 'starting_soon',
		subject: 'A aula começa em 15 minutos',
		preview: 'Seu acesso está disponível.',
		paragraphs: [
			'Oi, {{primeiro_nome}}!',
			'Nossa aula começa em 15 minutos. Seu acesso está disponível no botão abaixo.'
		],
		cta: 'Acessar aula'
	},
	segmented_followup: {
		id: 'segmented_followup',
		subject: 'As inscrições para o {{nome_do_produto}} seguem abertas',
		preview: 'Você acompanhou as aulas e pode consultar as condições.',
		paragraphs: [
			'Olá, {{primeiro_nome}}!',
			'Você acompanhou as aulas do treinamento gratuito, e as inscrições para o {{nome_do_produto}} seguem abertas. Você pode rever os módulos, os bônus e as condições de inscrição antes de decidir.'
		],
		cta: 'Conhecer o treinamento'
	}
};

export const CONSENT_NOTE =
	'Envio sujeito a consentimento do contato, elegibilidade, templates aprovados e às políticas de cada canal.';

const TOKEN = /\{\{(\w+)\}\}/g;

export function parse(template: string): Segment[] {
	const out: Segment[] = [];
	let last = 0;
	for (const match of template.matchAll(TOKEN)) {
		const at = match.index ?? 0;
		if (at > last) out.push({ text: template.slice(last, at) });
		out.push({ text: match[0], variable: match[1] });
		last = at + match[0].length;
	}
	if (last < template.length) out.push({ text: template.slice(last) });
	return out;
}

export function fill(
	template: string,
	values: VariableValues,
	filled: (variable: string) => boolean = () => true
): Segment[] {
	return parse(template).map((segment) =>
		segment.variable && filled(segment.variable)
			? { text: values[segment.variable] ?? segment.text, variable: segment.variable }
			: segment
	);
}

export function variablesIn(templates: string[]): string[] {
	const found: string[] = [];
	for (const template of templates)
		for (const segment of parse(template))
			if (segment.variable && !found.includes(segment.variable)) found.push(segment.variable);
	return found;
}

export function literalText(model: MessageModel): string[] {
	const values: VariableValues = { ...LEADS[0].values, primeiro_nome: model.sampleLead };
	return model.paragraphs.map((paragraph) =>
		fill(paragraph, values)
			.map((segment) => segment.text)
			.join('')
	);
}

export const INSTAGRAM_KEYWORDS = ['AULA', 'QUERO', 'EBOOK', 'DESAFIO'] as const;
export type InstagramKeyword = (typeof INSTAGRAM_KEYWORDS)[number];

export const INSTAGRAM_DM = {
	paragraphs: [
		'Oi, {{primeiro_nome}}! Que bom que você quer participar da nossa aula.',
		'Preparei um conteúdo especial para mostrar como dar os próximos passos no {{nome_do_produto}}.',
		'Faça sua inscrição gratuita pelo link abaixo.'
	],
	cta: 'Garantir minha vaga'
};
