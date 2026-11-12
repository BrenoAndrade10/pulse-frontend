import type { leads as source } from '../pt-BR/leads.js';

export const leads: typeof source = {
	title: 'Leads',
	description: 'Personas que se registraron en los formularios de las páginas de {expert}.',
	descriptionAll: 'Personas que se registraron en los formularios de las páginas de tus expertos.',
	exportCsv: 'Exportar CSV',
	selectSubject: 'los leads',
	selectEmpty: 'Los leads se organizan por experto. Registra uno para comenzar.',
	search: {
		label: 'Buscar lead',
		placeholder: 'Correo o teléfono completo',
		clear: 'Borrar búsqueda',
		submit: 'Buscar'
	},
	filter: {
		launchLabel: 'Filtrar por lanzamiento',
		allLaunches: 'Todos los lanzamientos',
		heatLabel: 'Filtrar por Heat',
		allHeat: 'Todos los Heats'
	},
	summary: {
		count: { one: '{formatted} lead', other: '{formatted} leads' },
		inLaunch: 'en el lanzamiento {name}',
		selectedLaunch: 'seleccionado',
		forSearch: 'para "{query}"',
		forHeat: 'con Heat {band}'
	},
	errors: {
		loadMore: 'No se pudieron cargar más leads. Inténtalo de nuevo.',
		export: 'No se pudo generar el archivo. Inténtalo de nuevo.',
		delete: 'No se pudo eliminar el lead. Inténtalo de nuevo.',
		encryptionNotConfigured: 'La captación de leads aún no se configuró en el servidor.',
		validation: 'Busca por un correo completo o por un teléfono con código de área.',
		load: 'No se pudieron cargar los leads.'
	},
	unavailable: 'Leads no disponibles',
	clearFilters: 'Borrar filtros',
	empty: {
		notFoundTitle: 'No se encontraron leads',
		noneTitle: 'Aún no hay leads',
		notFoundDescription: 'Revisa el correo o teléfono ingresado, o cambia el lanzamiento.',
		noneDescription: 'Configura un formulario en Rastreo: cada envío se convierte en un lead aquí.',
		configureTracking: 'Configurar rastreo'
	},
	table: {
		lead: 'Lead',
		contact: 'Contacto',
		launches: 'Lanzamientos',
		firstSignup: 'Primer registro',
		origin: 'Origen',
		actions: 'Acciones',
		noName: 'Sin nombre',
		launchFallback: 'Lanzamiento',
		noLaunch: 'Sin lanzamiento',
		deleteAria: 'Eliminar {name}',
		leadFallback: 'lead',
		heat: 'Heat',
		heatAria: 'Ver detalles del Heat de {name}: {status}'
	},
	heat: {
		bands: { hot: 'Caliente', warm: 'Tibio', cold: 'Frío' },
		notCalculated: 'No calculado',
		dialog: {
			title: 'Heat de {name}',
			description: 'Interacción reciente del lead en tus páginas.',
			score: 'Heat {band} · {score}',
			lastActivity: 'Última actividad: {date}',
			noActivity: 'Sin actividad en los últimos {days} días',
			explain:
				'El Heat considera la actividad de los últimos {days} días. La actividad más antigua pesa menos.',
			noIdentityTitle: 'Aún no hay visitas vinculadas a este lead',
			noIdentityDescription:
				'Cuando este lead vuelva a entrar a tus páginas ya identificado, la actividad aparecerá aquí.',
			notFound: 'Lead no encontrado. Puede haber sido eliminado.',
			error: 'No se pudo cargar el Heat de este lead.',
			daysHeading: 'Actividad por día',
			noSignals: 'No se registraron señales de actividad en este período.',
			signals: {
				pageViews: 'Visitas',
				engagedSeconds: 'Tiempo activo',
				maxScroll: 'Desplazamiento máximo',
				interactions: 'Interacciones',
				leads: 'Registros',
				linkClicks: 'Clics en enlaces'
			},
			duration: {
				minutesSeconds: '{minutes} min {seconds} s',
				minutes: '{minutes} min',
				seconds: '{seconds} s'
			}
		}
	},
	loadMore: 'Cargar más',
	delete: {
		title: '¿Eliminar los datos de {name}?',
		thisLead: 'este lead',
		description:
			'El lead, los registros y las inscripciones en los lanzamientos se borran y no se pueden recuperar. Úsalo para atender solicitudes de eliminación de datos (LGPD).'
	}
};
