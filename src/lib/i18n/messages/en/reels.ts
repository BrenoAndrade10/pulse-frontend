import type { reels as source } from '../pt-BR/reels.js';

export const reels: typeof source = {
	auto: {
		title: 'Instagram automation',
		description: 'Manage automatic replies for your posts and Reels.',
		postsDescription: 'Send a Direct message when someone comments the keyword.',
		accountConnected: 'Account connected',
		manageConnection: 'Manage connection',
		tablist: 'Automation sections',
		tabs: { posts: 'Posts', automations: 'Automations' },
		newAutomation: 'New automation',
		searchPosts: 'Search caption or paste link',
		searchAutomations: 'Search by name or keyword',
		statusFilter: 'Status',
		status: {
			none: 'No automation',
			active: 'Active',
			paused: 'Paused',
			draft: 'Draft'
		},
		allStatuses: 'All statuses',
		table: {
			automation: 'Automation / Post',
			keyword: 'Keyword',
			status: 'Status',
			actions: 'Actions',
			count: { one: '{formatted} automation', other: '{formatted} automations' }
		},
		actions: {
			pause: 'Pause',
			resume: 'Resume',
			continue: 'Continue editing',
			edit: 'Edit',
			delete: 'Delete',
			more: 'More actions',
			openPost: 'Open on Instagram',
			selectPost: 'Select post',
			closePanel: 'Close panel'
		},
		panel: {
			title: 'Set up Direct reply',
			stepPost: '01 · Post',
			stepKeyword: '02 · Keyword',
			stepMessage: '03 · Direct message',
			example: 'Example comment: {keyword}',
			preview: 'Direct preview',
			saveDraft: 'Save draft',
			activate: 'Activate automation',
			saveChanges: 'Save changes',
			pause: 'Pause',
			extras: 'Extra options'
		},
		deleteConfirm: {
			title: 'Delete this automation?',
			description: 'The automatic reply for this post stops being sent. This cannot be undone.'
		},
		empty: {
			title: 'No automations yet',
			description: 'Choose a post and set up a Direct reply.',
			cta: 'Choose a post',
			noResultsTitle: 'No automations found',
			noResultsDescription: 'Adjust the search or the status filter.'
		}
	},
	page: {
		title: 'Posts',
		descriptionExpert: 'Photos, carousels, videos and Reels from {name}’s Instagram.',
		descriptionAll: 'Content published by the connected accounts.',
		configureInstagram: 'Set up Instagram',
		automationsError:
			'Couldn’t load the automatic DMs. Posts are shown as usual; refresh the page to set up DMs.',
		loadMore: 'Load more'
	},
	selectExpert: {
		subject: 'Instagram posts',
		emptyDescription: 'Add an expert before connecting an Instagram account.'
	},
	errors: {
		loadMore: 'Could not load more posts.',
		searchIncomplete: 'Could not search all posts. Results only show the ones already loaded.',
		notConnected: {
			title: 'Instagram not connected',
			description: 'Connect this expert’s professional account to see their posts.'
		},
		expired: {
			title: 'Connection expired',
			description: 'Reconnect this expert’s Instagram to keep importing their posts.'
		},
		invalid: {
			title: 'Instagram access denied',
			description:
				'Meta no longer accepts this account’s authorization. Reconnect the expert’s Instagram.'
		},
		unavailable: {
			title: 'Instagram didn’t respond',
			description: 'The account is still connected. Try again in a few moments.'
		},
		unexpected: {
			title: 'Couldn’t load posts',
			description: 'Try again in a few moments.'
		},
		reconnect: 'Reconnect Instagram',
		connect: 'Connect Instagram'
	},
	empty: {
		title: 'No posts yet',
		description: 'Posts from this Instagram account will appear here.',
		noResultsTitle: 'No posts found',
		noResultsDescription:
			'Try other words from the caption, paste the post link or change the filters.',
		clearFilters: 'Clear filters'
	},
	search: {
		label: 'Search posts',
		placeholder: 'Search by caption or paste the post link',
		clear: 'Clear search',
		kindFilter: 'Filter by type',
		dmFilter: 'Filter by automatic DM',
		sort: 'Sort posts'
	},
	filters: {
		kind: {
			all: 'All types',
			reel: 'Reels',
			photo: 'Photos',
			carousel: 'Carousels',
			video: 'Videos'
		},
		dm: {
			all: 'With or without DM',
			active: 'With active DM',
			paused: 'With paused DM',
			none: 'No automatic DM'
		},
		sort: {
			recent: 'Most recent',
			comments: 'Most commented',
			likes: 'Most liked'
		}
	},
	status: {
		loading: 'Loading posts',
		scanning: 'Searching all posts… {count} loaded so far.',
		found: {
			one: '{count} post found',
			other: '{count} posts found'
		},
		foundInRecent: 'in the {count} most recent',
		foundInTotal: 'out of {count}',
		searchOlder: 'Search older posts',
		chooseOne: 'Pick a post and set the keyword that triggers the automatic DM.',
		activeCount: {
			one: '{count} post with an active automatic DM.',
			other: '{count} posts with an active automatic DM.'
		}
	},
	card: {
		noCaption: 'No caption',
		dateUnavailable: 'Date unavailable',
		likesTitle: 'Likes',
		likes: { one: '{count} like', other: '{count} likes' },
		commentsTitle: 'Comments',
		comments: { one: '{count} comment', other: '{count} comments' },
		dmActive: 'DM active',
		dmPaused: 'DM paused',
		withButton: 'DM with button',
		withButtonSr: 'with button',
		repliesComment: 'Replies to the comment',
		repliesCommentSr: 'replies to the comment',
		noDm: 'No automatic DM',
		editAria: 'Edit automatic DM',
		configureAria: 'Set up automatic DM',
		edit: 'Edit',
		configure: 'Set up DM'
	},
	media: {
		kind: {
			reel: 'Reel',
			photo: 'Photo',
			carousel: 'Carousel',
			video: 'Video'
		},
		previous: 'Previous item',
		next: 'Next item',
		unavailable: 'Media unavailable right now',
		carousel: 'carousel',
		item: 'item',
		groupWithItems: '{kind} with {count} items',
		itemOf: '{index} of {total}',
		coverAlt: 'Cover: {text}',
		pause: 'Pause video',
		play: 'Play video',
		unmute: 'Turn sound on',
		mute: 'Turn sound off',
		openInstagram: 'Open on Instagram'
	},
	dialog: {
		title: 'Automatic DM',
		noCaption: 'Post without caption',
		close: 'Close',
		intro:
			'When someone comments one of the keywords on this post, they receive the message below in their Direct inbox.',
		keywords: 'Keywords',
		removeKeyword: 'Remove {keyword}',
		addAnother: 'Add another',
		keywordPlaceholder: 'E.g.: want, link, i want it',
		keywordHint:
			'Press Enter or comma to add (up to {max}). Case and accents don’t matter, and the word must appear in full in the comment.',
		keywordTooLong: 'Each keyword can have at most {max} characters.',
		keywordRequired: 'Add at least one keyword.',
		message: 'DM message',
		messagePlaceholder: 'Hi! Glad you want to know more. Here’s the link: …',
		messageHint:
			'Sent only once per comment, as a private reply. People who don’t follow the account receive it in Message Requests.',
		messageTooLongWithButton: 'With a button, the message can have up to {max} characters.',
		messageRequired: 'Write the message that will be sent in the DM.',
		withButton: 'Add a button with a link',
		withButtonHint: 'Appears right below the message and opens the link when tapped.',
		buttonLabel: 'Button text',
		buttonLabelPlaceholder: 'E.g.: View material',
		buttonLabelRequired: 'Write the button text.',
		buttonUrl: 'Link',
		buttonUrlRequired: 'Enter the link the button opens.',
		buttonUrlInvalid: 'Use a link that starts with https://.',
		preview: 'DM preview',
		previewEmpty: 'Your message appears here.',
		withCommentReply: 'Reply to the comment publicly',
		withCommentReplyHint: 'Posted on the comment after the DM is sent.',
		commentReply: 'Comment reply',
		commentReplyPlaceholder: 'E.g.: Sent you a DM! 📩',
		commentReplyHint: 'Visible to everyone. If the DM isn’t sent, the comment isn’t replied to.',
		commentReplyRequired: 'Write the comment reply or uncheck the option.',
		active: 'Automation active',
		activeHint: 'Uncheck to pause without losing the setup.',
		sent: { one: '{count} DM sent', other: '{count} DMs sent' },
		lastSent: '· last on {date}',
		delete: 'Delete',
		cancel: 'Cancel',
		save: 'Save',
		saveFailed: 'Couldn’t save. Try again.',
		deleteFailed: 'Couldn’t delete the automation. Try again.',
		apiErrors: {
			notConnected: 'Connect this expert’s Instagram before turning on the automatic DM.',
			expired:
				'The Instagram connection expired. Reconnect the account to turn on the automatic DM.',
			invalid: 'Meta denied access to this account. Reconnect the expert’s Instagram.',
			graphError:
				'Meta didn’t confirm comment tracking for this account. Try again in a few moments.',
			unavailable: 'Instagram didn’t respond. Try again in a few moments.'
		}
	}
};
