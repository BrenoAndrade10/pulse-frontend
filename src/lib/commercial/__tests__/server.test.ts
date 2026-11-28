import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
	buildCreate,
	buildUpdate,
	deriveLeadId,
	normalizeEmail,
	normalizePhone
} from '../../../../netlify/functions/c-lead.ts';
import {
	sanitizeBatch,
	sanitizeEvent,
	sanitizeSnapshot
} from '../../../../netlify/functions/c-track.ts';
import { createRateLimiter, formulaSafe, isOriginAllowed } from '../server/common.ts';

const NOW = Date.parse('2026-11-26T12:00:00.000Z');
const goodEvent = {
	eventId: 'evt-00000001',
	eventName: 'PlanInterest',
	occurredAt: '2026-11-26T11:59:00.000Z',
	sequenceNumber: 3,
	sessionId: 'sess-00000001',
	visitorId: 'vis-000000001',
	pageviewId: 'pv-0000000001',
	planId: 'starter',
	displayedPrice: 299,
	currency: 'BRL',
	attribution: { utm_source: 'ig', fbp: 'fb.1.1.2' },
	device: 'mobile',
	viewport: { w: 390, h: 800 },
	language: 'pt-BR',
	experimentVersion: 'commercial-validation-v1',
	pageVersion: 'p1',
	isTest: false,
	automated: false
};

describe('c-track', () => {
	test('aceita evento valido e normaliza', () => {
		const e = sanitizeEvent(goodEvent, NOW);
		assert.ok(e);
		assert.equal(e.eventName, 'PlanInterest');
		assert.equal(e.displayedPrice, 299);
		assert.equal(e.featureId, '');
	});

	test('rejeita nome fora da allowlist, id invalido e anula campos fora da allowlist', () => {
		assert.equal(sanitizeEvent({ ...goodEvent, eventName: 'Purchase' }, NOW), null);
		assert.equal(sanitizeEvent({ ...goodEvent, eventId: 'a b' }, NOW), null);
		assert.equal(sanitizeEvent({ ...goodEvent, sessionId: 'x' }, NOW), null);
		const e = sanitizeEvent(
			{ ...goodEvent, featureId: 'hack', sectionId: 'x', operationType: 'y' },
			NOW
		);
		assert.ok(e);
		assert.equal(e.featureId, '');
		assert.equal(e.sectionId, '');
		assert.equal(e.operationType, '');
	});

	test('limita tamanhos e corrige data fora da janela', () => {
		const e = sanitizeEvent(
			{
				...goodEvent,
				detail: 'x'.repeat(500),
				occurredAt: '2020-01-01T00:00:00Z',
				displayedPrice: -5
			},
			NOW
		);
		assert.ok(e);
		assert.equal((e.detail as string).length, 80);
		assert.equal(e.occurredAt, new Date(NOW).toISOString());
		assert.equal('displayedPrice' in e, false);
	});

	test('lote: dedupe de eventId, limite e vazio', () => {
		const r = sanitizeBatch({ events: [goodEvent, goodEvent] }, NOW);
		assert.ok(r.ok);
		assert.equal(r.value.events.length, 1);
		assert.deepEqual(sanitizeBatch({ events: [] }, NOW), { ok: false, reason: 'EMPTY_BATCH' });
		const many = Array.from({ length: 51 }, (_, i) => ({
			...goodEvent,
			eventId: `evt-${i}-00000`
		}));
		assert.deepEqual(sanitizeBatch({ events: many }, NOW), {
			ok: false,
			reason: 'TOO_MANY_EVENTS'
		});
		assert.deepEqual(sanitizeBatch('x', NOW), { ok: false, reason: 'INVALID_BODY' });
	});

	test('snapshot saneado', () => {
		const s = sanitizeSnapshot(
			{
				sessionId: 'sess-00000001',
				visitorId: 'vis-000000001',
				activeSeconds: 99999999,
				maxScroll: 400,
				featuresViewed: ['tracking', 'tracking', 'nope'],
				operationType: 'evergreen',
				signupCompleted: true
			},
			NOW
		);
		assert.ok(s);
		assert.equal(s.activeSeconds, 86400);
		assert.equal(s.maxScroll, 100);
		assert.deepEqual(s.featuresViewed, ['tracking']);
		assert.equal(sanitizeSnapshot({ sessionId: 'x' }, NOW), null);
	});

	test('origem permitida', () => {
		const env = { PUBLIC_SITE_URL: 'https://site.example.com' };
		assert.equal(isOriginAllowed('https://usepulselead.com', '', env), true);
		assert.equal(isOriginAllowed('https://site.example.com', '', env), true);
		assert.equal(isOriginAllowed('http://localhost:5173', '', env), true);
		assert.equal(isOriginAllowed('https://deploy-preview-3--pulse.netlify.app', '', env), true);
		assert.equal(isOriginAllowed('https://evil.com', '', env), false);
		assert.equal(isOriginAllowed('', 'https://usepulselead.com/x', env), true);
		assert.equal(isOriginAllowed('', '', env), false);
	});

	test('rate limit', () => {
		const allow = createRateLimiter(2, 1000);
		assert.equal(allow('a', 0), true);
		assert.equal(allow('a', 1), true);
		assert.equal(allow('a', 2), false);
		assert.equal(allow('a', 1500), true);
		assert.equal(allow('b', 2), true);
	});
});

describe('c-lead', () => {
	const key = 'k'.repeat(20);

	test('leadId deterministico por leadKey (idempotencia)', () => {
		assert.equal(deriveLeadId(key), deriveLeadId(key));
		assert.notEqual(deriveLeadId(key), deriveLeadId('j'.repeat(20)));
		const a = buildCreate({ leadKey: key, email: 'A@B.com' });
		const b = buildCreate({ leadKey: key, email: 'a@b.com' });
		assert.ok(a.kind === 'ok' && b.kind === 'ok');
		assert.equal(a.leadId, b.leadId);
		assert.equal(a.body.email, 'a@b.com');
	});

	test('honeypot nao vira lead', () => {
		const r = buildCreate({ leadKey: key, email: 'a@b.com', website: 'http://spam' });
		assert.equal(r.kind, 'ignored');
	});

	test('valida e-mail e chave', () => {
		assert.deepEqual(buildCreate({ leadKey: key, email: 'invalido' }), {
			kind: 'invalid',
			reason: 'INVALID_EMAIL'
		});
		assert.deepEqual(buildCreate({ leadKey: 'curta', email: 'a@b.com' }), {
			kind: 'invalid',
			reason: 'INVALID_LEAD_KEY'
		});
		assert.equal(normalizeEmail('  X@Y.CO '), 'x@y.co');
		assert.equal(normalizeEmail('a b@c.com'), '');
	});

	test('formula injection neutralizada', () => {
		assert.equal(formulaSafe('=1+1'), "'=1+1");
		assert.equal(formulaSafe('+55'), "'+55");
		assert.equal(formulaSafe('ok'), 'ok');
		const r = buildCreate({ leadKey: key, email: '+x@y.com', source: 'nav', planId: 'starter' });
		assert.ok(r.kind === 'ok');
		assert.equal(r.body.email, "'+x@y.com");
		const u = buildUpdate({ leadKey: key, name: '=HYPERLINK("x")' });
		assert.ok(u.kind === 'ok');
		assert.equal(u.body.name, '\'=HYPERLINK("x")');
	});

	test('normaliza telefone', () => {
		assert.equal(normalizePhone('(11) 99999-8888'), '+5511999998888');
		assert.equal(normalizePhone('+1 415 555 2671'), '+14155552671');
		assert.equal(normalizePhone('5511999998888'), '+5511999998888');
		assert.equal(normalizePhone('123'), '');
		assert.equal(buildUpdate({ leadKey: key, whatsapp: '12' }).kind, 'invalid');
	});

	test('update usa o mesmo leadId e filtra tipo de operacao', () => {
		const u = buildUpdate({
			leadKey: key,
			operationType: 'hack',
			demoInterest: true,
			whatsapp: '11999998888'
		});
		assert.ok(u.kind === 'ok');
		assert.equal(u.leadId, deriveLeadId(key));
		assert.equal(u.body.operationType, '');
		assert.equal(u.body.demoInterest, true);
		assert.equal(u.body.whatsapp, "'+5511999998888");
	});
});
