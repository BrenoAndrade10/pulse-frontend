export const auth = {
	brand: {
		headlineLine1: 'Suas campanhas,',
		headlineLine2: 'em alta performance.',
		description:
			'Acompanhe métricas, otimize investimentos e escale resultados de marketing digital em um só lugar.',
		chartTitle: 'Desempenho das campanhas',
		chartPeriod: 'Últimos 30 dias',
		kpis: {
			roas: { value: '4,8x', delta: '+32%' },
			ctr: { value: '3,9%', delta: '+0,8 p.p.' },
			leads: { value: '12,4 mil', delta: '+18%' }
		},
		chipCampaign: 'Campanha "Black Friday" escalada',
		chipRevenue: 'em receita atribuída',
		footer: 'Ads · Social · E-mail · Analytics — integrados.'
	},
	recovery: {
		notice:
			'Estes códigos não serão mostrados novamente. Cada código pode ser usado uma única vez.',
		listLabel: 'Códigos de recuperação',
		copied: 'Copiado',
		download: 'Baixar .txt',
		print: 'Imprimir',
		saved: 'Guardei meus códigos em local seguro'
	},
	fields: {
		email: 'E-mail',
		emailPlaceholder: 'voce@empresa.com',
		password: 'Senha',
		newPassword: 'Nova senha',
		confirmNewPassword: 'Confirmar nova senha',
		confirmPassword: 'Confirmar senha',
		createPasswordPlaceholder: 'Crie uma senha',
		repeatPasswordPlaceholder: 'Repita a senha',
		passwordHint: 'Mínimo de {min} caracteres.',
		strength: 'Força: {label}'
	},
	validation: {
		emailRequired: 'Informe seu e-mail.',
		emailInvalid: 'E-mail inválido.',
		passwordRequired: 'Informe uma senha.',
		passwordTooShort: 'A senha precisa ter pelo menos {min} caracteres.',
		passwordStrength: {
			veryWeak: 'Muito fraca',
			weak: 'Fraca',
			fair: 'Razoável',
			good: 'Boa',
			strong: 'Forte'
		}
	},
	errors: {
		network: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
		tooManyAttempts: {
			one: 'Muitas tentativas. Tente novamente em {count} minuto.',
			other: 'Muitas tentativas. Tente novamente em {count} minutos.'
		},
		invalidCredentials: 'E-mail ou senha inválidos.',
		tenantAccessDenied: 'Você não tem acesso a esta empresa.',
		loginFailed: 'Não foi possível entrar. Tente novamente.',
		userAlreadyExists: 'Já existe uma conta com este e-mail. Tente entrar.',
		tenantAlreadyExists:
			'Já existe uma empresa com este nome. Use outro nome ou peça um convite ao administrador.',
		registerFailed: 'Não foi possível criar sua conta. Tente novamente.',
		resetRequestFailed: 'Não foi possível solicitar a redefinição. Tente novamente.',
		resetTokenInvalid: 'Link inválido ou expirado.',
		resetFailed: 'Não foi possível alterar sua senha. Tente novamente.',
		challengeExpired: 'Sua verificação expirou. Entre novamente.',
		codeInvalid: 'Código inválido. Confira e tente novamente.',
		verifyFailed: 'Não foi possível concluir a verificação. Tente novamente.',
		verifyShortFailed: 'Não foi possível verificar. Tente novamente.',
		setupFailed: 'Não foi possível iniciar a configuração. Tente novamente.',
		activateFailed: 'Não foi possível ativar o aplicativo autenticador.',
		regenerateFailed: 'Não foi possível gerar novos códigos. Tente novamente.'
	},
	login: {
		pageTitle: 'Entrar',
		title: 'Bem-vindo de volta',
		subtitle: 'Entre para acompanhar suas campanhas.',
		registered: 'Conta criada com sucesso! Faça login para continuar.',
		passwordReset: 'Senha alterada. Entre com a nova senha.',
		sessionExpired: 'Sua sessão expirou. Entre novamente para continuar.',
		passwordRequired: 'Informe sua senha.',
		passwordPlaceholder: 'Sua senha',
		remember: 'Lembrar de mim',
		forgot: 'Esqueci minha senha',
		submit: 'Entrar',
		submitting: 'Entrando…',
		noAccount: 'Ainda não tem conta?',
		createAccount: 'Criar conta grátis'
	},
	register: {
		pageTitle: 'Criar conta',
		title: 'Crie sua conta',
		subtitle: 'Comece a escalar seus resultados em poucos minutos.',
		name: 'Nome completo',
		namePlaceholder: 'Como devemos te chamar?',
		nameRequired: 'Informe seu nome.',
		email: 'E-mail profissional',
		company: 'Empresa ou agência (opcional)',
		companyPlaceholder: 'Nome da sua empresa',
		confirmRequired: 'Confirme sua senha.',
		mismatch: 'As senhas não coincidem.',
		termsRequired: 'Você precisa aceitar os termos para continuar.',
		termsPrefix: 'Li e aceito os',
		termsLink: 'Termos de uso',
		termsMiddle: 'e a',
		privacyLink: 'Política de privacidade',
		submit: 'Criar conta',
		submitting: 'Criando conta…',
		haveAccount: 'Já tem uma conta?',
		signIn: 'Entrar'
	},
	forgot: {
		pageTitle: 'Esqueci minha senha',
		title: 'Esqueceu sua senha?',
		subtitle: 'Informe seu e-mail para receber as instruções de redefinição.',
		sent: 'Se existir uma conta com este e-mail, enviaremos as instruções para redefinir a senha.',
		resendIn: 'Reenviar em {seconds}s',
		resend: 'Reenviar',
		submit: 'Enviar link',
		backToLogin: 'Voltar ao login'
	},
	reset: {
		pageTitle: 'Redefinir senha',
		title: 'Crie uma nova senha',
		invalidTitle: 'Link inválido ou expirado',
		subtitle: 'Escolha uma senha segura para voltar a acessar sua conta.',
		invalidSubtitle: 'Solicite um novo link para redefinir sua senha.',
		invalidAlert: 'Este link de redefinição não é válido ou já expirou.',
		requestNew: 'Pedir novo link',
		submit: 'Alterar senha'
	},
	twoFactor: {
		pageTitle: 'Verificação em duas etapas',
		title: 'Verificação em duas etapas',
		emailSubtitle: 'Enviamos um código para {hint}. Ele expira em {countdown}.',
		emailHintFallback: 'seu e-mail',
		appSubtitle: 'Informe o código do aplicativo autenticador. Tempo restante: {countdown}',
		retryIn: 'Tente novamente em {seconds}s.',
		lowRecovery: {
			one: 'Resta {count} código de recuperação. Gere novos em Configurações → Segurança.',
			other: 'Restam {count} códigos de recuperação. Gere novos em Configurações → Segurança.'
		},
		recoveryLabel: 'Código de recuperação',
		codeLabel: 'Código de 6 dígitos',
		trustDevice: 'Confiar neste navegador por 30 dias',
		verify: 'Verificar',
		resendIn: 'Reenviar código em {seconds}s',
		resend: 'Reenviar código',
		useApp: 'Usar código do aplicativo',
		useRecovery: 'Usar um código de recuperação',
		resent: 'Enviamos um novo código para o seu e-mail.',
		expired: 'Sua verificação expirou. Entre novamente.'
	}
};
