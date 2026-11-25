import type { email as source } from '../pt-BR/email.js';

export const email: typeof source = {
	page: {
		title: 'Email',
		description: 'Send campaigns to your leads and track clicks and deliveries.',
		newCampaign: 'New campaign'
	},
	tabs: {
		tablist: 'Email sections',
		campaigns: 'Campaigns',
		automations: 'Automations',
		settings: 'Settings'
	},
	status: {
		draft: 'Draft',
		scheduled: 'Scheduled',
		sending: 'Sending',
		sent: 'Sent',
		active: 'Active',
		paused: 'Paused',
		canceled: 'Canceled',
		failed: 'Failed'
	},
	campaigns: {
		kpi: {
			sent: 'Sent',
			scheduled: 'Scheduled',
			failed: 'Failed'
		},
		search: 'Search campaign',
		allStatuses: 'All statuses',
		table: {
			campaign: 'Campaign',
			segment: 'Segment',
			status: 'Status',
			sent: 'Sent',
			date: 'Date'
		},
		subjectLine: 'Subject: {subject}',
		noSubject: 'No subject',
		progress: 'Sending {percent}',
		now: 'Now',
		count: {
			one: '{formatted} campaign',
			other: '{formatted} campaigns'
		},
		empty: {
			title: 'No campaigns yet',
			description: 'Create your first campaign and send it to a lead segment.',
			noResults: 'No campaigns found',
			noResultsDescription: 'Adjust the search or the status filter.'
		}
	},
	automations: {
		empty: {
			title: 'No automations yet',
			description: 'Trigger-based automations appear here once created.'
		},
		description: 'Automatic emails triggered by lead behavior.',
		new: 'New automation',
		soon: 'Coming soon',
		search: 'Search automation',
		table: {
			automation: 'Automation',
			trigger: 'Trigger',
			status: 'Status',
			sent: 'Sent',
			clicks: 'Clicks',
			actions: 'Actions'
		},
		actions: {
			pause: 'Pause',
			resume: 'Resume',
			edit: 'Edit'
		},
		triggers: {
			newLead: 'New lead signed up',
			becameHot: 'Lead became hot',
			clickedLink: 'Clicked a link',
			inactive: 'No action for 7 days'
		},
		count: {
			one: '{formatted} automation',
			other: '{formatted} automations'
		}
	},
	settings: {
		errors: {
			taken: 'This domain is already used by another expert.',
			domainRequired: 'Add a domain before continuing.',
			notVerified: 'Verify the sending domain before sending.',
			unavailable: 'The email provider is unavailable right now. Try again shortly.',
			campaignNotFound: 'Campaign not found.',
			campaignLocked: 'This campaign was already sent or is being sent and cannot be changed.',
			campaignInvalid: 'Fill in the name, subject and message to send.',
			scheduleInvalid: 'Choose a future date and time, within 1 year.',
			domainInvalid: 'Enter a valid domain, such as mail.yourdomain.com.',
			senderInvalid: 'Enter the sender name and email.',
			providerRejected: 'The email provider rejected this domain.',
			generic: 'Could not complete. Please try again.',
			load: 'Could not load the email settings.'
		},
		domain: {
			placeholder: 'mail.yourdomain.com',
			title: 'Sending domain',
			description: 'Add these records at your domain provider.',
			label: 'Domain',
			verify: 'Verify now',
			verifying: 'Verifying…',
			status: {
				none: 'Not configured',
				pending: 'Waiting for DNS',
				verified: 'Domain verified'
			}
		},
		records: {
			empty: 'DNS records appear here after the domain is added.',
			type: 'Type',
			name: 'Name',
			value: 'Value',
			status: 'Status',
			ok: 'OK',
			pending: 'Pending',
			recommended: 'Recommended',
			copy: 'Copy value',
			copied: 'Copied'
		},
		sender: {
			title: 'Sender',
			description: 'How your email appears in the inbox.',
			name: 'Name',
			email: 'Email',
			replyTo: 'Reply to',
			save: 'Save',
			saved: 'Changes saved',
			test: 'Send test email',
			testSent: 'Test sent to {email}'
		},
		health: {
			inactive: 'Sending inactive',
			title: 'Sending health',
			description: 'We pause automatically if reputation drops.',
			bounce: 'Bounce',
			complaint: 'Complaints',
			limit: 'limit {limit}',
			state: 'Status',
			active: 'Sending active'
		},
		limits: {
			empty: 'Limits apply once the domain is verified.',
			title: 'Limits and warm-up',
			description: 'The cap rises gradually to protect the new domain.',
			today: 'Today',
			unit: 'of {limit} emails',
			warmup: 'Warm-up day {day} of {total} · tomorrow {next}'
		},
		suppressions: {
			title: 'Unsubscribes and blocks',
			description: 'Anyone who left or bounced never receives again.',
			unsub: 'Unsubscribed',
			bounces: 'Bounces',
			complaints: 'Complaints',
			view: 'View list'
		}
	},
	report: {
		back: 'Campaigns',
		subline: 'Segment {segment} · {date}',
		export: 'Export CSV',
		kpi: {
			recipients: 'Recipients',
			pending: 'Queued',
			suppressed: 'Suppressed',
			failed: 'Failures',
			sent: 'Sent',
			delivered: 'Delivered',
			clicks: 'Clicks',
			opens: 'Opens*',
			unsub: 'Unsubscribes',
			bounces: 'Bounces',
			people: '{count} people',
			emails: '{count} emails',
			estimated: 'estimated'
		},
		chart: {
			title: 'Clicks over time',
			description: 'First 24 hours after sending',
			aria: 'Clicks per hour'
		},
		links: {
			empty: 'No clicks recorded yet.',
			title: 'Most clicked links',
			description: 'Where people went'
		},
		who: {
			empty: 'No one clicked yet.',
			title: 'Who clicked',
			description: 'Every click already feeds these people’s Pulse Heat',
			createSegment: 'Create segment from clickers',
			lead: 'Lead',
			heat: 'Heat',
			clickedIn: 'Clicked on',
			clicks: 'Clicks',
			last: 'Last click'
		},
		opensNote:
			'*Opens are estimated: apps like Apple Mail preload images. Clicks are the most reliable metric.',
		notFound: 'Campaign not found',
		cancel: 'Cancel sending',
		cancelTitle: 'Cancel this campaign?',
		cancelDescription:
			'Emails that have not gone out yet will not be sent. People who already received it are not affected.',
		cancelConfirm: 'Cancel sending',
		cancelKeep: 'Keep',
		failedDomain: 'Could not send: the sending domain is not verified.'
	},
	compose: {
		title: 'New campaign',
		editTitle: 'Edit campaign',
		description: 'Write the message that will be sent to your leads.',
		subject: 'Subject',
		message: 'Message',
		back: 'Campaigns',
		subjectPlaceholder: 'Welcome, {{nome}}',
		editorPlaceholder: 'Write the email message',
		steps: {
			segment: 'Segment',
			content: 'Content',
			review: 'Review and send'
		},
		stepLabel: 'Step {{n}}',
		stepsAria: 'Campaign steps',
		stepHints: {
			segment: 'Choose who receives it',
			content: 'Write and preview',
			review: 'Check and send'
		},
		segment: {
			title: 'Who to send to',
			description: 'Choose a segment. The list is built at sending time.',
			hot: 'Hot',
			warm: 'Warm',
			idle: 'No action',
			hotHint: 'priority leads',
			warmHint: 'engaged leads',
			idleHint: 'received and did not act',
			recipients: '{count} recipients',
			suppressed: '{count} suppressed (unsubscribe or bounce)',
			withinLimit: 'Within the daily limit',
			overLimit: 'Over the daily limit: sending will be split over days'
		},
		preview: {
			title: 'Preview',
			desktop: 'Desktop',
			mobile: 'Mobile',
			from: 'From',
			subject: 'Subject',
			footer: 'You received this because you signed up on {expert}’s pages.',
			unsubscribe: 'Unsubscribe'
		},
		actions: {
			next: 'Continue',
			back: 'Back',
			saveDraft: 'Save draft',
			send: 'Send campaign',
			schedule: 'Schedule sending'
		},
		review: {
			needsDomain: 'Set up and verify the sending domain in the Settings tab to send.',
			title: 'Review before sending',
			segment: 'Segment',
			recipients: 'Recipients',
			sender: 'Sender',
			subject: 'Subject',
			when: 'When to send',
			now: 'Now',
			later: 'Schedule'
		},
		validation: {
			subject: 'Enter the subject',
			content: 'Write the message'
		}
	},
	editor: {
		label: 'Message editor',
		toolbar: 'Formatting tools',
		undo: 'Undo',
		redo: 'Redo',
		blockType: 'Block type',
		paragraph: 'Paragraph',
		heading1: 'Heading 1',
		heading2: 'Heading 2',
		heading3: 'Heading 3',
		bold: 'Bold',
		italic: 'Italic',
		underline: 'Underline',
		strike: 'Strikethrough',
		color: 'Text color',
		alignLeft: 'Align left',
		alignCenter: 'Center',
		alignRight: 'Align right',
		bulletList: 'Bullet list',
		orderedList: 'Numbered list',
		quote: 'Quote',
		divider: 'Divider',
		link: 'Link',
		unlink: 'Remove link',
		image: 'Image',
		button: 'Button',
		variables: 'Variables',
		source: 'HTML code',
		url: 'Link address',
		apply: 'Apply',
		insert: 'Insert',
		imageUrl: 'Image address',
		imageAlt: 'Alt text',
		buttonLabel: 'Button text',
		variablesHint: "Inserts each person's data:"
	}
};
