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
	},
	dataDeletion: {
		title: 'Meta Data Deletion',
		description: 'How to request deletion of Meta data associated with your account.',
		sections: {
			request: 'How to request deletion',
			disconnect: 'Disconnect integrations',
			deleted: 'What will be deleted',
			deadline: 'Deletion timeline',
			retention: 'Legal retention',
			privacy: 'Privacy Policy'
		},
		intro:
			'This page explains how to request deletion of data that {product} received from Meta, including Facebook and Instagram.',
		requestLead: 'You can request deletion of your Meta data by email:',
		requestEmail:
			'Send a message to {email} with the subject “Meta Data Deletion” and include the email address for your account.',
		requestConfirmation:
			'We will reply through the same channel to confirm receipt and completion of the request.',
		disconnect:
			'Alternatively, disconnect Instagram or WhatsApp under Integrations in the platform. This stops future integration access and starts removal of linked data according to the Privacy Policy.',
		disconnectLink: 'Open Integrations',
		deleted:
			'After validating the request, we delete credentials and access tokens, identifiers, and other connected-account data received from Meta. Leads and other linked data are handled and deleted according to the Privacy Policy criteria.',
		deadline:
			'Deletion is completed within {days} days, unless additional confirmation or legally required retention applies.',
		retention:
			'We may retain data for as long as necessary to comply with legal obligations, exercise rights, or respond to authorities. In those cases, access is restricted and the data is deleted when the obligation ends.',
		privacy: 'For the timelines and other processing rules, see the',
		privacyLink: 'Privacy Policy'
	}
};
