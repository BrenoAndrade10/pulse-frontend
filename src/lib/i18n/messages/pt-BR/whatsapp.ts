export const whatsapp = {
	list: {
		pageTitle: 'WhatsApp',
		title: 'Mensagens do WhatsApp',
		descriptionExpert: 'Automatize mensagens para os leads de {name}.',
		descriptionNoExpert: 'Automatize mensagens a partir dos eventos dos seus experts.',
		create: 'Criar automação',
		loading: 'Carregando automações',
		loadError: {
			title: 'Não foi possível carregar as automações',
			description: 'Atualize a página e tente novamente.'
		},
		empty: {
			title: 'Nenhuma automação criada',
			description: 'Envie mensagens automaticamente quando seus leads realizarem uma ação.'
		},
		filters: {
			event: 'Filtrar por evento',
			destination: 'Filtrar por destino',
			allEvents: 'Todos os eventos',
			allDestinations: 'Todos os destinos',
			clear: 'Limpar filtros',
			noResults: {
				title: 'Nenhuma automação encontrada',
				description: 'Altere os filtros para ver outras automações.'
			}
		},
		destination: {
			private: 'Privado',
			group: 'Grupo',
			groupNamed: 'Grupo “{name}”'
		},
		status: {
			active: 'Ativa',
			paused: 'Pausada'
		},
		delayMinutes: 'após {value} min',
		delayHours: 'após {value} h',
		buttonsOne: '{count} botão',
		buttonsOther: '{count} botões',
		pause: 'Pausar {name}',
		activate: 'Ativar {name}',
		edit: 'Editar',
		duplicate: 'Duplicar',
		delete: 'Excluir',
		copyName: '{name} (cópia)',
		errors: {
			toggle: 'Não foi possível alterar o status da automação.',
			duplicate: 'Não foi possível duplicar a automação.',
			delete: 'Não foi possível excluir a automação.'
		},
		deleteDialog: {
			title: 'Excluir automação?',
			description: '“{name}” será removida permanentemente.'
		}
	},
	selectExpert: {
		subject: 'as automações do WhatsApp',
		emptyDescription: 'As automações são configuradas por expert. Cadastre um para começar.'
	},
	page: {
		noExpert: {
			title: 'Nenhum expert cadastrado',
			descriptionNew: 'Cadastre um expert antes de criar uma automação.',
			descriptionEdit: 'Cadastre um expert antes de editar uma automação.',
			action: 'Cadastrar expert'
		},
		loadingEditor: 'Carregando editor',
		notFound: 'Automação não encontrada.'
	},
	preview: {
		label: 'Prévia da mensagem no WhatsApp',
		business: 'Sua empresa',
		online: 'online',
		bodyPlaceholder: 'Sua mensagem aparece aqui.',
		buttonPlaceholder: 'Texto do botão',
		replyPlaceholder: 'A resposta automática aparece aqui.'
	},
	editor: {
		titleNew: 'Nova automação',
		titleEdit: 'Editar automação',
		description: 'Configure quando e como a mensagem será enviada pelo WhatsApp.',
		destination: {
			legend: 'Onde a mensagem será enviada?',
			privateTitle: 'Conversa privada',
			privateDescription: 'Envie uma mensagem diretamente para o lead do evento.',
			groupTitle: 'Grupo do WhatsApp',
			groupDescription: 'Envie uma mensagem para participantes de um grupo.',
			soon: 'Em breve',
			help: 'O envio para grupos ainda não está disponível na integração atual.'
		},
		legacy: {
			title: 'Automação de grupo somente leitura',
			description: 'Este destino pertence a uma versão anterior da automação.',
			alert:
				'O envio para grupos ainda não está disponível na integração atual. Esta automação não pode ser alterada ou salva.',
			name: 'Nome',
			group: 'Grupo',
			event: 'Evento',
			state: 'Estado',
			active: 'Ativa',
			draft: 'Rascunho'
		},
		preview: 'Prévia',
		previewLive: 'Prévia em tempo real',
		general: {
			title: '1. Informações gerais',
			description: 'Identifique esta automação para encontrá-la depois.',
			name: 'Nome da automação',
			namePlaceholder: 'Ex.: Boas-vindas após cadastro'
		},
		trigger: {
			title: '2. Gatilho',
			description: 'Escolha o evento que inicia esta automação.',
			event: 'Evento',
			launch: 'Lançamento',
			anyLaunch: 'Qualquer lançamento',
			pixelHint: 'Os eventos personalizados aparecerão depois que o rastreamento for configurado.'
		},
		recipients: {
			title: '3. Destinatários',
			description: 'Defina quem receberá esta mensagem.',
			lead: 'Lead do evento',
			leadDescription: 'A mensagem será enviada para o contato que disparou o evento.',
			warning: 'O lead precisa ter informado o WhatsApp no formulário.'
		},
		timing: {
			title: '4. Momento do envio',
			description: 'Escolha se a mensagem será imediata ou terá atraso.',
			legend: 'Momento do envio',
			now: 'Na hora',
			nowDescription: 'Enviar assim que o evento acontecer.',
			later: 'Com atraso',
			laterDescription: 'Aguardar antes de enviar.',
			time: 'Tempo',
			unit: 'Unidade',
			minutes: 'Minutos',
			hours: 'Horas'
		},
		message: {
			title: '5. Mensagem',
			description: 'Personalize o conteúdo enviado ao contato.',
			header: 'Cabeçalho (opcional)',
			body: 'Corpo da mensagem',
			footer: 'Rodapé (opcional)',
			formatting: 'Formatação da mensagem',
			bold: 'Negrito',
			italic: 'Itálico',
			strike: 'Riscado',
			mono: 'Monoespaçado',
			placeholder: 'Oi, {{primeiro_nome}}! Sua inscrição foi confirmada.',
			insertVariable: 'Inserir variável:',
			unknownVariable: 'Variável desconhecida: {variables}.'
		},
		buttons: {
			title: '6. Botões',
			description: 'Adicione respostas rápidas, um link ou envie sem botões.',
			type: 'Tipo',
			none: 'Sem botões',
			quickReply: 'Resposta rápida',
			link: 'Link',
			button: 'Botão {number}',
			moveUp: 'Mover botão para cima',
			moveDown: 'Mover botão para baixo',
			remove: 'Remover botão',
			label: 'Rótulo',
			reply: 'Resposta automática',
			url: 'URL',
			addQuickReply: 'Adicionar resposta rápida'
		},
		errors: {
			maxChars: 'Use no máximo {limit} caracteres.',
			nameRequired: 'Informe um nome para a automação.',
			bodyRequired: 'Escreva a mensagem que será enviada.',
			delayInvalid: 'Informe um número inteiro maior que zero.',
			buttonLabel: 'Informe o texto de todos os botões.',
			buttonReply: 'Informe a resposta automática de todos os botões.',
			buttonUrl: 'Informe uma URL válida começando com https://.',
			save: 'Não foi possível salvar o rascunho. Tente novamente.'
		},
		confirmLeave: 'Você tem alterações não salvas. Deseja sair?',
		confirmDiscard: 'Descartar as alterações desta automação?',
		footer: {
			help: 'O envio automático será liberado quando o backend de automações estiver disponível.',
			saveDraft: 'Salvar rascunho',
			activate: 'Ativar automação'
		}
	}
};
