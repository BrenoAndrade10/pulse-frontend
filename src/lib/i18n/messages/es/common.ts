import type { common as source } from '../pt-BR/common.js';

export const common: typeof source = {
	actions: {
		save: 'Guardar',
		cancel: 'Cancelar',
		delete: 'Eliminar',
		edit: 'Editar',
		close: 'Cerrar',
		continue: 'Continuar',
		back: 'Volver',
		confirm: 'Confirmar',
		create: 'Crear',
		remove: 'Quitar',
		copy: 'Copiar',
		retry: 'Intentar de nuevo'
	},
	status: {
		loading: 'Cargando…',
		saving: 'Guardando…',
		genericError: 'Algo salió mal. Inténtalo de nuevo.'
	},
	language: {
		title: 'Idioma',
		description: 'Elige el idioma de la plataforma. La elección se guarda en este navegador.',
		label: 'Idioma de la plataforma'
	},
	time: {
		justNow: 'justo ahora'
	},
	error: {
		title: 'Error',
		fallback: 'Algo salió mal.',
		serverUnavailable: 'No se pudo conectar con el servidor.',
		backHome: 'Volver al inicio'
	}
};
