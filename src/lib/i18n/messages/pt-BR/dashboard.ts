export const dashboard = {
	header: {
		overview: 'Visão geral',
		expert: 'Expert',
		periodLabel: 'Período',
		launchDescription: '{type}. Resultados dos últimos {period}.',
		expertDescription: 'Resultados consolidados dos lançamentos de {name} nos últimos {period}.',
		allDescription: 'Resultados consolidados dos seus experts nos últimos {period}.'
	},
	periods: {
		'7d': '7 dias',
		'30d': '30 dias',
		'90d': '90 dias'
	},
	actions: {
		viewLeads: 'Ver leads',
		viewLaunches: 'Ver lançamentos',
		goToLaunches: 'Ir para lançamentos',
		registerExpert: 'Cadastrar expert'
	},
	launchStatus: {
		draft: 'Rascunho',
		planned: 'Planejado',
		in_progress: 'Em andamento',
		completed: 'Concluído',
		canceled: 'Cancelado',
		archived: 'Arquivado'
	},
	launchType: {
		internal: 'Lançamento clássico',
		seed: 'Lançamento semente',
		perpetual: 'Perpétuo / Evergreen',
		webinar: 'Webinar / Masterclass',
		other: 'Outro'
	},
	kpi: {
		spend: 'Investimento',
		revenue: 'Receita',
		roas: 'ROAS',
		leads: 'Leads',
		cpl: 'Custo por lead',
		sales: 'Vendas',
		noData: 'Sem dados no período',
		vsPrevious: 'vs. período anterior'
	},
	chart: {
		title: 'Investimento x Receita',
		description: 'Evolução diária no período selecionado.',
		ariaLabel: 'Gráfico de investimento e receita por dia',
		revenue: 'Receita',
		spend: 'Investimento',
		emptyTitle: 'Nenhum dado para exibir',
		emptyDescription:
			'Os resultados aparecem aqui assim que houver uma conta de anúncios do Meta Ads conectada com campanhas ativas.'
	},
	instagram: {
		title: 'Instagram',
		description: 'Status das conexões dos experts.',
		connected: 'Conectadas',
		expired: 'Conexão expirada',
		notConnected: 'Não conectadas',
		manage: 'Gerenciar conexões',
		emptyTitle: 'Nenhuma conta conectada',
		emptyDescription: 'Cadastre um expert para conectar a conta profissional do Instagram dele.'
	},
	table: {
		title: 'Desempenho por expert',
		description: 'Comparativo de resultados no período.',
		expert: 'Expert',
		spend: 'Investimento',
		revenue: 'Receita',
		roas: 'ROAS',
		leads: 'Leads',
		cpl: 'CPL',
		emptyTitle: 'Sem desempenho registrado',
		emptyDescription: 'Quando seus experts tiverem campanhas rodando, o comparativo aparece aqui.'
	},
	announce: {
		dismissed: 'Guia de configuração dispensado. Você pode reabri-lo em Configurações.',
		finished: 'Guia de configuração concluído.'
	},
	checklist: {
		allDoneEyebrow: 'Tudo pronto',
		eyebrow: 'Primeiros passos',
		allDoneTitle: 'Seu Pulse está configurado',
		title: 'Prepare seu Pulse',
		allDoneDescription:
			'Todas as etapas aplicáveis foram concluídas. Você pode reabrir o guia em Configurações.',
		description: 'Configure as funcionalidades que deseja utilizar. Você pode continuar depois.',
		progress: 'Progresso da configuração',
		progressCount: '{completed} de {total} concluídos',
		finish: 'Concluir',
		dismiss: 'Dispensar por agora',
		next: 'Próximo passo',
		doneSr: '(concluído)'
	},
	onboarding: {
		subjectAll: 'seus experts',
		expert: {
			title: 'Cadastre seu primeiro expert',
			description: 'Nome, e-mail e dados básicos de quem você gerencia.',
			cta: 'Cadastrar'
		},
		instagram: {
			title: 'Conecte o Instagram',
			titleSingle: 'Conecte o Instagram de {name}',
			descriptionExpired:
				'A conexão expirou. Reconecte a conta profissional para voltar a importar publicações.',
			description: 'Autorize a conta profissional para importar publicações e Reels.',
			ctaReconnect: 'Reconectar',
			cta: 'Conectar'
		},
		pixel: {
			title: 'Instale o pixel do Pulse',
			description:
				'Meça cadastros e eventos nas páginas de {subject}. Escolha o expert no seletor de contexto.',
			cta: 'Configurar'
		},
		whatsapp: {
			title: 'Conecte o WhatsApp Business',
			description: 'Envie mensagens automáticas para os leads de {subject}.',
			cta: 'Conectar'
		}
	}
};
