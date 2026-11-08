import type { dashboard as source } from '../pt-BR/dashboard.js';

export const dashboard: typeof source = {
	header: {
		overview: 'Overview',
		expert: 'Expert',
		periodLabel: 'Period',
		launchDescription: '{type}. Results for the last {period}.',
		expertDescription: 'Consolidated results of {name}’s launches over the last {period}.',
		allDescription: 'Consolidated results of your experts over the last {period}.'
	},
	periods: {
		'7d': '7 days',
		'30d': '30 days',
		'90d': '90 days'
	},
	actions: {
		viewLeads: 'View leads',
		viewLaunches: 'View launches',
		goToLaunches: 'Go to launches',
		registerExpert: 'Add expert'
	},
	launchStatus: {
		draft: 'Draft',
		planned: 'Planned',
		in_progress: 'In progress',
		completed: 'Completed',
		canceled: 'Canceled',
		archived: 'Archived'
	},
	launchType: {
		internal: 'Classic launch',
		seed: 'Seed launch',
		perpetual: 'Perpetual / Evergreen',
		webinar: 'Webinar / Masterclass',
		other: 'Other'
	},
	kpi: {
		spend: 'Ad spend',
		revenue: 'Revenue',
		roas: 'ROAS',
		leads: 'Leads',
		cpl: 'Cost per lead',
		sales: 'Sales',
		noData: 'No data for this period',
		vsPrevious: 'vs. previous period'
	},
	chart: {
		title: 'Spend vs. Revenue',
		description: 'Daily trend for the selected period.',
		ariaLabel: 'Chart of ad spend and revenue by day',
		revenue: 'Revenue',
		spend: 'Ad spend',
		emptyTitle: 'No data to display',
		emptyDescription:
			'Results will appear here once a Meta Ads account with active campaigns is connected.'
	},
	instagram: {
		title: 'Instagram',
		description: 'Connection status for your experts.',
		connected: 'Connected',
		expired: 'Connection expired',
		notConnected: 'Not connected',
		manage: 'Manage connections',
		emptyTitle: 'No connected accounts',
		emptyDescription: 'Add an expert to connect their professional Instagram account.'
	},
	table: {
		title: 'Performance by expert',
		description: 'Results comparison for the period.',
		expert: 'Expert',
		spend: 'Ad spend',
		revenue: 'Revenue',
		roas: 'ROAS',
		leads: 'Leads',
		cpl: 'CPL',
		emptyTitle: 'No performance recorded',
		emptyDescription: 'Once your experts have campaigns running, the comparison will show up here.'
	},
	announce: {
		dismissed: 'Setup guide dismissed. You can reopen it in Settings.',
		finished: 'Setup guide completed.'
	},
	checklist: {
		allDoneEyebrow: 'All set',
		eyebrow: 'Getting started',
		allDoneTitle: 'Your Pulse is set up',
		title: 'Set up your Pulse',
		allDoneDescription: 'All applicable steps are done. You can reopen the guide in Settings.',
		description: 'Set up the features you want to use. You can continue later.',
		progress: 'Setup progress',
		progressCount: '{completed} of {total} completed',
		finish: 'Finish',
		dismiss: 'Dismiss for now',
		next: 'Next step',
		doneSr: '(completed)'
	},
	onboarding: {
		subjectAll: 'your experts',
		expert: {
			title: 'Add your first expert',
			description: 'Name, email and basic details of the person you manage.',
			cta: 'Add'
		},
		instagram: {
			title: 'Connect Instagram',
			titleSingle: 'Connect {name}’s Instagram',
			descriptionExpired:
				'The connection expired. Reconnect the professional account to resume importing posts.',
			description: 'Authorize the professional account to import posts and Reels.',
			ctaReconnect: 'Reconnect',
			cta: 'Connect'
		},
		pixel: {
			title: 'Install the Pulse pixel',
			description:
				'Track sign-ups and events on the pages of {subject}. Choose the expert in the context selector.',
			cta: 'Set up'
		},
		whatsapp: {
			title: 'Connect WhatsApp Business',
			description: 'Send automatic messages to the leads of {subject}.',
			cta: 'Connect'
		}
	}
};
