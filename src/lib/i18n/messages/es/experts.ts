import type { experts as source } from '../pt-BR/experts.js';

export const experts: typeof source = {
	title: 'Expertos',
	errors: {
		loadFailed: 'No se pudieron cargar los expertos.',
		notFound: 'Experto no encontrado.'
	},
	list: {
		description: 'Gestiona los expertos de tu operación y sus integraciones.',
		newExpert: 'Nuevo experto',
		emptyTitle: 'Ningún experto registrado',
		emptyDescription: 'Registra al primer experto para conectar tus plataformas.',
		register: 'Registrar experto',
		searchLabel: 'Buscar expertos',
		searchPlaceholder: 'Buscar por nombre, correo o nombre comercial',
		count: { one: '{count} experto', other: '{count} expertos' },
		columns: {
			expert: 'Experto',
			commercialName: 'Nombre comercial',
			status: 'Estado',
			instagram: 'Instagram',
			actions: 'Acciones'
		},
		noEmail: 'Sin correo',
		active: 'Activo',
		inactive: 'Inactivo',
		configure: 'Configurar',
		configureAria: 'Configurar a {name}',
		notFound: 'No se encontraron expertos'
	},
	new: {
		pageTitle: 'Nuevo experto',
		description: 'Después de guardar, podrás conectar la cuenta de Instagram.',
		submit: 'Guardar experto'
	},
	detail: {
		description: 'Configuración y cuenta de Instagram del experto.',
		created: '¡Experto registrado! Ahora conecta la cuenta de Instagram.',
		submit: 'Guardar cambios',
		dangerZone: 'Zona de peligro',
		dangerDescription:
			'Eliminar al experto borra su configuración y desconecta la cuenta de Instagram.',
		delete: 'Eliminar experto',
		deleteTitle: '¿Eliminar a {name}?',
		deleteWarning: 'Esta acción no se puede deshacer.'
	},
	form: {
		dataTitle: 'Datos del experto',
		dataDescription: 'Información de identificación.',
		nameLabel: 'Nombre *',
		namePlaceholder: 'Ej.: Ana Souza',
		nameRequired: 'Ingresa el nombre del experto.',
		commercialNameLabel: 'Nombre comercial',
		commercialNamePlaceholder: 'Ej.: Método Ana Souza',
		emailLabel: 'Correo electrónico *',
		emailPlaceholder: 'contacto@experto.com',
		integrationsTitle: 'Integraciones de Meta',
		integrationsDescription:
			'Cada canal tiene su propia autorización en Meta: conectar uno no conecta los demás.',
		saveError: 'No se pudo guardar al experto. Inténtalo de nuevo.'
	}
};
