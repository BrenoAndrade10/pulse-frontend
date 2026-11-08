import type { misc as source } from '../pt-BR/misc.js';

export const misc: typeof source = {
	selectExpert: {
		title: 'Selecciona un experto',
		description: 'Elige un experto en el selector de contexto para ver {subject}.',
		emptyTitle: 'Ningún experto registrado',
		register: 'Registrar experto'
	},
	placeholders: {
		email: {
			title: 'Correo electrónico',
			description: 'Crea y da seguimiento a mensajes para los contactos de tus lanzamientos.',
			emptyTitle: 'Envíos de correo próximamente',
			emptyDescription:
				'Próximamente podrás crear campañas y automatizar mensajes de correo electrónico desde aquí.'
		},
		campaigns: {
			title: 'Campañas',
			description: 'Campañas activas en las cuentas de anuncios de tus expertos.',
			emptyTitle: 'No se encontraron campañas',
			emptyDescription:
				'Las campañas se importan automáticamente de las cuentas de anuncios conectadas mediante Meta Ads.',
			connect: 'Conectar cuentas'
		},
		reports: {
			title: 'Informes',
			description: 'Informes de rendimiento por experto, campaña y período.',
			emptyTitle: 'No hay informes disponibles',
			emptyDescription:
				'Los informes estarán disponibles en cuanto haya datos de campañas importados.',
			goToDashboard: 'Ir al panel'
		}
	}
};
