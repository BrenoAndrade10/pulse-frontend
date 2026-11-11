import type { nav as source } from '../pt-BR/nav.js';

export const nav: typeof source = {
	overview: 'Overview',
	experts: 'Experts',
	launches: 'Launches',
	groups: {
		operation: 'Operations',
		audience: 'Audience',
		intelligence: 'Intelligence',
		management: 'Management'
	},
	items: {
		content: 'Content',
		campaigns: 'Campaigns',
		links: 'Links',
		tracking: 'Tracking',
		leads: 'Leads',
		whatsapp: 'WhatsApp',
		email: 'Email',
		analytics: 'Analytics',
		integrations: 'Integrations',
		settings: 'Settings'
	},
	aria: {
		mainMenu: 'Main menu',
		openMenu: 'Open menu',
		closeMenu: 'Close menu',
		containsCurrentPage: '(contains the current page)'
	},
	account: {
		fallbackName: 'My account',
		logout: 'Log out'
	},
	context: {
		title: 'Context',
		expert: 'Expert',
		launch: 'Launch',
		allExperts: 'All experts',
		allLaunches: 'All launches',
		noExperts: 'No experts',
		noLaunches: 'No launches',
		selectExpertHint: 'Select an expert to filter by launch'
	},
	expertsUnavailable: 'Could not load experts. Check the backend and try again.'
};
