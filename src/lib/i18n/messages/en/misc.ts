import type { misc as source } from '../pt-BR/misc.js';

export const misc: typeof source = {
	selectExpert: {
		title: 'Select an expert',
		description: 'Choose an expert in the context selector to view {subject}.',
		emptyTitle: 'No experts registered',
		register: 'Add expert'
	},
	placeholders: {
		email: {
			title: 'Email',
			description: 'Create and track messages for your launch contacts.',
			emptyTitle: 'Email sends coming soon',
			emptyDescription:
				'Soon you will be able to create campaigns and automate email messages here.'
		},
		campaigns: {
			title: 'Campaigns',
			description: 'Active campaigns in your experts’ ad accounts.',
			emptyTitle: 'No campaigns found',
			emptyDescription:
				'Campaigns are imported automatically from the ad accounts connected through Meta Ads.',
			connect: 'Connect accounts'
		},
		reports: {
			title: 'Reports',
			description: 'Performance reports by expert, campaign and period.',
			emptyTitle: 'No reports available',
			emptyDescription: 'Reports become available as soon as campaign data has been imported.',
			goToDashboard: 'Go to dashboard'
		}
	}
};
