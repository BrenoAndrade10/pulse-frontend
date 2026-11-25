export const email = {
	page: {
		title: 'E-mail',
		description: 'Dispare campanhas para os seus leads e acompanhe cliques e entregas.',
		newCampaign: 'Nova campanha'
	},
	tabs: {
		tablist: 'Seções de e-mail',
		campaigns: 'Campanhas',
		automations: 'Automações',
		settings: 'Configuração'
	},
	status: {
		draft: 'Rascunho',
		scheduled: 'Agendada',
		sending: 'Enviando',
		sent: 'Enviada',
		active: 'Ativa',
		paused: 'Pausada',
		canceled: 'Cancelada',
		failed: 'Falhou'
	},
	campaigns: {
		kpi: {
			sent: 'Enviados',
			scheduled: 'Agendadas',
			failed: 'Com falha'
		},
		search: 'Buscar campanha',
		allStatuses: 'Todos os status',
		table: {
			campaign: 'Campanha',
			segment: 'Segmento',
			status: 'Status',
			sent: 'Enviados',
			date: 'Data'
		},
		subjectLine: 'Assunto: {subject}',
		noSubject: 'Sem assunto',
		progress: 'Enviando {percent}',
		now: 'Agora',
		count: {
			one: '{formatted} campanha',
			other: '{formatted} campanhas'
		},
		empty: {
			title: 'Nenhuma campanha ainda',
			description: 'Crie a primeira campanha e dispare para um segmento de leads.',
			noResults: 'Nenhuma campanha encontrada',
			noResultsDescription: 'Ajuste a busca ou o filtro de status.'
		}
	},
	automations: {
		empty: {
			title: 'Nenhuma automação ainda',
			description: 'As automações por gatilho aparecem aqui quando forem criadas.'
		},
		description: 'Envios automáticos disparados pelo comportamento do lead.',
		new: 'Nova automação',
		soon: 'Em breve',
		search: 'Buscar automação',
		table: {
			automation: 'Automação',
			trigger: 'Gatilho',
			status: 'Status',
			sent: 'Enviados',
			clicks: 'Cliques',
			actions: 'Ações'
		},
		actions: {
			pause: 'Pausar',
			resume: 'Reativar',
			edit: 'Editar'
		},
		triggers: {
			newLead: 'Novo lead cadastrado',
			becameHot: 'Lead ficou quente',
			clickedLink: 'Clicou em um link',
			inactive: 'Sem ação há 7 dias'
		},
		count: {
			one: '{formatted} automação',
			other: '{formatted} automações'
		}
	},
	settings: {
		errors: {
			taken: 'Este domínio já está em uso por outro expert.',
			domainRequired: 'Adicione um domínio antes de continuar.',
			notVerified: 'Verifique o domínio de envio antes de enviar.',
			unavailable: 'O provedor de e-mail está indisponível agora. Tente novamente em instantes.',
			campaignNotFound: 'Campanha não encontrada.',
			campaignLocked: 'Esta campanha já foi enviada ou está sendo enviada e não pode ser alterada.',
			campaignInvalid: 'Preencha o nome, o assunto e a mensagem para enviar.',
			scheduleInvalid: 'Escolha uma data e hora futuras, em até 1 ano.',
			domainInvalid: 'Informe um domínio válido, como mail.seudominio.com.',
			senderInvalid: 'Informe o nome e o e-mail do remetente.',
			providerRejected: 'O provedor de e-mail recusou este domínio.',
			generic: 'Não foi possível concluir. Tente novamente.',
			load: 'Não foi possível carregar a configuração de e-mail.'
		},
		domain: {
			placeholder: 'mail.seudominio.com',
			title: 'Domínio de envio',
			description: 'Adicione estes registros no provedor do seu domínio.',
			label: 'Domínio',
			verify: 'Verificar agora',
			verifying: 'Verificando…',
			status: {
				none: 'Não configurado',
				pending: 'Aguardando DNS',
				verified: 'Domínio verificado'
			}
		},
		records: {
			empty: 'Os registros DNS aparecem aqui depois que o domínio for adicionado.',
			type: 'Tipo',
			name: 'Nome',
			value: 'Valor',
			status: 'Status',
			ok: 'OK',
			pending: 'Pendente',
			recommended: 'Recomendado',
			copy: 'Copiar valor',
			copied: 'Copiado'
		},
		sender: {
			title: 'Remetente',
			description: 'Como o seu e-mail aparece na caixa de entrada.',
			name: 'Nome',
			email: 'E-mail',
			replyTo: 'Responder para',
			save: 'Salvar',
			saved: 'Alterações salvas',
			test: 'Enviar e-mail de teste',
			testSent: 'Teste enviado para {email}'
		},
		health: {
			inactive: 'Envio inativo',
			title: 'Saúde do envio',
			description: 'Pausamos sozinhos se a reputação cair.',
			bounce: 'Bounce',
			complaint: 'Reclamações',
			limit: 'limite {limit}',
			state: 'Situação',
			active: 'Envio ativo'
		},
		limits: {
			empty: 'Os limites passam a valer quando o domínio for verificado.',
			title: 'Limites e aquecimento',
			description: 'O teto sobe aos poucos para proteger o domínio novo.',
			today: 'Hoje',
			unit: 'de {limit} e-mails',
			warmup: 'Dia {day} de {total} de aquecimento · amanhã {next}'
		},
		suppressions: {
			title: 'Descadastros e bloqueios',
			description: 'Quem saiu ou deu bounce nunca recebe de novo.',
			unsub: 'Descadastrados',
			bounces: 'Bounces',
			complaints: 'Reclamações',
			view: 'Ver lista'
		}
	},
	report: {
		back: 'Campanhas',
		subline: 'Segmento {segment} · {date}',
		export: 'Exportar CSV',
		kpi: {
			recipients: 'Destinatários',
			pending: 'Na fila',
			suppressed: 'Suprimidos',
			failed: 'Falhas',
			sent: 'Enviados',
			delivered: 'Entregues',
			clicks: 'Cliques',
			opens: 'Aberturas*',
			unsub: 'Descadastros',
			bounces: 'Bounces',
			people: '{count} pessoas',
			emails: '{count} e-mails',
			estimated: 'estimado'
		},
		chart: {
			title: 'Cliques ao longo do tempo',
			description: 'Primeiras 24 horas após o envio',
			aria: 'Cliques por hora'
		},
		links: {
			empty: 'Nenhum clique registrado ainda.',
			title: 'Links mais clicados',
			description: 'Onde as pessoas foram'
		},
		who: {
			empty: 'Ninguém clicou ainda.',
			title: 'Quem clicou',
			description: 'Cada clique já alimenta o Pulse Heat dessas pessoas',
			createSegment: 'Criar segmento com quem clicou',
			lead: 'Lead',
			heat: 'Heat',
			clickedIn: 'Clicou em',
			clicks: 'Cliques',
			last: 'Último clique'
		},
		opensNote:
			'*Aberturas são estimadas: apps como o Apple Mail pré-carregam as imagens. Os cliques são a métrica mais confiável.',
		notFound: 'Campanha não encontrada',
		cancel: 'Cancelar envio',
		cancelTitle: 'Cancelar esta campanha?',
		cancelDescription:
			'Os e-mails que ainda não saíram não serão enviados. Quem já recebeu não é afetado.',
		cancelConfirm: 'Cancelar envio',
		cancelKeep: 'Manter',
		failedDomain: 'Não foi possível enviar: o domínio de envio não está verificado.'
	},
	compose: {
		title: 'Nova campanha',
		editTitle: 'Editar campanha',
		description: 'Escreva a mensagem que será enviada aos seus leads.',
		subject: 'Assunto',
		message: 'Mensagem',
		back: 'Campanhas',
		subjectPlaceholder: 'Boas-vindas, {{nome}}',
		editorPlaceholder: 'Escreva a mensagem do e-mail',
		steps: {
			segment: 'Segmento',
			content: 'Conteúdo',
			review: 'Revisão e envio'
		},
		stepLabel: 'Passo {{n}}',
		stepsAria: 'Etapas da campanha',
		stepHints: {
			segment: 'Escolha quem recebe',
			content: 'Escreva e visualize',
			review: 'Confira e envie'
		},
		segment: {
			title: 'Para quem enviar',
			description: 'Escolha um segmento. A lista é montada no momento do envio.',
			hot: 'Quente',
			warm: 'Morno',
			idle: 'Sem ação',
			hotHint: 'leads prioritários',
			warmHint: 'leads engajados',
			idleHint: 'receberam e não agiram',
			recipients: '{count} destinatários',
			suppressed: '{count} suprimidos (descadastro ou bounce)',
			withinLimit: 'Dentro do limite diário',
			overLimit: 'Acima do limite diário: o envio será dividido em dias'
		},
		preview: {
			title: 'Prévia',
			desktop: 'Desktop',
			mobile: 'Celular',
			from: 'De',
			subject: 'Assunto',
			footer: 'Você recebeu porque se cadastrou nas páginas de {expert}.',
			unsubscribe: 'Descadastrar'
		},
		actions: {
			next: 'Continuar',
			back: 'Voltar',
			saveDraft: 'Salvar rascunho',
			send: 'Enviar campanha',
			schedule: 'Agendar envio'
		},
		review: {
			needsDomain: 'Configure e verifique o domínio de envio na aba Configuração para enviar.',
			title: 'Revise antes de enviar',
			segment: 'Segmento',
			recipients: 'Destinatários',
			sender: 'Remetente',
			subject: 'Assunto',
			when: 'Quando enviar',
			now: 'Agora',
			later: 'Agendar'
		},
		validation: {
			subject: 'Informe o assunto',
			content: 'Escreva a mensagem'
		}
	},
	editor: {
		label: 'Editor da mensagem',
		toolbar: 'Ferramentas de formatação',
		undo: 'Desfazer',
		redo: 'Refazer',
		blockType: 'Tipo de bloco',
		paragraph: 'Parágrafo',
		heading1: 'Título 1',
		heading2: 'Título 2',
		heading3: 'Título 3',
		bold: 'Negrito',
		italic: 'Itálico',
		underline: 'Sublinhado',
		strike: 'Tachado',
		color: 'Cor do texto',
		alignLeft: 'Alinhar à esquerda',
		alignCenter: 'Centralizar',
		alignRight: 'Alinhar à direita',
		bulletList: 'Lista com marcadores',
		orderedList: 'Lista numerada',
		quote: 'Citação',
		divider: 'Linha divisória',
		link: 'Link',
		unlink: 'Remover link',
		image: 'Imagem',
		button: 'Botão',
		variables: 'Variáveis',
		source: 'Código HTML',
		url: 'Endereço do link',
		apply: 'Aplicar',
		insert: 'Inserir',
		imageUrl: 'Endereço da imagem',
		imageAlt: 'Texto alternativo',
		buttonLabel: 'Texto do botão',
		variablesHint: 'Insere o dado de cada pessoa:'
	}
};
