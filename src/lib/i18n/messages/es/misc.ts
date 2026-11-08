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
	},
	dataDeletion: {
		title: 'Eliminación de datos de Meta',
		description: 'Cómo solicitar la eliminación de los datos de Meta asociados a tu cuenta.',
		sections: {
			request: 'Cómo solicitarla',
			disconnect: 'Desconectar integraciones',
			deleted: 'Qué se eliminará',
			deadline: 'Plazo de eliminación',
			retention: 'Conservaciones legales',
			privacy: 'Política de privacidad'
		},
		intro:
			'Esta página explica cómo solicitar la eliminación de los datos que {product} recibió de Meta, incluidos Facebook e Instagram.',
		requestLead: 'Puedes solicitar la eliminación de tus datos de Meta por correo electrónico:',
		requestEmail:
			'Envía un mensaje a {email} con el asunto “Eliminación de datos de Meta” e indica el correo electrónico de tu cuenta.',
		requestConfirmation:
			'Responderemos por el mismo canal para confirmar la recepción y la conclusión de la solicitud.',
		disconnect:
			'Como alternativa, desconecta Instagram o WhatsApp en Integraciones dentro de la plataforma. Esto detiene el acceso futuro de la integración e inicia la eliminación de los datos vinculados según la Política de privacidad.',
		disconnectLink: 'Abrir Integraciones',
		deleted:
			'Tras validar la solicitud, eliminamos las credenciales y los tokens de acceso, los identificadores y los demás datos de la cuenta conectada recibidos de Meta. Los leads y otros datos vinculados se tratan y eliminan según los criterios de la Política de privacidad.',
		deadline:
			'La eliminación se completa en un plazo máximo de {days} días, salvo que sea necesaria una confirmación adicional o una conservación exigida por ley.',
		retention:
			'Podemos conservar datos durante el tiempo necesario para cumplir obligaciones legales, ejercer derechos o atender solicitudes de las autoridades. En esos casos, el acceso queda restringido y los datos se eliminan cuando termina la obligación.',
		privacy: 'Para conocer los plazos y las demás reglas de tratamiento, consulta la',
		privacyLink: 'Política de privacidad'
	}
};
