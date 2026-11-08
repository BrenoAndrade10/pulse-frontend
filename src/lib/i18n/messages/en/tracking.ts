import type { tracking as source } from '../pt-BR/tracking.js';

export const tracking: typeof source = {
	title: 'Tracking',
	description: 'Measure what visitors do on {expert}’s pages: clicks, signups and purchases.',
	descriptionAll: 'Measure what visitors do on your experts’ pages.',
	selectSubject: 'tracking',
	selectEmpty: 'Tracking is set up per expert. Add one to get started.',
	loading: 'Loading tracking',
	urlErrors: {
		empty: 'Paste the page link.',
		invalid: "That link doesn't look valid. E.g. https://mysite.com/page",
		insecure: 'Use a page with https://. The pixel only works on secure sites.',
		notPublic: 'Use the public address of the page, such as mysite.com.'
	},
	unavailable: {
		title: 'Tracking is being prepared',
		description:
			'This feature is not available on the server yet. Once it is released, you will set everything up here.'
	},
	loadError: {
		title: 'Could not load tracking',
		description: 'Please try again in a few moments.'
	},
	activate: {
		title: 'Know who clicked, signed up and purchased',
		description:
			'Activate the Pulse pixel for {expert}, install it on your pages and choose, by clicking on the page itself, which actions become events. No need to touch code for every button.',
		button: 'Activate tracking',
		hint: 'You can turn it off at any time.',
		error: 'Could not activate tracking. Please try again.',
		step: 'Step {number}:',
		highlights: {
			install: { title: 'Install the pixel', text: 'A single code, pasted once on your site.' },
			point: {
				title: 'Point to the elements',
				text: 'On the page itself, click the button or form.'
			},
			track: { title: 'Track the results', text: 'Leads, signups and purchases by campaign.' }
		}
	},
	pages: {
		title: 'Configured pages',
		description: 'Pages that already have events and the launch each page’s signups count toward.',
		empty: 'No pages configured yet. Paste a link above to get started.',
		autoLaunch: 'Current launch (automatic)',
		launchLabel: 'Launch for this page’s signups',
		events: { one: '{count} event', other: '{count} events' },
		updated: 'updated {time}',
		continue: 'Continue setup',
		saveError: 'Could not save the page’s launch. Please try again.'
	},
	setup: {
		title: 'Set up events',
		description:
			'Paste the page link. You choose on the page itself which clicks and forms become events.',
		urlLabel: 'Page link',
		urlPlaceholder: 'https://yoursite.com/sales-page',
		submit: 'Open and set up',
		newDomain: '· will be authorized to send events to this pixel',
		notInstalled:
			'The pixel has not sent any events yet. Install the code below on that page first: without it, the editor does not appear.',
		success:
			'We opened the page in a new tab. Set up the events there: they show up here as soon as they are saved.',
		popupBlocked: 'The browser blocked the new tab. Allow pop-ups for Pulse and try again.',
		openError: 'Could not open the setup. Please try again.',
		step: 'Step {number}:',
		steps: {
			open: { title: 'Open the page', text: 'It opens in a new tab, with the Pulse editor.' },
			click: { title: 'Click the element', text: 'A button, link or form on the page.' },
			event: { title: 'Choose the event', text: 'Lead, purchase, signup or a name of your own.' }
		}
	},
	install: {
		title: 'Pixel installation',
		description: 'Install it once on all the pages you want to measure.',
		installed: 'Installed',
		waiting: 'Waiting for first event',
		lastEvent: 'Last event {time}',
		copyAria: 'Copy pixel code',
		copy: 'Copy',
		copied: 'Copied',
		copiedAnnounce: 'Code copied',
		guides: {
			html: {
				label: 'HTML',
				steps: {
					one: 'Open the page HTML (or the template used by all pages).',
					two: 'Paste the code right before </head>.',
					three: 'Publish and open the page once so the pixel sends its first event.'
				}
			},
			wordpress: {
				label: 'WordPress',
				steps: {
					one: 'Install a code plugin, such as WPCode, or use your theme’s scripts field.',
					two: 'Add the code to the header of all pages.',
					three: 'Save, clear the site cache and open the page once.'
				}
			},
			gtm: {
				label: 'Google Tag Manager',
				steps: {
					one: 'Create a Custom HTML tag and paste the code.',
					two: 'Use the All Pages trigger.',
					three: 'Publish the container and open the page once.'
				}
			}
		}
	}
};
