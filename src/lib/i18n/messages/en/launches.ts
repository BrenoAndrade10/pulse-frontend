import type { launches as source } from '../pt-BR/launches.js';

export const launches: typeof source = {
	title: 'Launches',
	description: 'Planning and calendar for {expert}.',
	descriptionAll: 'Launch planning by expert.',
	new: 'New launch',
	backendUnavailable: 'The launches module still needs to be made available by the backend.',
	noExperts: 'No experts registered',
	empty: {
		title: 'No launches set up',
		description: 'Create this expert’s first launch to organize the calendar and goals.',
		create: 'Create launch'
	},
	status: {
		draft: 'Draft',
		planned: 'Planned',
		in_progress: 'In progress',
		completed: 'Completed',
		canceled: 'Canceled',
		archived: 'Archived'
	},
	types: {
		internal: 'Classic launch',
		seed: 'Seed launch',
		perpetual: 'Perpetual / Evergreen',
		webinar: 'Webinar / Masterclass',
		other: 'Other'
	},
	table: {
		launch: 'Launch',
		type: 'Type',
		period: 'Period',
		status: 'Status',
		timezone: 'Time zone',
		expertFallback: 'Expert',
		noDescription: 'No description',
		noStart: 'No start date',
		edit: 'Edit'
	},
	form: {
		editTitle: 'Edit launch',
		newTitle: 'New launch',
		description: 'Set the owner, classification and period of the launch.',
		expert: 'Responsible expert *',
		name: 'Name *',
		start: 'Start',
		end: 'End',
		status: 'Status',
		timezone: 'Time zone *',
		type: 'Launch type',
		typeHint: 'This classification is only used to organize reports.',
		descriptionLabel: 'Description',
		saveChanges: 'Save changes',
		create: 'Create launch',
		saveError: 'Could not save the launch.'
	},
	validation: {
		expert: 'Select the responsible expert.',
		name: 'Enter the launch name.',
		timezone: 'Select the time zone.',
		endsAfterStart: 'The end date must be after the start date.'
	}
};
