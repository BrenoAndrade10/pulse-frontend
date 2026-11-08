export const tracking = {
	title: 'Rastreamento',
	description:
		'Meça o que os visitantes fazem nas páginas de {expert}: cliques, cadastros e compras.',
	descriptionAll: 'Meça o que os visitantes fazem nas páginas dos seus experts.',
	selectSubject: 'o rastreamento',
	selectEmpty: 'O rastreamento é configurado por expert. Cadastre um para começar.',
	loading: 'Carregando rastreamento',
	urlErrors: {
		empty: 'Cole o link da página.',
		invalid: 'Esse link não parece válido. Ex.: https://meusite.com.br/pagina',
		insecure: 'Use uma página com https://. O pixel só funciona em sites seguros.',
		notPublic: 'Use o endereço público da página, como meusite.com.br.'
	},
	unavailable: {
		title: 'Rastreamento em preparação',
		description:
			'Este recurso ainda não está disponível no servidor. Assim que for liberado, você configura tudo por aqui.'
	},
	loadError: {
		title: 'Não foi possível carregar o rastreamento',
		description: 'Tente novamente em alguns instantes.'
	},
	activate: {
		title: 'Saiba quem clicou, se cadastrou e comprou',
		description:
			'Ative o pixel do Pulse para {expert}, instale nas páginas e escolha, clicando na própria página, quais ações viram eventos. Sem precisar mexer em código para cada botão.',
		button: 'Ativar rastreamento',
		hint: 'Você pode desativar quando quiser.',
		error: 'Não foi possível ativar o rastreamento. Tente novamente.',
		step: 'Passo {number}:',
		highlights: {
			install: { title: 'Instale o pixel', text: 'Um código único, colado uma vez no site.' },
			point: {
				title: 'Aponte os elementos',
				text: 'Na própria página, clique no botão ou formulário.'
			},
			track: { title: 'Acompanhe os resultados', text: 'Leads, cadastros e compras por campanha.' }
		}
	},
	pages: {
		title: 'Páginas configuradas',
		description: 'Páginas que já têm eventos e a qual lançamento os cadastros de cada uma contam.',
		empty: 'Nenhuma página configurada ainda. Cole um link acima para começar.',
		autoLaunch: 'Lançamento em andamento (automático)',
		launchLabel: 'Lançamento dos cadastros desta página',
		events: { one: '{count} evento', other: '{count} eventos' },
		updated: 'atualizado {time}',
		continue: 'Continuar configurando',
		saveError: 'Não foi possível salvar o lançamento da página. Tente novamente.'
	},
	setup: {
		title: 'Configurar eventos',
		description:
			'Cole o link da página. Você escolhe na própria página quais cliques e formulários viram eventos.',
		urlLabel: 'Link da página',
		urlPlaceholder: 'https://meusite.com.br/pagina-de-vendas',
		submit: 'Abrir e configurar',
		newDomain: '· será autorizado a enviar eventos para este pixel',
		notInstalled:
			'O pixel ainda não enviou nenhum evento. Instale o código abaixo nessa página antes: sem ele, o editor não aparece.',
		success:
			'Abrimos a página numa nova aba. Configure os eventos por lá: eles aparecem aqui assim que forem salvos.',
		popupBlocked: 'O navegador bloqueou a nova aba. Permita pop-ups para o Pulse e tente de novo.',
		openError: 'Não foi possível abrir a configuração. Tente novamente.',
		step: 'Passo {number}:',
		steps: {
			open: { title: 'Abra a página', text: 'Ela abre numa nova aba, com o editor do Pulse.' },
			click: { title: 'Clique no elemento', text: 'Um botão, link ou formulário da página.' },
			event: { title: 'Escolha o evento', text: 'Lead, compra, cadastro ou um nome seu.' }
		}
	},
	install: {
		title: 'Instalação do pixel',
		description: 'Instale uma vez em todas as páginas que você quer medir.',
		installed: 'Instalado',
		waiting: 'Aguardando primeiro evento',
		lastEvent: 'Último evento {time}',
		copyAria: 'Copiar código do pixel',
		copy: 'Copiar',
		copied: 'Copiado',
		copiedAnnounce: 'Código copiado',
		guides: {
			html: {
				label: 'HTML',
				steps: {
					one: 'Abra o HTML da página (ou o modelo usado por todas as páginas).',
					two: 'Cole o código logo antes de </head>.',
					three: 'Publique e abra a página uma vez para o pixel enviar o primeiro evento.'
				}
			},
			wordpress: {
				label: 'WordPress',
				steps: {
					one: 'Instale um plugin de códigos, como WPCode, ou use o campo de scripts do seu tema.',
					two: 'Adicione o código no cabeçalho (Header) de todas as páginas.',
					three: 'Salve, limpe o cache do site e abra a página uma vez.'
				}
			},
			gtm: {
				label: 'Google Tag Manager',
				steps: {
					one: 'Crie uma tag do tipo HTML personalizado e cole o código.',
					two: 'Use o acionador All Pages (todas as páginas).',
					three: 'Publique o contêiner e abra a página uma vez.'
				}
			}
		}
	}
};
