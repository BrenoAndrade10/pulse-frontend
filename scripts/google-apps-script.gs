const HEADERS = ['Lead ID', 'Data e hora do cadastro', 'Nome', 'E-mail', 'WhatsApp', 'Atuação profissional', 'Outra atuação profissional', 'Principais dificuldades', 'Outra dificuldade', 'Ferramentas utilizadas', 'Outras ferramentas', 'Investimento mensal em ferramentas', 'Resposta aberta', 'Consentimento WhatsApp', 'Consentimento e-mail', 'Data e hora do consentimento', 'Versão do consentimento', 'Interesse em entrevista', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term', 'Facebook Click ID', 'Campaign ID', 'Ad Set ID', 'Ad ID', 'Status do contato', 'Data do último contato', 'Observações', 'Session ID'];

const TRACKING_HEADERS = ['Session ID', 'Visitor ID', 'Primeira atividade', 'Última atividade', 'Tempo ativo (s)', 'Tempo total (s)', 'Scroll máximo (%)', 'Viu o formulário', 'Iniciou o formulário', 'Etapa máxima', 'Último campo', 'Enviou', 'Lead ID', 'Visitante recorrente', 'Dispositivo', 'Largura da tela', 'Idioma', 'Origem (referrer)', 'Facebook Click ID', 'FBP', 'FBC', 'Último evento'];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    if (data.type === 'track') return output(saveTracking(data));
    return output(saveLead(data));
  } catch (error) {
    return output({ success: false, message: String(error.message || error) });
  }
}

function saveLead(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads');
  if (!sheet) throw new Error('A aba Leads não existe.');
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  const a = data.attribution || {};
  const now = data.submittedAt || new Date().toISOString();
  sheet.appendRow([
    data.leadId || Utilities.getUuid(), now, safe(data.name), safe(data.email), safe(data.whatsapp), safe(data.role), safe(data.otherRole), list(data.difficulties), safe(data.otherDifficulty), list(data.tools), safe(data.otherTools), safe(data.investment), safe(data.openAnswer), Boolean(data.whatsappConsent), Boolean(data.emailConsent), now, '1.0', '', safe(a.utm_source), safe(a.utm_medium), safe(a.utm_campaign), safe(a.utm_content), safe(a.utm_term), safe(a.fbclid), safe(a.campaign_id), safe(a.adset_id), safe(a.ad_id), 'Novo', '', '', safe(data.sessionId)
  ]);
  return { success: true, leadId: data.leadId };
}

function saveTracking(data) {
  const sessionId = safe(data.sessionId);
  if (!sessionId) throw new Error('sessionId ausente.');
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName('Tracking') || book.insertSheet('Tracking');
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(TRACKING_HEADERS);
      sheet.setFrozenRows(1);
    }
    const found = sheet.getRange(1, 1, sheet.getLastRow(), 1).createTextFinder(sessionId).matchEntireCell(true).findNext();
    const previous = found ? sheet.getRange(found.getRow(), 1, 1, TRACKING_HEADERS.length).getValues()[0] : null;
    const keep = function (index, value, isNumber) { return previous && isNumber ? Math.max(Number(previous[index]) || 0, Number(value) || 0) : value; };
    const flag = function (index, value) { return Boolean(value) || (previous ? previous[index] === true : false); };
    const row = [
      sessionId,
      safe(data.visitorId),
      previous ? previous[2] : data.firstSeen || new Date().toISOString(),
      data.lastSeen || new Date().toISOString(),
      keep(4, data.activeSeconds, true),
      keep(5, data.totalSeconds, true),
      keep(6, data.maxScroll, true),
      flag(7, data.formViewed),
      flag(8, data.formStarted),
      keep(9, data.maxStep, true),
      safe(data.lastField) || (previous ? previous[10] : ''),
      flag(11, data.submitted),
      safe(data.leadId) || (previous ? previous[12] : ''),
      Boolean(data.returning),
      safe(data.device),
      Number(data.width) || 0,
      safe(data.language),
      safe(data.referrer),
      safe(data.fbclid),
      safe(data.fbp),
      safe(data.fbc),
      safe(data.reason)
    ];
    if (found) sheet.getRange(found.getRow(), 1, 1, row.length).setValues([row]);
    else sheet.appendRow(row);
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

function safe(value) { const text = String(value || '').trim().slice(0, 600); return /^[=+\-@]/.test(text) ? "'" + text : text; }
function list(value) { return Array.isArray(value) ? value.map(safe).join(' | ') : safe(value); }
function output(body) { return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON); }
