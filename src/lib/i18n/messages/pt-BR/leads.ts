export const leads = {
	title: 'Leads',
	description: 'Pessoas que se cadastraram nos formulários das páginas de {expert}.',
	descriptionAll: 'Pessoas que se cadastraram nos formulários das páginas dos seus experts.',
	exportCsv: 'Exportar CSV',
	selectSubject: 'os leads',
	selectEmpty: 'Os leads são organizados por expert. Cadastre um para começar.',
	search: {
		label: 'Buscar lead',
		placeholder: 'E-mail ou telefone completo',
		clear: 'Limpar busca',
		submit: 'Buscar'
	},
	filter: {
		launchLabel: 'Filtrar por lançamento',
		allLaunches: 'Todos os lançamentos'
	},
	summary: {
		count: { one: '{formatted} lead', other: '{formatted} leads' },
		inLaunch: 'no lançamento {name}',
		selectedLaunch: 'selecionado',
		forSearch: 'para "{query}"'
	},
	errors: {
		loadMore: 'Não foi possível carregar mais leads. Tente novamente.',
		export: 'Não foi possível gerar o arquivo. Tente novamente.',
		delete: 'Não foi possível excluir o lead. Tente novamente.',
		encryptionNotConfigured: 'A captação de leads ainda não foi configurada no servidor.',
		validation: 'Busque por um e-mail completo ou por um telefone com DDD.',
		load: 'Não foi possível carregar os leads.'
	},
	unavailable: 'Leads indisponíveis',
	clearFilters: 'Limpar filtros',
	empty: {
		notFoundTitle: 'Nenhum lead encontrado',
		noneTitle: 'Nenhum lead ainda',
		notFoundDescription: 'Confira o e-mail ou telefone digitado, ou mude o lançamento.',
		noneDescription: 'Configure um formulário no Rastreamento: cada envio vira um lead aqui.',
		configureTracking: 'Configurar rastreamento'
	},
	table: {
		lead: 'Lead',
		contact: 'Contato',
		launches: 'Lançamentos',
		firstSignup: 'Primeiro cadastro',
		origin: 'Origem',
		actions: 'Ações',
		noName: 'Sem nome',
		launchFallback: 'Lançamento',
		noLaunch: 'Sem lançamento',
		deleteAria: 'Excluir {name}',
		leadFallback: 'lead'
	},
	loadMore: 'Carregar mais',
	delete: {
		title: 'Excluir os dados de {name}?',
		thisLead: 'este lead',
		description:
			'O lead, os cadastros e as inscrições nos lançamentos são apagados e não podem ser recuperados. Use para atender pedidos de exclusão de dados (LGPD).'
	}
};
