import type { integrations as source } from '../pt-BR/integrations.js';

export const integrations: typeof source = {
	pageTitle: 'Integrations',
	description: 'Connect the channels and platforms used in your operation.',
	states: {
		notConnected: 'Not connected',
		connected: 'Connected',
		pendingSetup: 'Setup pending',
		attention: 'Attention',
		comingSoon: 'Coming soon'
	},
	upcoming: {
		title: 'Coming soon',
		count: { one: '{count} planned integration', other: '{count} planned integrations' },
		expertScope: 'Connected per expert',
		tenantScope: 'Connected by the company',
		tenantHint:
			'A company connection will be able to serve products and sales from several experts.'
	},
	status: {
		connected: 'Connected',
		expired: 'Connection expired',
		disconnected: 'Not connected'
	},
	badges: {
		soon: 'Coming soon'
	},
	actions: {
		connect: 'Connect',
		manage: 'Manage',
		reconnect: 'Reconnect',
		disconnect: 'Disconnect'
	},
	catalog: {
		hotmart: 'Sync sales, products and commissions.',
		telegram: 'Integrate channels, communities and automations.',
		kiwify: 'Import sales, products and metrics.'
	},
	meta: {
		instagram: {
			description: 'Posts, Reels and comments from the professional account.',
			asset: 'Instagram professional account',
			authorization: 'Meta unified login',
			connect: 'Connect with Facebook'
		},
		metaAds: {
			description: 'Campaigns, spend and results from Ads Manager.',
			asset: 'Meta ad account and Pixel',
			authorization: 'Facebook Login for Business',
			connect: 'Connect with Facebook'
		},
		whatsapp: {
			description: 'Conversations and support through the WhatsApp Cloud API.',
			asset: 'WhatsApp Business account (WABA) and phone number',
			authorization: 'Embedded Signup with Facebook',
			connect: 'Connect with Facebook'
		}
	},
	instagram: {
		selectedDescription: 'Instagram account of the selected expert.',
		expiredHint: 'Connection expired',
		sectionTitle: 'Instagram accounts',
		sectionDescription: 'Professional connections linked to experts.',
		emptyTitle: 'No experts to connect',
		emptyDescription:
			'Each Instagram account is linked to an expert. Add an expert to get started.',
		noAccount: 'No account authorized',
		saveFirst: 'Save the expert to connect the account.',
		waitingAuthorization: 'Complete the authorization in the Meta window.',
		connectedAt: 'Connected on {date}',
		connected: 'Professional account connected to this expert.',
		expired: 'The authorization has expired. Reconnect to resume syncing.',
		authorize: 'Authorize access to the Instagram professional account.',
		connectedSuccess: 'Instagram account connected.',
		connectFailed: 'Could not connect the account. Please try again.',
		disconnectFailed: 'Could not disconnect the account. Please try again.',
		reconnect: 'Reconnect Instagram',
		popupBlocked: 'Could not open Meta. Allow pop-ups for this site and try again.',
		missingAuthorizationUrl: 'The backend did not return the Instagram authorization URL.',
		oauthErrors: {
			denied: 'The authorization was canceled on Meta.',
			invalidState: 'The authorization expired. Click connect and try again.',
			expertNotFound: 'This expert was not found. Refresh the page and try again.',
			exchangeFailed:
				'Meta declined the connection. Check the account configuration and try again.',
			missingPermissions:
				'Meta did not grant every required permission. Authorize again or contact support.',
			noInstagramAccount: 'No Instagram professional account linked to a Page was authorized.',
			multipleInstagramAccounts: 'Select only one Instagram professional account for this expert.',
			accountAlreadyConnected: 'This Instagram account is already connected to another expert.',
			generic: 'Could not connect the Instagram account. Please try again.'
		}
	},
	whatsapp: {
		overviewDescription: 'Connected number of each expert for messages and automations.',
		noNumber: 'No number connected',
		checkFailed: 'Could not check the connection',
		accountsLoadingAria: 'Loading WhatsApp connections',
		unavailable: 'WhatsApp is not configured in this installation yet',
		sectionTitle: 'WhatsApp Business',
		sectionDescription: 'Connection of the selected expert for messages and automations.',
		emptyTitle: 'No experts to connect',
		emptyDescription: 'Add an expert before connecting a WhatsApp Business number.',
		loadingAria: 'Loading WhatsApp connection',
		loadError: "Could not check this expert's connection.",
		badgeError: 'Error',
		connectedAt: 'Connected on {date}',
		authorize: "Authorize this expert's WhatsApp Business account and number.",
		connectedSuccess: 'WhatsApp connected successfully.',
		cancelled: 'The WhatsApp connection was canceled.',
		disconnected: 'WhatsApp disconnected.',
		connect: 'Connect WhatsApp',
		notConfigured: 'WhatsApp is not yet configured for this installation',
		verifiedName: 'Verified name:',
		quality: 'Quality',
		qualityLevels: {
			high: 'High',
			medium: 'Medium',
			low: 'Low',
			unknown: 'Not available'
		},
		disconnectTitle: 'Disconnect WhatsApp?',
		disconnectWarning:
			"This expert's WhatsApp automations will stop until a number is connected again.",
		errors: {
			notConfigured: 'WhatsApp has not been configured for this installation yet.',
			notAuthorized: 'This WhatsApp account is not authorized for this installation.',
			numberAlreadyConnected: 'This WhatsApp number is already connected to another expert.',
			network: 'Could not reach the server. Check your connection and try again.',
			generic: 'Could not complete the operation with WhatsApp. Please try again.'
		}
	},
	signup: {
		sdkUnavailable: 'The Meta SDK is not available.',
		sdkTimeout: 'Meta took too long to load. Please try again.',
		sdkLoadFailed: 'Could not load Meta.',
		metaFailed: 'Meta was unable to complete the connection.',
		invalidData: 'Meta returned invalid data for the connection.',
		timeout: 'The connection with Meta timed out. Please try again.',
		openFailed: 'Could not open the connection with Meta.'
	}
};
