export const experts = {
	title: 'Experts',
	errors: {
		loadFailed: 'Não foi possível carregar os experts.',
		notFound: 'Expert não encontrado.'
	},
	list: {
		description: 'Gerencie os experts da sua operação e suas integrações.',
		newExpert: 'Novo expert',
		emptyTitle: 'Nenhum expert cadastrado',
		emptyDescription: 'Cadastre o primeiro expert para conectar suas plataformas.',
		register: 'Cadastrar expert',
		searchLabel: 'Buscar experts',
		searchPlaceholder: 'Buscar por nome, e-mail ou nome comercial',
		count: { one: '{count} expert', other: '{count} experts' },
		columns: {
			expert: 'Expert',
			commercialName: 'Nome comercial',
			status: 'Status',
			instagram: 'Instagram',
			actions: 'Ações'
		},
		noEmail: 'Sem e-mail',
		active: 'Ativo',
		inactive: 'Inativo',
		configure: 'Configurar',
		configureAria: 'Configurar {name}',
		notFound: 'Nenhum expert encontrado'
	},
	new: {
		pageTitle: 'Novo expert',
		description: 'Depois de salvar, você poderá conectar a conta do Instagram.',
		submit: 'Salvar expert'
	},
	detail: {
		description: 'Configurações e conta do Instagram do expert.',
		created: 'Expert cadastrado! Agora conecte a conta do Instagram.',
		submit: 'Salvar alterações',
		dangerZone: 'Zona de perigo',
		dangerDescription:
			'Excluir o expert remove as configurações e desconecta a conta do Instagram.',
		delete: 'Excluir expert',
		deleteTitle: 'Excluir {name}?',
		deleteWarning: 'Essa ação não pode ser desfeita.'
	},
	form: {
		dataTitle: 'Dados do expert',
		dataDescription: 'Informações de identificação.',
		nameLabel: 'Nome *',
		namePlaceholder: 'Ex.: Ana Souza',
		nameRequired: 'Informe o nome do expert.',
		commercialNameLabel: 'Nome comercial',
		commercialNamePlaceholder: 'Ex.: Método Ana Souza',
		emailLabel: 'E-mail *',
		emailPlaceholder: 'contato@expert.com',
		integrationsTitle: 'Integrações da Meta',
		integrationsDescription:
			'Cada canal tem uma autorização própria na Meta: conectar um não conecta os outros.',
		saveError: 'Não foi possível salvar o expert. Tente novamente.'
	}
};
