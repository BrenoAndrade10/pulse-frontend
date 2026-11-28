const HEADERS = ['Lead ID', 'Data e hora do cadastro', 'Nome', 'E-mail', 'WhatsApp', 'Atuação profissional', 'Outra atuação profissional', 'Principais dificuldades', 'Outra dificuldade', 'Ferramentas utilizadas', 'Outras ferramentas', 'Investimento mensal em ferramentas', 'Resposta aberta', 'Consentimento WhatsApp', 'Consentimento e-mail', 'Data e hora do consentimento', 'Versão do consentimento', 'Interesse em entrevista', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term', 'Facebook Click ID', 'Campaign ID', 'Ad Set ID', 'Ad ID', 'Status do contato', 'Data do último contato', 'Observações', 'Session ID'];

const TRACKING_HEADERS = ['Session ID', 'Visitor ID', 'Primeira atividade', 'Última atividade', 'Tempo ativo (s)', 'Tempo total (s)', 'Scroll máximo (%)', 'Viu o formulário', 'Iniciou o formulário', 'Etapa máxima', 'Último campo', 'Enviou', 'Lead ID', 'Visitante recorrente', 'Dispositivo', 'Largura da tela', 'Idioma', 'Origem (referrer)', 'Facebook Click ID', 'FBP', 'FBC', 'Último evento', 'Interagiu', 'Segundos até 1ª interação', 'Automatizado'];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    if (data.type === 'c_batch' || data.type === 'c_lead' || data.type === 'c_lead_update') return output(handleCommercial(data));
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
    } else if (sheet.getLastColumn() < TRACKING_HEADERS.length) {
      sheet.getRange(1, 1, 1, TRACKING_HEADERS.length).setValues([TRACKING_HEADERS]);
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
      safe(data.reason),
      flag(22, data.interacted),
      previous && previous[23] !== '' ? previous[23] : Number(data.firstInteractionSeconds) || 0,
      flag(24, data.automated)
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

var C_SESSION_COLUMNS = [
  { key: 'sessionId', header: 'Session ID', kind: 'first' },
  { key: 'visitorId', header: 'Visitor ID', kind: 'first' },
  { key: 'firstActivityAt', header: 'Primeira atividade', kind: 'first' },
  { key: 'lastActivityAt', header: 'Última atividade', kind: 'last' },
  { key: 'activeSeconds', header: 'Tempo ativo (s)', kind: 'max' },
  { key: 'totalSeconds', header: 'Tempo total (s)', kind: 'max' },
  { key: 'maxScroll', header: 'Scroll máximo (%)', kind: 'max' },
  { key: 'origin', header: 'Origem', kind: 'first' },
  { key: 'utm_source', header: 'UTM Source', kind: 'first' },
  { key: 'utm_medium', header: 'UTM Medium', kind: 'first' },
  { key: 'utm_campaign', header: 'UTM Campaign', kind: 'first' },
  { key: 'utm_content', header: 'UTM Content', kind: 'first' },
  { key: 'utm_term', header: 'UTM Term', kind: 'first' },
  { key: 'campaign_id', header: 'Campaign ID', kind: 'first' },
  { key: 'adset_id', header: 'Ad Set ID', kind: 'first' },
  { key: 'ad_id', header: 'Ad ID', kind: 'first' },
  { key: 'fbclid', header: 'Facebook Click ID', kind: 'first' },
  { key: 'referrer', header: 'Referrer', kind: 'first' },
  { key: 'device', header: 'Dispositivo', kind: 'last' },
  { key: 'featuresViewed', header: 'Funcionalidades visualizadas', kind: 'list' },
  { key: 'featuresExplored', header: 'Funcionalidades exploradas', kind: 'list' },
  { key: 'operationType', header: 'Tipo de operação selecionado', kind: 'last' },
  { key: 'demoInteractions', header: 'Interações com demos', kind: 'max' },
  { key: 'viewedPricing', header: 'Viu preço', kind: 'or' },
  { key: 'commercialInterest', header: 'Interesse comercial', kind: 'or' },
  { key: 'planId', header: 'Plano', kind: 'last' },
  { key: 'signupStarted', header: 'Cadastro iniciado', kind: 'or' },
  { key: 'signupCompleted', header: 'Cadastro concluído', kind: 'or' },
  { key: 'demoInterest', header: 'Interesse em demo', kind: 'or' },
  { key: 'isTest', header: 'Teste', kind: 'or' },
  { key: 'experimentVersion', header: 'Versão do experimento', kind: 'first' },
  { key: 'returning', header: 'Visitante recorrente', kind: 'first' },
  { key: 'automated', header: 'Possível automação', kind: 'or' },
  { key: 'fbp', header: 'FBP', kind: 'last' },
  { key: 'fbc', header: 'FBC', kind: 'last' },
  { key: 'pageVersion', header: 'Versão da LP', kind: 'first' },
  { key: 'language', header: 'Idioma', kind: 'first' },
  { key: 'viewport', header: 'Viewport', kind: 'last' },
  { key: 'scrollable', header: 'Página rolável', kind: 'or' },
  { key: 'startedHidden', header: 'Iniciou oculta', kind: 'first' },
  { key: 'demoSummary', header: 'Interações com demonstrações', kind: 'demo' },
  { key: 'scenariosExplored', header: 'Cenários explorados', kind: 'list' }
];

var C_EVENT_HEADERS = ['Event ID', 'Session ID', 'Visitor ID', 'Evento', 'Data/hora', 'Nº sequencial', 'Funcionalidade', 'Seção', 'Propriedades', 'Atribuição', 'Versão do experimento', 'Teste', 'Recebido em'];

var C_LEAD_HEADERS = ['Lead ID', 'Data e hora do cadastro', 'E-mail', 'Nome', 'WhatsApp', 'Plano', 'Preço apresentado', 'Tipo de operação', 'Interesse em demonstração', 'Consentimentos', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term', 'Campaign ID', 'Ad Set ID', 'Ad ID', 'Session ID', 'Visitor ID', 'Origem do cadastro', 'Facebook Click ID', 'Teste', 'Atualizado em'];

var C_SHEETS = { sessions: 'CommercialSessions', events: 'CommercialEvents', leads: 'CommercialLeads' };
var C_CACHE_TTL = 21600;
var C_DEDUPE_TAIL_ROWS = 600;

function setupCommercialSheets() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  cSheet(book, C_SHEETS.sessions, C_SESSION_COLUMNS.map(function (c) { return c.header; }));
  cSheet(book, C_SHEETS.events, C_EVENT_HEADERS);
  cSheet(book, C_SHEETS.leads, C_LEAD_HEADERS);
  SpreadsheetApp.flush();
}

function cSheet(book, name, headers) {
  let sheet = book.getSheetByName(name);
  if (!sheet) sheet = book.insertSheet(name);
  if (sheet.getMaxColumns() < headers.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  else if (sheet.getLastColumn() < headers.length) {
    const have = sheet.getLastColumn();
    sheet.getRange(1, have + 1, 1, headers.length - have).setValues([headers.slice(have)]);
  }
  sheet.setFrozenRows(1);
  return sheet;
}

function cAuthorized(data) {
  const expected = PropertiesService.getScriptProperties().getProperty('COMMERCIAL_SHARED_SECRET');
  const given = typeof data.secret === 'string' ? data.secret : '';
  if (!expected || expected.length < 16 || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

function cSafe(value) {
  const text = String(value === null || value === undefined ? '' : value).slice(0, 2000);
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}

function cDecode(value) {
  const text = String(value === null || value === undefined ? '' : value);
  return text.charAt(0) === "'" ? text.slice(1) : text;
}

function handleCommercial(data) {
  if (!cAuthorized(data)) return { success: false, message: 'UNAUTHORIZED' };
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    let result;
    if (data.type === 'c_batch') result = cBatch(data);
    else if (data.type === 'c_lead') result = cLead(data);
    else result = cLeadUpdate(data);
    SpreadsheetApp.flush();
    return result;
  } finally {
    lock.releaseLock();
  }
}

function cAppend(sheet, rows, width) {
  if (!rows.length) return;
  const start = sheet.getLastRow() + 1;
  const needed = start + rows.length - 1;
  if (needed > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), needed - sheet.getMaxRows() + 1000);
  sheet.getRange(start, 1, rows.length, width).setValues(rows);
}

function cBatch(data) {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const cache = CacheService.getScriptCache();
  const events = Array.isArray(data.events) ? data.events.slice(0, 50) : [];
  let accepted = 0;
  if (events.length) {
    const sheet = cSheet(book, C_SHEETS.events, C_EVENT_HEADERS);
    const keys = events.map(function (e) { return 'ev_' + e.eventId; });
    const cached = cache.getAll(keys);
    const missing = events.filter(function (e) { return !cached['ev_' + e.eventId]; });
    const known = {};
    if (missing.length && sheet.getLastRow() > 1) {
      const from = Math.max(2, sheet.getLastRow() - C_DEDUPE_TAIL_ROWS + 1);
      sheet.getRange(from, 1, sheet.getLastRow() - from + 1, 1).getValues().forEach(function (r) { known[cDecode(r[0])] = true; });
    }
    const rows = [];
    const fresh = {};
    const received = new Date().toISOString();
    events.forEach(function (e) {
      const id = String(e.eventId);
      if (cached['ev_' + id] || known[id] || fresh[id]) return;
      fresh[id] = '1';
      rows.push(cEventRow(e, received));
    });
    cAppend(sheet, rows, C_EVENT_HEADERS.length);
    const toCache = {};
    Object.keys(fresh).forEach(function (id) { toCache['ev_' + id] = '1'; });
    if (Object.keys(toCache).length) cache.putAll(toCache, C_CACHE_TTL);
    accepted = rows.length;
  }
  if (data.sessionSnapshot) cUpsertSession(book, cache, data.sessionSnapshot);
  return { success: true, accepted: accepted };
}

function cEventRow(e, received) {
  const props = {
    pageviewId: e.pageviewId, planId: e.planId, displayedPrice: e.displayedPrice, currency: e.currency,
    ctaSource: e.ctaSource, scenario: e.scenario, demoType: e.demoType, step: e.step, maxStep: e.maxStep, totalSteps: e.totalSteps, durationMs: e.durationMs, detail: e.detail, value: e.value, operationType: e.operationType,
    device: e.device, viewport: e.viewport, language: e.language, pageVersion: e.pageVersion, automated: e.automated
  };
  Object.keys(props).forEach(function (k) { if (props[k] === undefined || props[k] === '') delete props[k]; });
  return [
    cSafe(e.eventId), cSafe(e.sessionId), cSafe(e.visitorId), cSafe(e.eventName), e.occurredAt, Number(e.sequenceNumber) || 0,
    cSafe(e.featureId), cSafe(e.sectionId), cSafe(JSON.stringify(props)), cSafe(JSON.stringify(e.attribution || {})),
    cSafe(e.experimentVersion), Boolean(e.isTest), received
  ];
}

function cFindRow(sheet, cache, cachePrefix, id, column) {
  const cachedRow = Number(cache.get(cachePrefix + id));
  if (cachedRow >= 2 && cachedRow <= sheet.getLastRow() && cDecode(sheet.getRange(cachedRow, column).getValue()) === cDecode(cSafe(id))) return cachedRow;
  if (sheet.getLastRow() < 2) return 0;
  const found = sheet.getRange(2, column, sheet.getLastRow() - 1, 1).createTextFinder(cSafe(id)).matchEntireCell(true).findNext();
  if (!found) return 0;
  cache.put(cachePrefix + id, String(found.getRow()), C_CACHE_TTL);
  return found.getRow();
}

function cUpsertSession(book, cache, s) {
  const headers = C_SESSION_COLUMNS.map(function (c) { return c.header; });
  const sheet = cSheet(book, C_SHEETS.sessions, headers);
  const a = s.attribution || {};
  const incoming = {
    sessionId: s.sessionId, visitorId: s.visitorId, firstActivityAt: s.firstActivityAt, lastActivityAt: s.lastActivityAt,
    activeSeconds: Number(s.activeSeconds) || 0, totalSeconds: Number(s.totalSeconds) || 0, maxScroll: Number(s.maxScroll) || 0,
    origin: a.utm_source || a.referrer || 'direto',
    utm_source: a.utm_source, utm_medium: a.utm_medium, utm_campaign: a.utm_campaign, utm_content: a.utm_content, utm_term: a.utm_term,
    campaign_id: a.campaign_id, adset_id: a.adset_id, ad_id: a.ad_id, fbclid: a.fbclid, referrer: a.referrer,
    device: s.device,
    featuresViewed: (s.featuresViewed || []).join(', '), featuresExplored: (s.featuresExplored || []).join(', '),
    operationType: s.operationType, demoInteractions: Number(s.demoInteractions) || 0,
    viewedPricing: Boolean(s.viewedPricing), commercialInterest: Boolean(s.commercialInterest), planId: s.planId,
    signupStarted: Boolean(s.signupStarted), signupCompleted: Boolean(s.signupCompleted), demoInterest: Boolean(s.demoInterest),
    isTest: Boolean(s.isTest), experimentVersion: s.experimentVersion, returning: Boolean(s.returning), automated: Boolean(s.automated),
    fbp: a.fbp, fbc: a.fbc, pageVersion: s.pageVersion, language: s.language,
    viewport: s.viewport ? s.viewport.w + 'x' + s.viewport.h : '', scrollable: Boolean(s.scrollable), startedHidden: Boolean(s.startedHidden),
    demoSummary: cDemoSerialize(s.demoStats),
    scenariosExplored: (s.scenariosExplored || []).join(', ')
  };
  const rowNumber = cFindRow(sheet, cache, 'cs_', s.sessionId, 1);
  const previous = rowNumber ? sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0] : null;
  const row = C_SESSION_COLUMNS.map(function (col, i) {
    const next = incoming[col.key];
    const prev = previous ? previous[i] : '';
    const hasPrev = previous && prev !== '' && prev !== null;
    switch (col.kind) {
      case 'max': return Math.max(Number(prev) || 0, Number(next) || 0);
      case 'or': return prev === true || Boolean(next);
      case 'list': {
        const set = {};
        String(hasPrev ? prev : '').split(',').concat(String(next || '').split(',')).forEach(function (v) { v = v.trim(); if (v) set[v] = true; });
        return cSafe(Object.keys(set).join(', '));
      }
      case 'demo': return cSafe(cDemoMerge(hasPrev ? prev : '', next));
      case 'last': return next !== undefined && next !== '' ? (typeof next === 'string' ? cSafe(next) : next) : (hasPrev ? prev : '');
      default:
        if (hasPrev) return prev;
        return typeof next === 'string' ? cSafe(next) : (next === undefined ? '' : next);
    }
  });
  if (rowNumber) {
    sheet.getRange(rowNumber, 1, 1, headers.length).setValues([row]);
  } else {
    cAppend(sheet, [row], headers.length);
    cache.put('cs_' + s.sessionId, String(sheet.getLastRow()), C_CACHE_TTL);
  }
}

function cDemoSerialize(stats) {
  const map = {};
  (Array.isArray(stats) ? stats : []).forEach(function (d) {
    const key = d.demoType + '|' + (d.operationType || d.scenario || '-');
    const values = [d.plays, d.progress, d.maxStep, d.completed, d.replays].map(function (n) { return Number(n) || 0; });
    map[key] = map[key] ? map[key].map(function (v, i) { return i === 2 ? Math.max(v, values[i]) : v + values[i]; }) : values;
  });
  return Object.keys(map).sort().map(function (k) { return k + ':' + map[k].join(','); }).join('; ');
}

function cDemoParse(text) {
  const map = {};
  String(text || '').split(';').forEach(function (part) {
    const m = part.trim().match(/^([\w]+\|[\w-]+):(\d+),(\d+),(\d+),(\d+),(\d+)$/);
    if (m) map[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6])];
  });
  return map;
}

function cDemoMerge(previous, next) {
  const a = cDemoParse(previous);
  const b = cDemoParse(next);
  Object.keys(b).forEach(function (k) {
    a[k] = a[k] ? a[k].map(function (v, i) { return Math.max(v, b[k][i]); }) : b[k];
  });
  return Object.keys(a).sort().map(function (k) { return k + ':' + a[k].join(','); }).join('; ');
}

function cLead(data) {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const cache = CacheService.getScriptCache();
  const sheet = cSheet(book, C_SHEETS.leads, C_LEAD_HEADERS);
  const leadId = cSafe(data.leadId);
  if (!leadId) return { success: false, message: 'INVALID_LEAD' };
  if (cFindRow(sheet, cache, 'cl_', data.leadId, 1)) return { success: true, leadId: data.leadId, duplicate: false };
  const email = cSafe(data.email);
  if (sheet.getLastRow() >= 2) {
    const sameEmail = sheet.getRange(2, 3, sheet.getLastRow() - 1, 1).createTextFinder(email).matchEntireCell(true).findNext();
    if (sameEmail) return { success: true, leadId: data.leadId, duplicate: true };
  }
  const a = data.attribution || {};
  const consents = 'privacidade:' + (data.privacyVersion || '') + ' | comunicacoes:' + (data.commsConsent ? 'sim' : 'nao');
  cAppend(sheet, [[
    leadId, data.createdAt, email, '', '', cSafe(data.planId), data.displayedPrice === '' || data.displayedPrice === undefined ? '' : Number(data.displayedPrice), '', false,
    cSafe(consents), cSafe(a.utm_source), cSafe(a.utm_medium), cSafe(a.utm_campaign), cSafe(a.utm_content), cSafe(a.utm_term),
    cSafe(a.campaign_id), cSafe(a.adset_id), cSafe(a.ad_id), cSafe(data.sessionId), cSafe(data.visitorId), cSafe(data.source), cSafe(a.fbclid), Boolean(data.isTest), data.createdAt
  ]], C_LEAD_HEADERS.length);
  cache.put('cl_' + data.leadId, String(sheet.getLastRow()), C_CACHE_TTL);
  return { success: true, leadId: data.leadId, duplicate: false };
}

function cLeadUpdate(data) {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const cache = CacheService.getScriptCache();
  const sheet = cSheet(book, C_SHEETS.leads, C_LEAD_HEADERS);
  const rowNumber = cFindRow(sheet, cache, 'cl_', data.leadId, 1);
  if (!rowNumber) return { success: true, ignored: true };
  const row = sheet.getRange(rowNumber, 1, 1, C_LEAD_HEADERS.length).getValues()[0];
  if (data.name) row[3] = cSafe(data.name);
  if (data.whatsapp) row[4] = cSafe(data.whatsapp);
  if (data.operationType) row[7] = cSafe(data.operationType);
  if (data.demoInterest) row[8] = true;
  if (data.commsConsent && String(row[9]).indexOf('comunicacoes:sim') === -1) row[9] = cSafe(String(row[9]).replace('comunicacoes:nao', 'comunicacoes:sim'));
  row[23] = data.updatedAt;
  sheet.getRange(rowNumber, 1, 1, C_LEAD_HEADERS.length).setValues([row]);
  return { success: true, leadId: data.leadId };
}
