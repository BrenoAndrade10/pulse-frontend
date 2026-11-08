import type { auth as source } from '../pt-BR/auth.js';

export const auth: typeof source = {
	brand: {
		headlineLine1: 'Tus campañas,',
		headlineLine2: 'en alto rendimiento.',
		description:
			'Sigue tus métricas, optimiza inversiones y escala los resultados de marketing digital en un solo lugar.',
		chartTitle: 'Rendimiento de las campañas',
		chartPeriod: 'Últimos 30 días',
		kpis: {
			roas: { value: '4,8x', delta: '+32%' },
			ctr: { value: '3,9%', delta: '+0,8 p.p.' },
			leads: { value: '12,4 mil', delta: '+18%' }
		},
		chipCampaign: 'Campaña "Black Friday" escalada',
		chipRevenue: 'en ingresos atribuidos',
		footer: 'Ads · Social · Correo · Analytics — integrados.'
	},
	recovery: {
		notice: 'Estos códigos no se mostrarán de nuevo. Cada código se puede usar una sola vez.',
		listLabel: 'Códigos de recuperación',
		copied: 'Copiado',
		download: 'Descargar .txt',
		print: 'Imprimir',
		saved: 'Guardé mis códigos en un lugar seguro'
	},
	fields: {
		email: 'Correo electrónico',
		emailPlaceholder: 'tu@empresa.com',
		password: 'Contraseña',
		newPassword: 'Nueva contraseña',
		confirmNewPassword: 'Confirmar nueva contraseña',
		confirmPassword: 'Confirmar contraseña',
		createPasswordPlaceholder: 'Crea una contraseña',
		repeatPasswordPlaceholder: 'Repite la contraseña',
		passwordHint: 'Mínimo de {min} caracteres.',
		strength: 'Seguridad: {label}'
	},
	validation: {
		emailRequired: 'Ingresa tu correo electrónico.',
		emailInvalid: 'Correo electrónico inválido.',
		passwordRequired: 'Ingresa una contraseña.',
		passwordTooShort: 'La contraseña debe tener al menos {min} caracteres.',
		passwordStrength: {
			veryWeak: 'Muy débil',
			weak: 'Débil',
			fair: 'Aceptable',
			good: 'Buena',
			strong: 'Fuerte'
		}
	},
	errors: {
		network: 'No se pudo conectar con el servidor. Verifica tu conexión.',
		tooManyAttempts: {
			one: 'Demasiados intentos. Inténtalo de nuevo en {count} minuto.',
			other: 'Demasiados intentos. Inténtalo de nuevo en {count} minutos.'
		},
		invalidCredentials: 'Correo electrónico o contraseña inválidos.',
		tenantAccessDenied: 'No tienes acceso a esta empresa.',
		loginFailed: 'No se pudo iniciar sesión. Inténtalo de nuevo.',
		userAlreadyExists: 'Ya existe una cuenta con este correo electrónico. Intenta iniciar sesión.',
		tenantAlreadyExists:
			'Ya existe una empresa con este nombre. Usa otro nombre o pide una invitación al administrador.',
		registerFailed: 'No se pudo crear tu cuenta. Inténtalo de nuevo.',
		resetRequestFailed: 'No se pudo solicitar el restablecimiento. Inténtalo de nuevo.',
		resetTokenInvalid: 'Enlace inválido o vencido.',
		resetFailed: 'No se pudo cambiar tu contraseña. Inténtalo de nuevo.',
		challengeExpired: 'Tu verificación venció. Inicia sesión de nuevo.',
		codeInvalid: 'Código inválido. Revísalo e inténtalo de nuevo.',
		verifyFailed: 'No se pudo completar la verificación. Inténtalo de nuevo.',
		verifyShortFailed: 'No se pudo verificar. Inténtalo de nuevo.',
		setupFailed: 'No se pudo iniciar la configuración. Inténtalo de nuevo.',
		activateFailed: 'No se pudo activar la aplicación de autenticación.',
		regenerateFailed: 'No se pudieron generar nuevos códigos. Inténtalo de nuevo.'
	},
	login: {
		pageTitle: 'Iniciar sesión',
		title: 'Te damos la bienvenida',
		subtitle: 'Inicia sesión para seguir tus campañas.',
		registered: '¡Cuenta creada con éxito! Inicia sesión para continuar.',
		passwordReset: 'Contraseña cambiada. Inicia sesión con la nueva contraseña.',
		sessionExpired: 'Tu sesión expiró. Inicia sesión de nuevo para continuar.',
		passwordRequired: 'Ingresa tu contraseña.',
		passwordPlaceholder: 'Tu contraseña',
		remember: 'Recordarme',
		forgot: 'Olvidé mi contraseña',
		submit: 'Iniciar sesión',
		submitting: 'Iniciando sesión…',
		noAccount: '¿Aún no tienes cuenta?',
		createAccount: 'Crear cuenta gratis'
	},
	register: {
		pageTitle: 'Crear cuenta',
		title: 'Crea tu cuenta',
		subtitle: 'Empieza a escalar tus resultados en pocos minutos.',
		name: 'Nombre completo',
		namePlaceholder: '¿Cómo quieres que te llamemos?',
		nameRequired: 'Ingresa tu nombre.',
		email: 'Correo electrónico profesional',
		company: 'Empresa o agencia (opcional)',
		companyPlaceholder: 'Nombre de tu empresa',
		confirmRequired: 'Confirma tu contraseña.',
		mismatch: 'Las contraseñas no coinciden.',
		termsRequired: 'Debes aceptar los términos para continuar.',
		termsPrefix: 'He leído y acepto los',
		termsLink: 'Términos de uso',
		termsMiddle: 'y la',
		privacyLink: 'Política de privacidad',
		submit: 'Crear cuenta',
		submitting: 'Creando cuenta…',
		haveAccount: '¿Ya tienes una cuenta?',
		signIn: 'Iniciar sesión'
	},
	forgot: {
		pageTitle: 'Olvidé mi contraseña',
		title: '¿Olvidaste tu contraseña?',
		subtitle: 'Ingresa tu correo electrónico para recibir las instrucciones de restablecimiento.',
		sent: 'Si existe una cuenta con este correo electrónico, enviaremos las instrucciones para restablecer la contraseña.',
		resendIn: 'Reenviar en {seconds}s',
		resend: 'Reenviar',
		submit: 'Enviar enlace',
		backToLogin: 'Volver al inicio de sesión'
	},
	reset: {
		pageTitle: 'Restablecer contraseña',
		title: 'Crea una nueva contraseña',
		invalidTitle: 'Enlace inválido o vencido',
		subtitle: 'Elige una contraseña segura para volver a acceder a tu cuenta.',
		invalidSubtitle: 'Solicita un nuevo enlace para restablecer tu contraseña.',
		invalidAlert: 'Este enlace de restablecimiento no es válido o ya venció.',
		requestNew: 'Pedir nuevo enlace',
		submit: 'Cambiar contraseña'
	},
	twoFactor: {
		pageTitle: 'Verificación en dos pasos',
		title: 'Verificación en dos pasos',
		emailSubtitle: 'Enviamos un código a {hint}. Vence en {countdown}.',
		emailHintFallback: 'tu correo electrónico',
		appSubtitle:
			'Ingresa el código de la aplicación de autenticación. Tiempo restante: {countdown}',
		retryIn: 'Inténtalo de nuevo en {seconds}s.',
		lowRecovery: {
			one: 'Queda {count} código de recuperación. Genera nuevos en Configuración → Seguridad.',
			other: 'Quedan {count} códigos de recuperación. Genera nuevos en Configuración → Seguridad.'
		},
		recoveryLabel: 'Código de recuperación',
		codeLabel: 'Código de 6 dígitos',
		trustDevice: 'Confiar en este navegador por 30 días',
		verify: 'Verificar',
		resendIn: 'Reenviar código en {seconds}s',
		resend: 'Reenviar código',
		useApp: 'Usar código de la aplicación',
		useRecovery: 'Usar un código de recuperación',
		resent: 'Enviamos un nuevo código a tu correo electrónico.',
		expired: 'Tu verificación venció. Inicia sesión de nuevo.'
	}
};
