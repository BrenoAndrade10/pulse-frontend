const AUTOMATED_UA =
	/HeadlessChrome|PhantomJS|Lighthouse|Chrome-Lighthouse|PTST|Playwright|Puppeteer|Selenium|facebookexternalhit|facebookcatalog|Facebot|meta-externalagent|meta-externalfetcher|meta-webindexer|Googlebot|AdsBot|Google-InspectionTool|bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Applebot|Bytespider|AhrefsBot|SemrushBot|Twitterbot|LinkedInBot|WhatsApp\/|TelegramBot|Slackbot|Discordbot|crawler|spider|bot\//i;

export const isAutomatedUserAgent = (ua: string): boolean => AUTOMATED_UA.test(ua);

export const detectAutomated = (nav: { userAgent?: string; webdriver?: boolean }): boolean =>
	nav.webdriver === true || isAutomatedUserAgent(nav.userAgent ?? '');

export const isLocalHost = (hostname: string): boolean =>
	hostname === 'localhost' ||
	hostname === '127.0.0.1' ||
	hostname === '[::1]' ||
	hostname === '::1' ||
	hostname.endsWith('.localhost');

export const TEST_STORE_KEY = 'pl_c_test';

export const parseTestQuery = (search: string): boolean =>
	new URLSearchParams(search).get('pl_test') === '1';
