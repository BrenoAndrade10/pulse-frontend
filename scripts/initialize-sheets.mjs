import { google } from 'googleapis';

const required = [
	'GOOGLE_SHEETS_SPREADSHEET_ID',
	'GOOGLE_SERVICE_ACCOUNT_EMAIL',
	'GOOGLE_PRIVATE_KEY'
];
for (const key of required) if (!process.env[key]) throw new Error(`Missing ${key}`);
const auth = new google.auth.GoogleAuth({
	credentials: {
		client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
		private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
	},
	scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const sheets = google.sheets({ version: 'v4', auth });
const tab = process.env.GOOGLE_SHEETS_TAB_NAME || 'Leads';
const headers = [
	'Lead ID',
	'Data e hora do cadastro',
	'Nome',
	'E-mail',
	'WhatsApp',
	'Atuação profissional',
	'Outra atuação profissional',
	'Principais dificuldades',
	'Outra dificuldade',
	'Ferramentas utilizadas',
	'Outras ferramentas',
	'Investimento mensal em ferramentas',
	'Resposta aberta',
	'Consentimento WhatsApp',
	'Consentimento e-mail',
	'Data e hora do consentimento',
	'Versão do consentimento',
	'Interesse em entrevista',
	'UTM Source',
	'UTM Medium',
	'UTM Campaign',
	'UTM Content',
	'UTM Term',
	'Facebook Click ID',
	'Campaign ID',
	'Ad Set ID',
	'Ad ID',
	'Status do contato',
	'Data do último contato',
	'Observações'
];
await sheets.spreadsheets.values.update({
	spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
	range: `${tab}!A1:AD1`,
	valueInputOption: 'RAW',
	requestBody: { values: [headers] }
});
console.log(`Headers initialized in ${tab}`);
