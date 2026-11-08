import type { nav as source } from '../pt-BR/nav.js';

export const nav: typeof source = {
	overview: 'Visión general',
	experts: 'Expertos',
	launches: 'Lanzamientos',
	groups: {
		operation: 'Operación',
		audience: 'Audiencia',
		intelligence: 'Inteligencia',
		management: 'Gestión'
	},
	items: {
		content: 'Contenidos',
		campaigns: 'Campañas',
		tracking: 'Seguimiento',
		leads: 'Leads',
		whatsapp: 'WhatsApp',
		email: 'Correo',
		analytics: 'Análisis',
		integrations: 'Integraciones',
		settings: 'Configuración'
	},
	aria: {
		mainMenu: 'Menú principal',
		openMenu: 'Abrir menú',
		closeMenu: 'Cerrar menú',
		containsCurrentPage: '(contiene la página actual)'
	},
	account: {
		fallbackName: 'Mi cuenta',
		logout: 'Salir'
	},
	context: {
		title: 'Contexto',
		expert: 'Experto',
		launch: 'Lanzamiento',
		allExperts: 'Todos los expertos',
		allLaunches: 'Todos los lanzamientos',
		noExperts: 'Ningún experto',
		noLaunches: 'Ningún lanzamiento',
		selectExpertHint: 'Selecciona un experto para filtrar por lanzamiento'
	},
	expertsUnavailable: 'No se pudieron cargar los expertos. Revisa el backend e inténtalo de nuevo.'
};
