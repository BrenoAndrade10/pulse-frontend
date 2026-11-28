import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = readFileSync(
	fileURLToPath(new URL('./google-apps-script.gs', import.meta.url)),
	'utf8'
);
const { sessions, events, leads } = new Function(
	`${source}; return { sessions: C_SESSION_COLUMNS.map(function (c) { return c.header; }), events: C_EVENT_HEADERS, leads: C_LEAD_HEADERS };`
)();

const only = process.argv[2];
const tabs = { CommercialSessions: sessions, CommercialEvents: events, CommercialLeads: leads };
for (const [name, headers] of Object.entries(tabs)) {
	if (only && only !== name) continue;
	console.log(`# ${name} (${headers.length} colunas)`);
	console.log(headers.join('\t'));
}
