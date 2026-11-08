import type { leads as source } from '../pt-BR/leads.js';

export const leads: typeof source = {
	title: 'Leads',
	description: 'People who signed up through the forms on {expert}’s pages.',
	descriptionAll: 'People who signed up through the forms on your experts’ pages.',
	exportCsv: 'Export CSV',
	selectSubject: 'leads',
	selectEmpty: 'Leads are organized by expert. Add one to get started.',
	search: {
		label: 'Search leads',
		placeholder: 'Full email or phone number',
		clear: 'Clear search',
		submit: 'Search'
	},
	filter: {
		launchLabel: 'Filter by launch',
		allLaunches: 'All launches'
	},
	summary: {
		count: { one: '{formatted} lead', other: '{formatted} leads' },
		inLaunch: 'in the launch {name}',
		selectedLaunch: 'selected',
		forSearch: 'for "{query}"'
	},
	errors: {
		loadMore: 'Could not load more leads. Please try again.',
		export: 'Could not generate the file. Please try again.',
		delete: 'Could not delete the lead. Please try again.',
		encryptionNotConfigured: 'Lead capture has not been configured on the server yet.',
		validation: 'Search by a full email address or a phone number with area code.',
		load: 'Could not load leads.'
	},
	unavailable: 'Leads unavailable',
	clearFilters: 'Clear filters',
	empty: {
		notFoundTitle: 'No leads found',
		noneTitle: 'No leads yet',
		notFoundDescription: 'Check the email or phone number you entered, or change the launch.',
		noneDescription: 'Set up a form in Tracking: every submission becomes a lead here.',
		configureTracking: 'Set up tracking'
	},
	table: {
		lead: 'Lead',
		contact: 'Contact',
		launches: 'Launches',
		firstSignup: 'First signup',
		origin: 'Source',
		actions: 'Actions',
		noName: 'No name',
		launchFallback: 'Launch',
		noLaunch: 'No launch',
		deleteAria: 'Delete {name}',
		leadFallback: 'lead'
	},
	loadMore: 'Load more',
	delete: {
		title: 'Delete the data of {name}?',
		thisLead: 'this lead',
		description:
			'The lead, signups and launch enrollments are erased and cannot be recovered. Use this to fulfill data deletion requests (LGPD).'
	}
};
