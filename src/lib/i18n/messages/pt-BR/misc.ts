export const misc = {
	selectExpert: {
		title: 'Selecione um expert',
		description: 'Escolha um expert no seletor de contexto para ver {subject}.',
		emptyTitle: 'Nenhum expert cadastrado',
		register: 'Cadastrar expert'
	},
	placeholders: {
		email: {
			title: 'E-mail',
			description: 'Crie e acompanhe mensagens para os contatos dos seus lançamentos.',
			emptyTitle: 'Disparos de e-mail em breve',
			emptyDescription:
				'Em breve, você poderá criar campanhas e automatizar mensagens de e-mail por aqui.'
		},
		campaigns: {
			title: 'Campanhas',
			description: 'Campanhas ativas nas contas de anúncio dos seus experts.',
			emptyTitle: 'Nenhuma campanha encontrada',
			emptyDescription:
				'As campanhas são importadas automaticamente das contas de anúncios conectadas pelo Meta Ads.',
			connect: 'Conectar contas'
		},
		reports: {
			title: 'Relatórios',
			description: 'Relatórios de performance por expert, campanha e período.',
			emptyTitle: 'Nenhum relatório disponível',
			emptyDescription:
				'Os relatórios ficam disponíveis assim que houver dados de campanhas importados.',
			goToDashboard: 'Ir para o dashboard'
		}
	},
	dataDeletion: {
		title: 'Exclusão de dados da Meta',
		description: 'Como solicitar a exclusão dos dados da Meta associados à sua conta.',
		sections: {
			request: 'Como solicitar',
			disconnect: 'Desconectar integrações',
			deleted: 'O que será apagado',
			deadline: 'Prazo de exclusão',
			retention: 'Retenções legais',
			privacy: 'Política de Privacidade'
		},
		intro:
			'Esta página explica como solicitar a exclusão dos dados que o {product} recebeu da Meta, incluindo Facebook e Instagram.',
		requestLead: 'Você pode solicitar a exclusão dos seus dados da Meta por e-mail:',
		requestEmail:
			'Envie uma mensagem para {email} com o assunto “Exclusão de dados da Meta” e informe o e-mail da sua conta.',
		requestConfirmation:
			'Responderemos pelo mesmo canal para confirmar o recebimento e a conclusão da solicitação.',
		disconnect:
			'Como alternativa, desconecte o Instagram ou o WhatsApp em Integrações dentro da plataforma. Isso interrompe o acesso futuro da integração e inicia a remoção dos dados vinculados conforme a Política de Privacidade.',
		disconnectLink: 'Abrir Integrações',
		deleted:
			'Após validar a solicitação, apagamos as credenciais e os tokens de acesso, os identificadores e demais dados da conta conectada recebidos da Meta. Leads e outros dados vinculados são tratados e removidos conforme os critérios da Política de Privacidade.',
		deadline:
			'A exclusão é concluída em até {days} dias, salvo a necessidade de confirmação adicional ou de retenção prevista em lei.',
		retention:
			'Podemos manter dados pelo período necessário para cumprir obrigações legais, exercer direitos ou atender determinações de autoridades. Nesses casos, os dados ficam restritos e são eliminados quando a obrigação termina.',
		privacy: 'Para conhecer os prazos e as demais regras de tratamento, consulte a',
		privacyLink: 'Política de Privacidade'
	}
};
