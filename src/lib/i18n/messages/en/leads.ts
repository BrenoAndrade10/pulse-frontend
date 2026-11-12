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
		allLaunches: 'All launches',
		heatLabel: 'Filter by Heat',
		allHeat: 'All Heat levels'
	},
	summary: {
		count: { one: '{formatted} lead', other: '{formatted} leads' },
		inLaunch: 'in the launch {name}',
		selectedLaunch: 'selected',
		forSearch: 'for "{query}"',
		forHeat: 'with {band} Heat'
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
		leadFallback: 'lead',
		heat: 'Heat',
		heatAria: 'View Heat details for {name}: {status}'
	},
	heat: {
		bands: { hot: 'Hot', warm: 'Warm', cold: 'Cold' },
		notCalculated: 'Not calculated',
		dialog: {
			title: 'Heat for {name}',
			description: 'Recent engagement of this lead on your pages.',
			score: '{band} Heat · {score}',
			lastActivity: 'Last activity: {date}',
			noActivity: 'No activity in the last {days} days',
			explain: 'Heat considers activity from the last {days} days. Older activity weighs less.',
			noIdentityTitle: 'There are no visits linked to this lead yet',
			noIdentityDescription:
				'When this lead returns to your pages already identified, the activity will show up here.',
			notFound: 'Lead not found. It may have been deleted.',
			error: 'Could not load this lead’s Heat.',
			daysHeading: 'Activity by day',
			noSignals: 'No activity signals recorded in this period.',
			signals: {
				pageViews: 'Visits',
				engagedSeconds: 'Active time',
				maxScroll: 'Max scroll',
				interactions: 'Interactions',
				leads: 'Sign-ups',
				linkClicks: 'Link clicks'
			},
			duration: {
				minutesSeconds: '{minutes} min {seconds} s',
				minutes: '{minutes} min',
				seconds: '{seconds} s'
			}
		}
	},
	loadMore: 'Load more',
	delete: {
		title: 'Delete the data of {name}?',
		thisLead: 'this lead',
		description:
			'The lead, signups and launch enrollments are erased and cannot be recovered. Use this to fulfill data deletion requests (LGPD).'
	}
};
