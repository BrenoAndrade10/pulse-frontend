export const launches = {
	title: 'Lançamentos',
	description: 'Planejamento e calendário de {expert}.',
	descriptionAll: 'Planejamento dos lançamentos por expert.',
	new: 'Novo lançamento',
	backendUnavailable: 'O módulo de lançamentos ainda precisa ser disponibilizado pelo backend.',
	noExperts: 'Nenhum expert cadastrado',
	empty: {
		title: 'Nenhum lançamento configurado',
		description: 'Crie o primeiro lançamento deste expert para organizar o calendário e as metas.',
		create: 'Criar lançamento'
	},
	status: {
		draft: 'Rascunho',
		planned: 'Planejado',
		in_progress: 'Em andamento',
		completed: 'Concluído',
		canceled: 'Cancelado',
		archived: 'Arquivado'
	},
	types: {
		internal: 'Lançamento clássico',
		seed: 'Lançamento semente',
		perpetual: 'Perpétuo / Evergreen',
		webinar: 'Webinar / Masterclass',
		other: 'Outro'
	},
	table: {
		launch: 'Lançamento',
		type: 'Tipo',
		period: 'Período',
		status: 'Status',
		timezone: 'Fuso horário',
		expertFallback: 'Expert',
		noDescription: 'Sem descrição',
		noStart: 'Sem início',
		edit: 'Editar'
	},
	form: {
		editTitle: 'Editar lançamento',
		newTitle: 'Novo lançamento',
		description: 'Configure o responsável, a classificação e o período do lançamento.',
		expert: 'Expert responsável *',
		name: 'Nome *',
		start: 'Início',
		end: 'Término',
		status: 'Status',
		timezone: 'Fuso horário *',
		type: 'Tipo de lançamento',
		typeHint: 'Essa classificação é usada apenas para organizar os relatórios.',
		descriptionLabel: 'Descrição',
		saveChanges: 'Salvar alterações',
		create: 'Criar lançamento',
		saveError: 'Não foi possível salvar o lançamento.'
	},
	validation: {
		expert: 'Selecione o expert responsável.',
		name: 'Informe o nome do lançamento.',
		timezone: 'Selecione o fuso horário.',
		endsAfterStart: 'A data final deve ser posterior à inicial.'
	}
};
