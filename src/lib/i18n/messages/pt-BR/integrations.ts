export const integrations = {
	pageTitle: 'Integrações',
	description: 'Conecte os canais e plataformas usados na sua operação.',
	states: {
		notConnected: 'Não conectado',
		connected: 'Conectado',
		pendingSetup: 'Configuração pendente',
		attention: 'Atenção',
		comingSoon: 'Em breve'
	},
	upcoming: {
		title: 'Em breve',
		count: { one: '{count} integração planejada', other: '{count} integrações planejadas' },
		expertScope: 'Conectadas por expert',
		tenantScope: 'Conectadas pela empresa',
		tenantHint: 'Uma conexão da empresa poderá atender produtos e vendas de vários experts.'
	},
	status: {
		connected: 'Conectada',
		expired: 'Conexão expirada',
		disconnected: 'Não conectada'
	},
	badges: {
		soon: 'Em breve'
	},
	actions: {
		connect: 'Conectar',
		manage: 'Gerenciar',
		reconnect: 'Reconectar',
		disconnect: 'Desconectar'
	},
	catalog: {
		hotmart: 'Sincronize vendas, produtos e comissões.',
		telegram: 'Integre canais, comunidades e automações.',
		kiwify: 'Importe vendas, produtos e indicadores.'
	},
	meta: {
		instagram: {
			description: 'Publicações, Reels e comentários da conta profissional.',
			asset: 'Conta profissional do Instagram',
			authorization: 'Login unificado da Meta',
			connect: 'Conectar com Facebook'
		},
		metaAds: {
			description: 'Campanhas, investimento e resultados do Gerenciador de Anúncios.',
			asset: 'Conta de anúncios e Pixel da Meta',
			authorization: 'Login do Facebook para Empresas',
			connect: 'Conectar com Facebook'
		},
		whatsapp: {
			description: 'Conversas e atendimentos pela API de Nuvem do WhatsApp.',
			asset: 'Conta do WhatsApp Business (WABA) e número de telefone',
			authorization: 'Cadastro incorporado com o Facebook',
			connect: 'Conectar com Facebook'
		}
	},
	instagram: {
		selectedDescription: 'Conta do Instagram do expert selecionado.',
		expiredHint: 'Conexão expirada',
		sectionTitle: 'Contas do Instagram',
		sectionDescription: 'Conexões profissionais vinculadas aos experts.',
		emptyTitle: 'Nenhum expert para conectar',
		emptyDescription:
			'Cada conta do Instagram é vinculada a um expert. Cadastre um expert para começar.',
		noAccount: 'Nenhuma conta autorizada',
		saveFirst: 'Salve o expert para poder conectar a conta.',
		waitingAuthorization: 'Conclua a autorização na janela da Meta.',
		connectedAt: 'Conectada em {date}',
		connected: 'Conta profissional conectada a este expert.',
		expired: 'A autorização expirou. Reconecte para voltar a sincronizar.',
		authorize: 'Autorize o acesso à conta profissional do Instagram.',
		connectedSuccess: 'Conta do Instagram conectada.',
		connectFailed: 'Não foi possível conectar a conta. Tente novamente.',
		disconnectFailed: 'Não foi possível desconectar a conta. Tente novamente.',
		reconnect: 'Reconectar Instagram',
		popupBlocked:
			'Não foi possível abrir a Meta. Permita pop-ups para este site e tente novamente.',
		missingAuthorizationUrl: 'O backend não retornou a URL de autorização do Instagram.',
		oauthErrors: {
			denied: 'A autorização foi cancelada na Meta.',
			invalidState: 'A autorização expirou. Clique em conectar e tente novamente.',
			expertNotFound: 'Este expert não foi encontrado. Atualize a página e tente novamente.',
			exchangeFailed:
				'A Meta recusou a conexão. Confira a configuração da conta e tente novamente.',
			missingPermissions:
				'A Meta não concedeu todas as permissões necessárias. Autorize novamente ou fale com o suporte.',
			noInstagramAccount:
				'Nenhuma conta profissional do Instagram vinculada a uma Página foi autorizada.',
			multipleInstagramAccounts:
				'Selecione apenas uma conta profissional do Instagram para este expert.',
			accountAlreadyConnected: 'Esta conta do Instagram já está conectada a outro expert.',
			generic: 'Não foi possível conectar a conta do Instagram. Tente novamente.'
		}
	},
	whatsapp: {
		overviewDescription: 'Número conectado de cada expert para mensagens e automações.',
		noNumber: 'Nenhum número conectado',
		checkFailed: 'Não foi possível consultar a conexão',
		accountsLoadingAria: 'Carregando conexões do WhatsApp',
		unavailable: 'WhatsApp ainda não configurado nesta instalação',
		sectionTitle: 'WhatsApp Business',
		sectionDescription: 'Conexão do expert selecionado para mensagens e automações.',
		emptyTitle: 'Nenhum expert para conectar',
		emptyDescription: 'Cadastre um expert antes de conectar um número do WhatsApp Business.',
		loadingAria: 'Carregando conexão do WhatsApp',
		loadError: 'Não foi possível consultar a conexão deste expert.',
		badgeError: 'Erro',
		connectedAt: 'Conectado em {date}',
		authorize: 'Autorize a conta e o número do WhatsApp Business deste expert.',
		connectedSuccess: 'WhatsApp conectado com sucesso.',
		cancelled: 'A conexão com o WhatsApp foi cancelada.',
		disconnected: 'WhatsApp desconectado.',
		connect: 'Conectar WhatsApp',
		notConfigured: 'WhatsApp ainda não configurado nesta instalação',
		verifiedName: 'Nome verificado:',
		quality: 'Qualidade',
		qualityLevels: {
			high: 'Alta',
			medium: 'Média',
			low: 'Baixa',
			unknown: 'Não informada'
		},
		disconnectTitle: 'Desconectar WhatsApp?',
		disconnectWarning:
			'As automações de WhatsApp deste expert vão parar até que um número seja conectado novamente.',
		errors: {
			notConfigured: 'O WhatsApp ainda não foi configurado nesta instalação.',
			notAuthorized: 'Esta conta do WhatsApp não está autorizada para esta instalação.',
			numberAlreadyConnected: 'Este número do WhatsApp já está conectado a outro expert.',
			network: 'Não foi possível acessar o servidor. Verifique sua conexão e tente novamente.',
			generic: 'Não foi possível concluir a operação com o WhatsApp. Tente novamente.'
		}
	},
	signup: {
		sdkUnavailable: 'O SDK da Meta não ficou disponível.',
		sdkTimeout: 'A Meta demorou para carregar. Tente novamente.',
		sdkLoadFailed: 'Não foi possível carregar a Meta.',
		metaFailed: 'A Meta não conseguiu concluir a conexão.',
		invalidData: 'A Meta retornou dados inválidos para a conexão.',
		timeout: 'A conexão com a Meta expirou. Tente novamente.',
		openFailed: 'Não foi possível abrir a conexão com a Meta.'
	}
};
