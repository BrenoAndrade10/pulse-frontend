export type ModeId = 'scheduled' | 'behavior';

export type SequenceItem = {
	id: string;
	group: 'ruler' | 'fixed' | 'rule';
	tag: string;
	short: string;
	title: string;
	when: string;
	stage: string;
	subject: string;
	paragraphs: string[];
	cta: string;
	signal: string;
	sent: number;
	clicks: number;
	unsubs: number;
	conversions: number;
};

export const MODES: { id: ModeId; label: string; short: string; blurb: string }[] = [
	{
		id: 'scheduled',
		label: 'Comunicação programada',
		short: 'Programada',
		blurb: 'Dia e horário definidos, na régua do lead ou em data fixa.'
	},
	{
		id: 'behavior',
		label: 'Comunicação comportamental',
		short: 'Comportamental',
		blurb: 'A sequência muda conforme o que cada lead faz na jornada.'
	}
];

export const ITEMS: SequenceItem[] = [
	{
		id: 'd0',
		group: 'ruler',
		tag: 'Dia 0',
		short: 'Boas-vindas',
		title: 'Boas-vindas e material gratuito',
		when: 'Na entrada do lead',
		stage: 'Boas-vindas',
		subject: '{{primeiro_nome}}, seu material gratuito chegou',
		paragraphs: [
			'Oi, {{primeiro_nome}}! Aqui é {{nome_do_expert}}.',
			'Sua inscrição no {{nome_do_evento}} está confirmada e o material gratuito já está liberado para você.'
		],
		cta: 'Baixar o material',
		signal: 'clique no material gratuito',
		sent: 1240,
		clicks: 486,
		unsubs: 3,
		conversions: 0
	},
	{
		id: 'd2',
		group: 'ruler',
		tag: 'Dia 2',
		short: 'Conteúdo',
		title: 'Conteúdo educacional',
		when: '2 dias após a entrada',
		stage: 'Aprendizado',
		subject: 'Um conceito para você aplicar ainda esta semana',
		paragraphs: [
			'{{primeiro_nome}}, separei uma aula curta sobre posicionamento, um dos pilares do {{nome_do_produto}}.',
			'Assista no seu ritmo e anote o que faz sentido para o seu momento.'
		],
		cta: 'Assistir à aula',
		signal: 'clique no conteúdo educacional',
		sent: 1198,
		clicks: 402,
		unsubs: 4,
		conversions: 0
	},
	{
		id: 'd4',
		group: 'ruler',
		tag: 'Dia 4',
		short: 'Caso prático',
		title: 'Apresentação de um caso prático',
		when: '4 dias após a entrada',
		stage: 'Consideração',
		subject: 'Caso prático: do plano à execução, passo a passo',
		paragraphs: [
			'Olá, {{primeiro_nome}}! Montei um caso ilustrativo mostrando como o método funciona na rotina de quem está começando.',
			'Ele ajuda a visualizar os próximos passos dentro do {{nome_do_produto}}.'
		],
		cta: 'Ver o caso prático',
		signal: 'clique no link do caso prático',
		sent: 1151,
		clicks: 318,
		unsubs: 5,
		conversions: 4
	},
	{
		id: 'd5',
		group: 'ruler',
		tag: 'Dia 5',
		short: 'Oferta',
		title: 'Oferta segmentada',
		when: '5 dias, só para quem clicou',
		stage: 'Decisão',
		subject: '{{primeiro_nome}}, as inscrições do {{nome_do_produto}} encerram {{data_e_horario}}',
		paragraphs: [
			'Oi, {{primeiro_nome}}! Você acompanhou o conteúdo e pode consultar as condições de inscrição.',
			'Se tiver dúvidas, é só responder este e-mail.'
		],
		cta: 'Conhecer o treinamento',
		signal: 'clique na oferta',
		sent: 412,
		clicks: 131,
		unsubs: 2,
		conversions: 9
	},
	{
		id: 'd7',
		group: 'ruler',
		tag: 'Dia 7',
		short: 'Reengajamento',
		title: 'Reengajamento ou acompanhamento comercial',
		when: '7 dias, conforme a jornada',
		stage: 'Acompanhamento',
		subject: 'Ficou alguma dúvida, {{primeiro_nome}}?',
		paragraphs: [
			'Olá, {{primeiro_nome}}! Se preferir, nossa equipe pode conversar com você sobre o {{nome_do_produto}}.',
			'Quem não clicou recebe um conteúdo complementar em vez da oferta.'
		],
		cta: 'Falar com a equipe',
		signal: 'resposta ou clique no acompanhamento',
		sent: 806,
		clicks: 74,
		unsubs: 6,
		conversions: 3
	},
	{
		id: 'f-cpl',
		group: 'fixed',
		tag: 'Seg 19h45',
		short: 'Lembrete de CPL',
		title: 'Lembrete de CPL',
		when: 'Segunda-feira, 19h45',
		stage: 'Aprendizado',
		subject: 'Lembrete: {{nome_do_evento}} {{data_e_horario}}',
		paragraphs: [
			'Oi, {{primeiro_nome}}! Reserve o horário da aula.',
			'Seu acesso personalizado está no botão abaixo.'
		],
		cta: 'Acessar a aula',
		signal: 'clique no acesso da aula',
		sent: 1240,
		clicks: 574,
		unsubs: 2,
		conversions: 0
	},
	{
		id: 'f-content',
		group: 'fixed',
		tag: 'Ter 10h00',
		short: 'Entrega de conteúdo',
		title: 'Entrega de conteúdo',
		when: 'Terça-feira, 10h00',
		stage: 'Aprendizado',
		subject: 'A gravação da aula está disponível, {{primeiro_nome}}',
		paragraphs: [
			'Olá, {{primeiro_nome}}! A aula de ontem do {{nome_do_evento}} já está disponível.',
			'Assista quando preferir.'
		],
		cta: 'Assistir à gravação',
		signal: 'clique na gravação',
		sent: 1214,
		clicks: 431,
		unsubs: 3,
		conversions: 0
	},
	{
		id: 'f-cart',
		group: 'fixed',
		tag: 'Qui 09h00',
		short: 'Abertura de carrinho',
		title: 'Abertura de carrinho',
		when: 'Quinta-feira, 09h00',
		stage: 'Decisão',
		subject: 'As inscrições do {{nome_do_produto}} estão abertas',
		paragraphs: [
			'Oi, {{primeiro_nome}}! Você já pode consultar módulos, bônus e condições.',
			'As inscrições ficam abertas até {{data_e_horario}}.'
		],
		cta: 'Conhecer o treinamento',
		signal: 'clique na página de inscrição',
		sent: 1180,
		clicks: 356,
		unsubs: 4,
		conversions: 11
	},
	{
		id: 'f-close',
		group: 'fixed',
		tag: 'Dom 20h00',
		short: 'Encerramento',
		title: 'Encerramento das inscrições',
		when: 'Domingo, 20h00',
		stage: 'Decisão',
		subject: 'Últimas horas, {{primeiro_nome}}: inscrições encerram {{data_e_horario}}',
		paragraphs: [
			'Oi, {{primeiro_nome}}! Este é o último aviso sobre as inscrições do {{nome_do_produto}}.',
			'Depois desse prazo, o acesso ao link {{link_personalizado}} deixa de valer.'
		],
		cta: 'Garantir minha vaga',
		signal: 'clique no último aviso',
		sent: 960,
		clicks: 244,
		unsubs: 5,
		conversions: 7
	},
	{
		id: 'r-click',
		group: 'rule',
		tag: 'Clicou na aula',
		short: 'Clicou no link da aula',
		title: 'Clicou no link da aula',
		when: 'Se clicou no link da aula, recebe o conteúdo complementar',
		stage: 'Aprendizado',
		subject: '{{primeiro_nome}}, um conteúdo complementar da aula',
		paragraphs: [
			'Olá, {{primeiro_nome}}! Como você acessou a aula, preparei um material que aprofunda o tema.',
			'Ele faz parte da jornada do {{nome_do_produto}}.'
		],
		cta: 'Acessar o complemento',
		signal: 'clique no conteúdo complementar',
		sent: 574,
		clicks: 203,
		unsubs: 1,
		conversions: 2
	},
	{
		id: 'r-idle',
		group: 'rule',
		tag: 'Sem interação',
		short: 'Não interagiu',
		title: 'Não interagiu',
		when: 'Se não interagiu, recebe um e-mail de reengajamento',
		stage: 'Reengajamento',
		subject: 'Ainda faz sentido receber nossos e-mails, {{primeiro_nome}}?',
		paragraphs: [
			'Oi, {{primeiro_nome}}! Faz alguns dias que não vemos você por aqui.',
			'Escolha abaixo o que quer continuar recebendo. Você pode cancelar quando quiser.'
		],
		cta: 'Escolher preferências',
		signal: 'clique nas preferências',
		sent: 336,
		clicks: 41,
		unsubs: 9,
		conversions: 1
	},
	{
		id: 'r-heat',
		group: 'rule',
		tag: 'Pulse Heat',
		short: 'Atingiu a pontuação',
		title: 'Atingiu a pontuação configurada',
		when: 'Se a pontuação do Pulse Heat for atingida, avalia a comunicação comercial',
		stage: 'Decisão',
		subject: '{{primeiro_nome}}, vamos conversar sobre o {{nome_do_produto}}?',
		paragraphs: [
			'Olá, {{primeiro_nome}}! Notamos seu interesse e quero entender como posso ajudar.',
			'Uma pessoa da equipe revisa esta comunicação antes de qualquer contato comercial.'
		],
		cta: 'Agendar conversa',
		signal: 'pontuação do Pulse Heat atingida',
		sent: 88,
		clicks: 37,
		unsubs: 0,
		conversions: 6
	},
	{
		id: 'r-buy',
		group: 'rule',
		tag: 'Compra',
		short: 'Compra identificada',
		title: 'Compra identificada',
		when: 'Se a compra for identificada, interrompe a recuperação e inicia as boas-vindas',
		stage: 'Boas-vindas',
		subject: 'Bem-vindo ao {{nome_do_produto}}, {{primeiro_nome}}',
		paragraphs: [
			'Oi, {{primeiro_nome}}! Sua compra foi identificada e a recuperação foi interrompida.',
			'Seu acesso ao {{nome_do_produto}} está no link {{link_personalizado}}.'
		],
		cta: 'Acessar minha área',
		signal: 'acesso à área do aluno',
		sent: 54,
		clicks: 31,
		unsubs: 0,
		conversions: 0
	}
];

export const itemsFor = (mode: ModeId) =>
	ITEMS.filter((item) => (mode === 'scheduled' ? item.group !== 'rule' : item.group === 'rule'));

export const RULER = ITEMS.filter((item) => item.group === 'ruler');

export const statsOf = (item: SequenceItem) => {
	const failed = Math.round(item.sent * 0.026);
	const delivered = item.sent - failed;
	const opens = Math.round(delivered * 0.37);
	return {
		sent: item.sent,
		delivered,
		opens,
		clicks: item.clicks,
		failed,
		unsubs: item.unsubs,
		conversions: item.conversions
	};
};
