import type { settings as source } from '../pt-BR/settings.js';

export const settings: typeof source = {
	pageTitle: 'Settings',
	description: 'Your account, team and security details.',
	guide: {
		title: 'Setup guide',
		dismissed:
			'The guide is dismissed on the Dashboard. Your progress is calculated from your real account data.',
		completed: 'You completed the guide. Reopen it to review your setup steps.',
		visible: 'The guide is visible on the Dashboard.',
		reopen: 'Reopen guide on the Dashboard'
	},
	security: {
		title: 'Security',
		loadingAria: 'Loading security settings',
		loadError: 'Could not load the security settings.',
		authenticator: {
			title: 'Authenticator app (optional)',
			description: 'Use an authenticator app instead of the code sent by email.',
			enabled: 'Enabled',
			disabled: 'Disabled',
			codesAvailable: { one: '{count} code available', other: '{count} codes available' },
			regenerate: 'Generate new recovery codes',
			activate: 'Enable authenticator app',
			startError: 'Could not start the setup.',
			activateError: 'Could not enable the authenticator app.',
			generateError: 'Could not generate new codes.'
		},
		devices: {
			title: 'Trusted browsers',
			description: 'Browsers that can sign in without requesting the code for up to 30 days.',
			empty: 'No trusted browsers.',
			current: 'This browser',
			usage: 'Last used: {lastUsed} · Expires: {expiresAt}',
			removeError: 'Could not remove the trusted browser.',
			removeTitle: 'Remove trusted browser?',
			removeDescription:
				'{label} will need to enter the verification code the next time it signs in.'
		},
		setup: {
			title: 'Enable authenticator app',
			instructions: 'Scan the QR code with your authenticator app and enter the generated code.',
			qrAlt: 'QR code to set up the authenticator app',
			cantScan: "Can't scan it?",
			copyKey: 'Copy key',
			copied: 'Copied',
			activate: 'Enable'
		},
		recovery: {
			title: 'Generate new codes',
			instructions: 'Enter the current code from your authenticator app.',
			generate: 'Generate codes'
		},
		codeLabel: '6-digit code',
		finish: 'Done'
	}
};
