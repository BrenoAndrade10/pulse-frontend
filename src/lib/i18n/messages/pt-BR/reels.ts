export const reels = {
	page: {
		title: 'Publicações',
		descriptionExpert: 'Fotos, carrosséis, vídeos e Reels do Instagram de {name}.',
		descriptionAll: 'Conteúdos publicados pelas contas conectadas.',
		configureInstagram: 'Configurar Instagram',
		automationsError:
			'Não foi possível carregar as DMs automáticas. As publicações aparecem normalmente; atualize a página para configurar as DMs.',
		loadMore: 'Carregar mais'
	},
	selectExpert: {
		subject: 'as publicações do Instagram',
		emptyDescription: 'Cadastre um expert antes de conectar uma conta do Instagram.'
	},
	errors: {
		loadMore: 'Não foi possível carregar mais publicações.',
		searchIncomplete:
			'Não foi possível buscar em todas as publicações. Os resultados mostram só as já carregadas.',
		notConnected: {
			title: 'Instagram não conectado',
			description: 'Conecte a conta profissional deste expert para ver as publicações.'
		},
		expired: {
			title: 'Conexão expirada',
			description: 'Reconecte o Instagram deste expert para continuar importando as publicações.'
		},
		invalid: {
			title: 'Acesso ao Instagram recusado',
			description:
				'A Meta não aceitou mais a autorização desta conta. Reconecte o Instagram do expert.'
		},
		unavailable: {
			title: 'O Instagram não respondeu',
			description: 'A conta continua conectada. Tente novamente em alguns instantes.'
		},
		unexpected: {
			title: 'Não foi possível carregar as publicações',
			description: 'Tente novamente em alguns instantes.'
		},
		reconnect: 'Reconectar Instagram',
		connect: 'Conectar Instagram'
	},
	empty: {
		title: 'Nenhuma publicação ainda',
		description: 'As publicações desta conta do Instagram aparecerão aqui.',
		noResultsTitle: 'Nenhuma publicação encontrada',
		noResultsDescription:
			'Tente outras palavras da legenda, cole o link da publicação ou mude os filtros.',
		clearFilters: 'Limpar filtros'
	},
	search: {
		label: 'Buscar publicações',
		placeholder: 'Buscar pela legenda ou colar o link da publicação',
		clear: 'Limpar busca',
		kindFilter: 'Filtrar por tipo',
		dmFilter: 'Filtrar por DM automática',
		sort: 'Ordenar publicações'
	},
	filters: {
		kind: {
			all: 'Todos os tipos',
			reel: 'Reels',
			photo: 'Fotos',
			carousel: 'Carrosséis',
			video: 'Vídeos'
		},
		dm: {
			all: 'Com ou sem DM',
			active: 'Com DM ativa',
			paused: 'Com DM pausada',
			none: 'Sem DM automática'
		},
		sort: {
			recent: 'Mais recentes',
			comments: 'Mais comentados',
			likes: 'Mais curtidos'
		}
	},
	status: {
		loading: 'Carregando publicações',
		scanning: 'Buscando em todas as publicações… {count} carregadas até agora.',
		found: {
			one: '{count} publicação encontrada',
			other: '{count} publicações encontradas'
		},
		foundInRecent: 'nas {count} mais recentes',
		foundInTotal: 'de {count}',
		searchOlder: 'Buscar nas mais antigas',
		chooseOne: 'Escolha uma publicação e configure a palavra-chave que dispara a DM automática.',
		activeCount: {
			one: '{count} publicação com DM automática ativa.',
			other: '{count} publicações com DM automática ativa.'
		}
	},
	card: {
		noCaption: 'Sem legenda',
		dateUnavailable: 'Data indisponível',
		likesTitle: 'Curtidas',
		likes: { one: '{count} curtida', other: '{count} curtidas' },
		commentsTitle: 'Comentários',
		comments: { one: '{count} comentário', other: '{count} comentários' },
		dmActive: 'DM ativa',
		dmPaused: 'DM pausada',
		withButton: 'DM com botão',
		withButtonSr: 'com botão',
		repliesComment: 'Responde o comentário',
		repliesCommentSr: 'responde o comentário',
		noDm: 'Sem DM automática',
		editAria: 'Editar DM automática',
		configureAria: 'Configurar DM automática',
		edit: 'Editar',
		configure: 'Configurar DM'
	},
	media: {
		kind: {
			reel: 'Reel',
			photo: 'Foto',
			carousel: 'Carrossel',
			video: 'Vídeo'
		},
		previous: 'Item anterior',
		next: 'Próximo item',
		unavailable: 'Mídia indisponível no momento',
		carousel: 'carrossel',
		item: 'item',
		groupWithItems: '{kind} com {count} itens',
		itemOf: '{index} de {total}',
		coverAlt: 'Capa: {text}',
		pause: 'Pausar vídeo',
		play: 'Reproduzir vídeo',
		unmute: 'Ativar som',
		mute: 'Desativar som',
		openInstagram: 'Abrir no Instagram'
	},
	dialog: {
		title: 'DM automática',
		noCaption: 'Publicação sem legenda',
		close: 'Fechar',
		intro:
			'Quando alguém comentar nesta publicação uma das palavras-chave, a pessoa recebe a mensagem abaixo no Direct.',
		keywords: 'Palavras-chave',
		removeKeyword: 'Remover {keyword}',
		addAnother: 'Adicionar outra',
		keywordPlaceholder: 'Ex.: quero, link, eu quero',
		keywordHint:
			'Pressione Enter ou vírgula para adicionar (até {max}). Maiúsculas e acentos não fazem diferença, e a palavra precisa aparecer inteira no comentário.',
		keywordTooLong: 'Cada palavra-chave deve ter no máximo {max} caracteres.',
		keywordRequired: 'Adicione pelo menos uma palavra-chave.',
		message: 'Mensagem da DM',
		messagePlaceholder: 'Oi! Que bom que você quer saber mais. Aqui está o link: …',
		messageHint:
			'Enviada uma única vez por comentário, como resposta privada. Quem não segue a conta recebe em Solicitações de mensagem.',
		messageTooLongWithButton: 'Com botão, a mensagem pode ter até {max} caracteres.',
		messageRequired: 'Escreva a mensagem que será enviada na DM.',
		withButton: 'Adicionar botão com link',
		withButtonHint: 'Aparece logo abaixo da mensagem e abre o link ao tocar.',
		buttonLabel: 'Texto do botão',
		buttonLabelPlaceholder: 'Ex.: Ver material',
		buttonLabelRequired: 'Escreva o texto do botão.',
		buttonUrl: 'Link',
		buttonUrlRequired: 'Informe o link que o botão abre.',
		buttonUrlInvalid: 'Use um link que comece com https://.',
		preview: 'Prévia da DM',
		previewEmpty: 'Sua mensagem aparece aqui.',
		withCommentReply: 'Responder o comentário publicamente',
		withCommentReplyHint: 'Publicada no comentário depois que a DM for enviada.',
		commentReply: 'Resposta do comentário',
		commentReplyPlaceholder: 'Ex.: Te mandei no direct! 📩',
		commentReplyHint: 'Fica visível para todos. Se a DM não sair, o comentário não é respondido.',
		commentReplyRequired: 'Escreva a resposta do comentário ou desmarque a opção.',
		active: 'Automação ativa',
		activeHint: 'Desmarque para pausar sem perder a configuração.',
		sent: { one: '{count} DM enviada', other: '{count} DMs enviadas' },
		lastSent: '· última em {date}',
		delete: 'Excluir',
		cancel: 'Cancelar',
		save: 'Salvar',
		saveFailed: 'Não foi possível salvar. Tente novamente.',
		deleteFailed: 'Não foi possível excluir a automação. Tente novamente.',
		apiErrors: {
			notConnected: 'Conecte o Instagram deste expert antes de ativar a DM automática.',
			expired: 'A conexão com o Instagram expirou. Reconecte a conta para ativar a DM automática.',
			invalid: 'A Meta recusou o acesso desta conta. Reconecte o Instagram do expert.',
			graphError:
				'A Meta não confirmou o acompanhamento dos comentários desta conta. Tente novamente em alguns instantes.',
			unavailable: 'O Instagram não respondeu. Tente novamente em alguns instantes.'
		}
	}
};
