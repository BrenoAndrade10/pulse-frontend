import type { launches as source } from '../pt-BR/launches.js';

export const launches: typeof source = {
	title: 'Lanzamientos',
	description: 'Planificación y calendario de {expert}.',
	descriptionAll: 'Planificación de los lanzamientos por experto.',
	new: 'Nuevo lanzamiento',
	backendUnavailable: 'El módulo de lanzamientos aún debe ser habilitado por el backend.',
	noExperts: 'Ningún experto registrado',
	empty: {
		title: 'Ningún lanzamiento configurado',
		description:
			'Crea el primer lanzamiento de este experto para organizar el calendario y las metas.',
		create: 'Crear lanzamiento'
	},
	status: {
		draft: 'Borrador',
		planned: 'Planificado',
		in_progress: 'En curso',
		completed: 'Completado',
		canceled: 'Cancelado',
		archived: 'Archivado'
	},
	types: {
		internal: 'Lanzamiento clásico',
		seed: 'Lanzamiento semilla',
		perpetual: 'Perpetuo / Evergreen',
		webinar: 'Webinar / Masterclass',
		other: 'Otro'
	},
	table: {
		launch: 'Lanzamiento',
		type: 'Tipo',
		period: 'Período',
		status: 'Estado',
		timezone: 'Zona horaria',
		expertFallback: 'Experto',
		noDescription: 'Sin descripción',
		noStart: 'Sin inicio',
		edit: 'Editar'
	},
	form: {
		editTitle: 'Editar lanzamiento',
		newTitle: 'Nuevo lanzamiento',
		description: 'Configura el responsable, la clasificación y el período del lanzamiento.',
		expert: 'Experto responsable *',
		name: 'Nombre *',
		start: 'Inicio',
		end: 'Fin',
		status: 'Estado',
		timezone: 'Zona horaria *',
		type: 'Tipo de lanzamiento',
		typeHint: 'Esta clasificación se usa solo para organizar los informes.',
		descriptionLabel: 'Descripción',
		saveChanges: 'Guardar cambios',
		create: 'Crear lanzamiento',
		saveError: 'No se pudo guardar el lanzamiento.'
	},
	validation: {
		expert: 'Selecciona el experto responsable.',
		name: 'Ingresa el nombre del lanzamiento.',
		timezone: 'Selecciona la zona horaria.',
		endsAfterStart: 'La fecha final debe ser posterior a la inicial.'
	}
};
