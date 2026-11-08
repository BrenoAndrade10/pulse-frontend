import type { whatsapp as source } from '../pt-BR/whatsapp.js';

export const whatsapp: typeof source = {
	list: {
		pageTitle: 'WhatsApp',
		title: 'WhatsApp messages',
		descriptionExpert: 'Automate messages for {name}’s leads.',
		descriptionNoExpert: 'Automate messages based on your experts’ events.',
		create: 'Create automation',
		loading: 'Loading automations',
		loadError: {
			title: 'Couldn’t load automations',
			description: 'Refresh the page and try again.'
		},
		empty: {
			title: 'No automations yet',
			description: 'Automatically send messages when your leads take an action.'
		},
		filters: {
			event: 'Filter by event',
			destination: 'Filter by destination',
			allEvents: 'All events',
			allDestinations: 'All destinations',
			clear: 'Clear filters',
			noResults: {
				title: 'No automations found',
				description: 'Change the filters to see other automations.'
			}
		},
		destination: {
			private: 'Private',
			group: 'Group',
			groupNamed: 'Group “{name}”'
		},
		status: {
			active: 'Active',
			paused: 'Paused'
		},
		delayMinutes: 'after {value} min',
		delayHours: 'after {value} h',
		buttonsOne: '{count} button',
		buttonsOther: '{count} buttons',
		pause: 'Pause {name}',
		activate: 'Activate {name}',
		edit: 'Edit',
		duplicate: 'Duplicate',
		delete: 'Delete',
		copyName: '{name} (copy)',
		errors: {
			toggle: 'Couldn’t change the automation status.',
			duplicate: 'Couldn’t duplicate the automation.',
			delete: 'Couldn’t delete the automation.'
		},
		deleteDialog: {
			title: 'Delete automation?',
			description: '“{name}” will be permanently removed.'
		}
	},
	selectExpert: {
		subject: 'WhatsApp automations',
		emptyDescription: 'Automations are set up per expert. Add one to get started.'
	},
	page: {
		noExpert: {
			title: 'No experts yet',
			descriptionNew: 'Add an expert before creating an automation.',
			descriptionEdit: 'Add an expert before editing an automation.',
			action: 'Add expert'
		},
		loadingEditor: 'Loading editor',
		notFound: 'Automation not found.'
	},
	preview: {
		label: 'WhatsApp message preview',
		business: 'Your business',
		online: 'online',
		bodyPlaceholder: 'Your message appears here.',
		buttonPlaceholder: 'Button text',
		replyPlaceholder: 'The automatic reply appears here.'
	},
	editor: {
		titleNew: 'New automation',
		titleEdit: 'Edit automation',
		description: 'Set up when and how the message is sent through WhatsApp.',
		destination: {
			legend: 'Where should the message be sent?',
			privateTitle: 'Private chat',
			privateDescription: 'Send a message directly to the lead who triggered the event.',
			groupTitle: 'WhatsApp group',
			groupDescription: 'Send a message to the members of a group.',
			soon: 'Coming soon',
			help: 'Sending to groups isn’t available in the current integration yet.'
		},
		legacy: {
			title: 'Read-only group automation',
			description: 'This destination belongs to an earlier version of the automation.',
			alert:
				'Sending to groups isn’t available in the current integration yet. This automation can’t be changed or saved.',
			name: 'Name',
			group: 'Group',
			event: 'Event',
			state: 'Status',
			active: 'Active',
			draft: 'Draft'
		},
		preview: 'Preview',
		previewLive: 'Live preview',
		general: {
			title: '1. General information',
			description: 'Name this automation so you can find it later.',
			name: 'Automation name',
			namePlaceholder: 'E.g., Welcome message after sign-up'
		},
		trigger: {
			title: '2. Trigger',
			description: 'Choose the event that starts this automation.',
			event: 'Event',
			launch: 'Launch',
			anyLaunch: 'Any launch',
			pixelHint: 'Custom events will appear once tracking is set up.'
		},
		recipients: {
			title: '3. Recipients',
			description: 'Define who will receive this message.',
			lead: 'Event lead',
			leadDescription: 'The message will be sent to the contact who triggered the event.',
			warning: 'The lead must have provided their WhatsApp number in the form.'
		},
		timing: {
			title: '4. Send time',
			description: 'Choose whether the message is sent right away or after a delay.',
			legend: 'Send time',
			now: 'Immediately',
			nowDescription: 'Send as soon as the event happens.',
			later: 'With a delay',
			laterDescription: 'Wait before sending.',
			time: 'Time',
			unit: 'Unit',
			minutes: 'Minutes',
			hours: 'Hours'
		},
		message: {
			title: '5. Message',
			description: 'Customize the content sent to the contact.',
			header: 'Header (optional)',
			body: 'Message body',
			footer: 'Footer (optional)',
			formatting: 'Message formatting',
			bold: 'Bold',
			italic: 'Italic',
			strike: 'Strikethrough',
			mono: 'Monospace',
			placeholder: 'Hi, {{primeiro_nome}}! Your registration is confirmed.',
			insertVariable: 'Insert variable:',
			unknownVariable: 'Unknown variable: {variables}.'
		},
		buttons: {
			title: '6. Buttons',
			description: 'Add quick replies, a link, or send without buttons.',
			type: 'Type',
			none: 'No buttons',
			quickReply: 'Quick reply',
			link: 'Link',
			button: 'Button {number}',
			moveUp: 'Move button up',
			moveDown: 'Move button down',
			remove: 'Remove button',
			label: 'Label',
			reply: 'Automatic reply',
			url: 'URL',
			addQuickReply: 'Add quick reply'
		},
		errors: {
			maxChars: 'Use {limit} characters or fewer.',
			nameRequired: 'Enter a name for the automation.',
			bodyRequired: 'Write the message to be sent.',
			delayInvalid: 'Enter a whole number greater than zero.',
			buttonLabel: 'Enter the text for every button.',
			buttonReply: 'Enter the automatic reply for every button.',
			buttonUrl: 'Enter a valid URL starting with https://.',
			save: 'Couldn’t save the draft. Please try again.'
		},
		confirmLeave: 'You have unsaved changes. Do you want to leave?',
		confirmDiscard: 'Discard the changes to this automation?',
		footer: {
			help: 'Automatic sending will be enabled once the automations backend is available.',
			saveDraft: 'Save draft',
			activate: 'Activate automation'
		}
	}
};
