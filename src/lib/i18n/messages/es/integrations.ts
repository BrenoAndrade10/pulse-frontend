import type { integrations as source } from '../pt-BR/integrations.js';

export const integrations: typeof source = {
	pageTitle: 'Integraciones',
	description: 'Conecta los canales y plataformas que usas en tu operación.',
	states: {
		notConnected: 'No conectado',
		connected: 'Conectado',
		pendingSetup: 'Configuración pendiente',
		attention: 'Atención',
		comingSoon: 'Próximamente'
	},
	upcoming: {
		title: 'Próximamente',
		count: { one: '{count} integración planificada', other: '{count} integraciones planificadas' },
		expertScope: 'Conectadas por experto',
		tenantScope: 'Conectadas por la empresa',
		tenantHint: 'Una conexión de la empresa podrá atender productos y ventas de varios expertos.'
	},
	status: {
		connected: 'Conectada',
		expired: 'Conexión vencida',
		disconnected: 'No conectada'
	},
	badges: {
		soon: 'Próximamente'
	},
	actions: {
		connect: 'Conectar',
		manage: 'Administrar',
		reconnect: 'Reconectar',
		disconnect: 'Desconectar'
	},
	catalog: {
		hotmart: 'Sincroniza ventas, productos y comisiones.',
		telegram: 'Integra canales, comunidades y automatizaciones.',
		kiwify: 'Importa ventas, productos e indicadores.'
	},
	meta: {
		instagram: {
			description: 'Publicaciones, Reels y comentarios de la cuenta profesional.',
			asset: 'Cuenta profesional de Instagram',
			authorization: 'Inicio de sesión unificado de Meta',
			connect: 'Conectar con Facebook'
		},
		metaAds: {
			description: 'Campañas, inversión y resultados del Administrador de anuncios.',
			asset: 'Cuenta publicitaria y Pixel de Meta',
			authorization: 'Inicio de sesión de Facebook para empresas',
			connect: 'Conectar con Facebook'
		},
		whatsapp: {
			description: 'Conversaciones y atención a través de la API en la nube de WhatsApp.',
			asset: 'Cuenta de WhatsApp Business (WABA) y número de teléfono',
			authorization: 'Registro integrado con Facebook',
			connect: 'Conectar con Facebook'
		}
	},
	instagram: {
		selectedDescription: 'Cuenta de Instagram del experto seleccionado.',
		expiredHint: 'Conexión expirada',
		sectionTitle: 'Cuentas de Instagram',
		sectionDescription: 'Conexiones profesionales vinculadas a los expertos.',
		emptyTitle: 'Ningún experto para conectar',
		emptyDescription:
			'Cada cuenta de Instagram se vincula a un experto. Registra un experto para comenzar.',
		noAccount: 'Ninguna cuenta autorizada',
		saveFirst: 'Guarda al experto para poder conectar la cuenta.',
		waitingAuthorization: 'Completa la autorización en la ventana de Meta.',
		connectedAt: 'Conectada el {date}',
		connected: 'Cuenta profesional conectada a este experto.',
		expired: 'La autorización venció. Reconecta para volver a sincronizar.',
		authorize: 'Autoriza el acceso a la cuenta profesional de Instagram.',
		connectedSuccess: 'Cuenta de Instagram conectada.',
		connectFailed: 'No se pudo conectar la cuenta. Inténtalo de nuevo.',
		disconnectFailed: 'No se pudo desconectar la cuenta. Inténtalo de nuevo.',
		reconnect: 'Reconectar Instagram',
		popupBlocked:
			'No se pudo abrir Meta. Permite las ventanas emergentes para este sitio e inténtalo de nuevo.',
		missingAuthorizationUrl: 'El backend no devolvió la URL de autorización de Instagram.',
		oauthErrors: {
			denied: 'La autorización fue cancelada en Meta.',
			invalidState: 'La autorización venció. Haz clic en conectar e inténtalo de nuevo.',
			expertNotFound: 'No se encontró a este experto. Actualiza la página e inténtalo de nuevo.',
			exchangeFailed:
				'Meta rechazó la conexión. Verifica la configuración de la cuenta e inténtalo de nuevo.',
			missingPermissions:
				'Meta no concedió todos los permisos necesarios. Autoriza de nuevo o contacta con soporte.',
			noInstagramAccount:
				'No se autorizó ninguna cuenta profesional de Instagram vinculada a una Página.',
			multipleInstagramAccounts:
				'Selecciona solo una cuenta profesional de Instagram para este experto.',
			accountAlreadyConnected: 'Esta cuenta de Instagram ya está conectada a otro experto.',
			generic: 'No se pudo conectar la cuenta de Instagram. Inténtalo de nuevo.'
		}
	},
	whatsapp: {
		overviewDescription: 'Número conectado de cada experto para mensajes y automatizaciones.',
		noNumber: 'Ningún número conectado',
		checkFailed: 'No se pudo consultar la conexión',
		accountsLoadingAria: 'Cargando conexiones de WhatsApp',
		unavailable: 'WhatsApp aún no está configurado en esta instalación',
		sectionTitle: 'WhatsApp Business',
		sectionDescription: 'Conexión del experto seleccionado para mensajes y automatizaciones.',
		emptyTitle: 'Ningún experto para conectar',
		emptyDescription: 'Registra un experto antes de conectar un número de WhatsApp Business.',
		loadingAria: 'Cargando conexión de WhatsApp',
		loadError: 'No se pudo consultar la conexión de este experto.',
		badgeError: 'Error',
		connectedAt: 'Conectado el {date}',
		authorize: 'Autoriza la cuenta y el número de WhatsApp Business de este experto.',
		connectedSuccess: 'WhatsApp conectado correctamente.',
		cancelled: 'Se canceló la conexión con WhatsApp.',
		disconnected: 'WhatsApp desconectado.',
		connect: 'Conectar WhatsApp',
		notConfigured: 'WhatsApp aún no está configurado en esta instalación',
		verifiedName: 'Nombre verificado:',
		quality: 'Calidad',
		qualityLevels: {
			high: 'Alta',
			medium: 'Media',
			low: 'Baja',
			unknown: 'No informada'
		},
		disconnectTitle: '¿Desconectar WhatsApp?',
		disconnectWarning:
			'Las automatizaciones de WhatsApp de este experto se detendrán hasta que se conecte un número nuevamente.',
		errors: {
			notConfigured: 'WhatsApp aún no se ha configurado en esta instalación.',
			notAuthorized: 'Esta cuenta de WhatsApp no está autorizada para esta instalación.',
			numberAlreadyConnected: 'Este número de WhatsApp ya está conectado a otro experto.',
			network: 'No se pudo acceder al servidor. Verifica tu conexión e inténtalo de nuevo.',
			generic: 'No se pudo completar la operación con WhatsApp. Inténtalo de nuevo.'
		}
	},
	signup: {
		sdkUnavailable: 'El SDK de Meta no estuvo disponible.',
		sdkTimeout: 'Meta tardó en cargar. Inténtalo de nuevo.',
		sdkLoadFailed: 'No se pudo cargar Meta.',
		metaFailed: 'Meta no pudo completar la conexión.',
		invalidData: 'Meta devolvió datos no válidos para la conexión.',
		timeout: 'La conexión con Meta expiró. Inténtalo de nuevo.',
		openFailed: 'No se pudo abrir la conexión con Meta.'
	}
};
