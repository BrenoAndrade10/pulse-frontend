import type { dashboard as source } from '../pt-BR/dashboard.js';

export const dashboard: typeof source = {
	header: {
		overview: 'Resumen general',
		expert: 'Experto',
		periodLabel: 'Período',
		launchDescription: '{type}. Resultados de los últimos {period}.',
		expertDescription:
			'Resultados consolidados de los lanzamientos de {name} en los últimos {period}.',
		allDescription: 'Resultados consolidados de tus expertos en los últimos {period}.'
	},
	periods: {
		'7d': '7 días',
		'30d': '30 días',
		'90d': '90 días'
	},
	actions: {
		viewLeads: 'Ver leads',
		viewLaunches: 'Ver lanzamientos',
		goToLaunches: 'Ir a lanzamientos',
		registerExpert: 'Registrar experto'
	},
	launchStatus: {
		draft: 'Borrador',
		planned: 'Planificado',
		in_progress: 'En curso',
		completed: 'Completado',
		canceled: 'Cancelado',
		archived: 'Archivado'
	},
	launchType: {
		internal: 'Lanzamiento clásico',
		seed: 'Lanzamiento semilla',
		perpetual: 'Perpetuo / Evergreen',
		webinar: 'Webinar / Masterclass',
		other: 'Otro'
	},
	kpi: {
		spend: 'Inversión',
		revenue: 'Ingresos',
		roas: 'ROAS',
		leads: 'Leads',
		cpl: 'Costo por lead',
		sales: 'Ventas',
		noData: 'Sin datos en el período',
		vsPrevious: 'vs. período anterior'
	},
	chart: {
		title: 'Inversión x Ingresos',
		description: 'Evolución diaria en el período seleccionado.',
		ariaLabel: 'Gráfico de inversión e ingresos por día',
		revenue: 'Ingresos',
		spend: 'Inversión',
		emptyTitle: 'No hay datos para mostrar',
		emptyDescription:
			'Los resultados aparecerán aquí cuando haya una cuenta de anuncios de Meta Ads conectada con campañas activas.'
	},
	instagram: {
		title: 'Instagram',
		description: 'Estado de las conexiones de los expertos.',
		connected: 'Conectadas',
		expired: 'Conexión vencida',
		notConnected: 'No conectadas',
		manage: 'Administrar conexiones',
		emptyTitle: 'Ninguna cuenta conectada',
		emptyDescription: 'Registra un experto para conectar su cuenta profesional de Instagram.'
	},
	table: {
		title: 'Desempeño por experto',
		description: 'Comparativo de resultados en el período.',
		expert: 'Experto',
		spend: 'Inversión',
		revenue: 'Ingresos',
		roas: 'ROAS',
		leads: 'Leads',
		cpl: 'CPL',
		emptyTitle: 'Sin desempeño registrado',
		emptyDescription: 'Cuando tus expertos tengan campañas activas, el comparativo aparecerá aquí.'
	},
	announce: {
		dismissed: 'Guía de configuración descartada. Puedes volver a abrirla en Configuración.',
		finished: 'Guía de configuración completada.'
	},
	checklist: {
		allDoneEyebrow: 'Todo listo',
		eyebrow: 'Primeros pasos',
		allDoneTitle: 'Tu Pulse está configurado',
		title: 'Prepara tu Pulse',
		allDoneDescription:
			'Se completaron todos los pasos aplicables. Puedes volver a abrir la guía en Configuración.',
		description: 'Configura las funcionalidades que quieres usar. Puedes continuar después.',
		progress: 'Progreso de la configuración',
		progressCount: '{completed} de {total} completados',
		finish: 'Finalizar',
		dismiss: 'Descartar por ahora',
		next: 'Siguiente paso',
		doneSr: '(completado)'
	},
	onboarding: {
		subjectAll: 'tus expertos',
		expert: {
			title: 'Registra a tu primer experto',
			description: 'Nombre, correo electrónico y datos básicos de a quien administras.',
			cta: 'Registrar'
		},
		instagram: {
			title: 'Conecta Instagram',
			titleSingle: 'Conecta el Instagram de {name}',
			descriptionExpired:
				'La conexión venció. Vuelve a conectar la cuenta profesional para seguir importando publicaciones.',
			description: 'Autoriza la cuenta profesional para importar publicaciones y Reels.',
			ctaReconnect: 'Reconectar',
			cta: 'Conectar'
		},
		pixel: {
			title: 'Instala el pixel de Pulse',
			description:
				'Mide registros y eventos en las páginas de {subject}. Elige al experto en el selector de contexto.',
			cta: 'Configurar'
		},
		whatsapp: {
			title: 'Conecta WhatsApp Business',
			description: 'Envía mensajes automáticos a los leads de {subject}.',
			cta: 'Conectar'
		}
	}
};
