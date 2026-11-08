import type { common as source } from '../pt-BR/common.js';

export const common: typeof source = {
	actions: {
		save: 'Save',
		cancel: 'Cancel',
		delete: 'Delete',
		edit: 'Edit',
		close: 'Close',
		continue: 'Continue',
		back: 'Back',
		confirm: 'Confirm',
		create: 'Create',
		remove: 'Remove',
		copy: 'Copy',
		retry: 'Try again'
	},
	status: {
		loading: 'Loading…',
		saving: 'Saving…',
		genericError: 'Something went wrong. Please try again.'
	},
	language: {
		title: 'Language',
		description: 'Choose the platform language. Your choice is saved in this browser.',
		label: 'Platform language'
	},
	time: {
		justNow: 'just now'
	},
	error: {
		title: 'Error',
		fallback: 'Something went wrong.',
		serverUnavailable: 'Could not connect to the server.',
		backHome: 'Back to start'
	}
};
