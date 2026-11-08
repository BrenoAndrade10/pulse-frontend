export const settings = {
	pageTitle: 'Configurações',
	description: 'Dados da sua conta, equipe e segurança.',
	guide: {
		title: 'Guia de configuração',
		dismissed:
			'O guia está dispensado no Dashboard. Seu progresso é calculado a partir dos dados reais da conta.',
		completed: 'Você concluiu o guia. Reabra para rever as etapas da sua configuração.',
		visible: 'O guia está visível no Dashboard.',
		reopen: 'Reabrir guia no Dashboard'
	},
	security: {
		title: 'Segurança',
		loadingAria: 'Carregando configurações de segurança',
		loadError: 'Não foi possível carregar as configurações de segurança.',
		authenticator: {
			title: 'Aplicativo autenticador (opcional)',
			description: 'Use um aplicativo autenticador no lugar do código enviado por e-mail.',
			enabled: 'Ativado',
			disabled: 'Desativado',
			codesAvailable: { one: '{count} código disponível', other: '{count} códigos disponíveis' },
			regenerate: 'Gerar novos códigos de recuperação',
			activate: 'Ativar app autenticador',
			startError: 'Não foi possível iniciar a configuração.',
			activateError: 'Não foi possível ativar o aplicativo autenticador.',
			generateError: 'Não foi possível gerar novos códigos.'
		},
		devices: {
			title: 'Navegadores confiáveis',
			description: 'Acessos que podem entrar sem solicitar o código por até 30 dias.',
			empty: 'Nenhum navegador confiável.',
			current: 'Este navegador',
			usage: 'Último uso: {lastUsed} · Expira em: {expiresAt}',
			removeError: 'Não foi possível remover o navegador confiável.',
			removeTitle: 'Remover navegador confiável?',
			removeDescription: '{label} precisará informar o código de verificação no próximo acesso.'
		},
		setup: {
			title: 'Ativar app autenticador',
			instructions: 'Escaneie o QR Code com seu aplicativo autenticador e informe o código gerado.',
			qrAlt: 'QR Code para configurar o aplicativo autenticador',
			cantScan: 'Não consegue escanear?',
			copyKey: 'Copiar chave',
			copied: 'Copiada',
			activate: 'Ativar'
		},
		recovery: {
			title: 'Gerar novos códigos',
			instructions: 'Informe o código atual do seu aplicativo autenticador.',
			generate: 'Gerar códigos'
		},
		codeLabel: 'Código de 6 dígitos',
		finish: 'Concluir'
	}
};
