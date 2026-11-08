import type { experts as source } from '../pt-BR/experts.js';

export const experts: typeof source = {
	title: 'Experts',
	errors: {
		loadFailed: 'Could not load the experts.',
		notFound: 'Expert not found.'
	},
	list: {
		description: 'Manage the experts in your operation and their integrations.',
		newExpert: 'New expert',
		emptyTitle: 'No experts yet',
		emptyDescription: 'Add your first expert to connect your platforms.',
		register: 'Add expert',
		searchLabel: 'Search experts',
		searchPlaceholder: 'Search by name, email or business name',
		count: { one: '{count} expert', other: '{count} experts' },
		columns: {
			expert: 'Expert',
			commercialName: 'Business name',
			status: 'Status',
			instagram: 'Instagram',
			actions: 'Actions'
		},
		noEmail: 'No email',
		active: 'Active',
		inactive: 'Inactive',
		configure: 'Configure',
		configureAria: 'Configure {name}',
		notFound: 'No experts found'
	},
	new: {
		pageTitle: 'New expert',
		description: 'After saving, you can connect the Instagram account.',
		submit: 'Save expert'
	},
	detail: {
		description: 'Expert settings and Instagram account.',
		created: 'Expert added! Now connect the Instagram account.',
		submit: 'Save changes',
		dangerZone: 'Danger zone',
		dangerDescription:
			'Deleting the expert removes their settings and disconnects the Instagram account.',
		delete: 'Delete expert',
		deleteTitle: 'Delete {name}?',
		deleteWarning: 'This action cannot be undone.'
	},
	form: {
		dataTitle: 'Expert details',
		dataDescription: 'Identification information.',
		nameLabel: 'Name *',
		namePlaceholder: 'E.g.: Ana Souza',
		nameRequired: "Enter the expert's name.",
		commercialNameLabel: 'Business name',
		commercialNamePlaceholder: 'E.g.: Ana Souza Method',
		emailLabel: 'Email *',
		emailPlaceholder: 'contact@expert.com',
		integrationsTitle: 'Meta integrations',
		integrationsDescription:
			'Each channel has its own authorization on Meta: connecting one does not connect the others.',
		saveError: 'Could not save the expert. Please try again.'
	}
};
