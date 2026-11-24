const HEADERS = ['Lead ID', 'Data e hora do cadastro', 'Nome', 'E-mail', 'WhatsApp', 'Atuação profissional', 'Outra atuação profissional', 'Principais dificuldades', 'Outra dificuldade', 'Ferramentas utilizadas', 'Outras ferramentas', 'Investimento mensal em ferramentas', 'Resposta aberta', 'Consentimento WhatsApp', 'Consentimento e-mail', 'Data e hora do consentimento', 'Versão do consentimento', 'Interesse em entrevista', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term', 'Facebook Click ID', 'Campaign ID', 'Ad Set ID', 'Ad ID', 'Status do contato', 'Data do último contato', 'Observações'];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads');
    if (!sheet) throw new Error('A aba Leads não existe.');
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    const a = data.attribution || {};
    const now = data.submittedAt || new Date().toISOString();
    sheet.appendRow([
      data.leadId || Utilities.getUuid(), now, safe(data.name), safe(data.email), safe(data.whatsapp), safe(data.role), safe(data.otherRole), list(data.difficulties), safe(data.otherDifficulty), list(data.tools), safe(data.otherTools), safe(data.investment), safe(data.openAnswer), Boolean(data.whatsappConsent), Boolean(data.emailConsent), now, '1.0', '', safe(a.utm_source), safe(a.utm_medium), safe(a.utm_campaign), safe(a.utm_content), safe(a.utm_term), safe(a.fbclid), safe(a.campaign_id), safe(a.adset_id), safe(a.ad_id), 'Novo', '', ''
    ]);
    return output({ success: true, leadId: data.leadId });
  } catch (error) {
    return output({ success: false, message: String(error.message || error) });
  }
}
function safe(value) { const text = String(value || '').trim().slice(0, 600); return /^[=+\-@]/.test(text) ? "'" + text : text; }
function list(value) { return Array.isArray(value) ? value.map(safe).join(' | ') : safe(value); }
function output(body) { return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON); }
