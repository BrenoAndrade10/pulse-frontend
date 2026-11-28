import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { ActiveTimer, ENGAGED_THRESHOLD_MS } from '../analytics/active-time.ts';
import { deriveFbc, mergeAttribution, parseAttribution } from '../analytics/attribution.ts';
import { detectAutomated, isLocalHost, parseTestQuery } from '../analytics/flags.ts';
import {
	computeScroll,
	reachedMilestones,
	ScrollGate,
	USER_SCROLL_WINDOW_MS
} from '../analytics/scroll.ts';
import {
	claimOnce,
	createSessionRecord,
	nextSequence,
	parseSessionRecord,
	resolveSession,
	SESSION_TIMEOUT_MS
} from '../analytics/session.ts';
import { isViewed } from '../analytics/visibility.ts';

describe('ActiveTimer', () => {
	test('conta tempo ativo apenas com atividade recente', () => {
		const t = new ActiveTimer(0, true, 30000);
		assert.equal(t.activeMs(10000), 10000);
		assert.equal(t.activeMs(60000), 30000);
		assert.equal(t.totalMs(60000), 60000);
	});

	test('pausa ao ocultar e retoma ao exibir', () => {
		const t = new ActiveTimer(0, true, 30000);
		t.setVisible(false, 5000);
		assert.equal(t.activeMs(20000), 5000);
		t.setVisible(true, 20000);
		assert.equal(t.activeMs(25000), 10000);
		assert.equal(t.totalMs(25000), 25000);
	});

	test('interacao renova o timeout de inatividade', () => {
		const t = new ActiveTimer(0, true, 30000);
		t.interact(25000);
		assert.equal(t.activeMs(55000), 55000);
		assert.equal(t.activeMs(100000), 55000);
		assert.equal(t.isIdle(100000), true);
	});

	test('iniciada oculta nao acumula e registra startedHidden', () => {
		const t = new ActiveTimer(0, false, 30000);
		assert.equal(t.startedHidden, true);
		assert.equal(t.activeMs(20000), 0);
		t.setVisible(true, 20000);
		assert.equal(t.activeMs(30000), 10000);
		assert.ok(t.activeMs(30000) >= ENGAGED_THRESHOLD_MS);
	});

	test('interacao enquanto oculta e ignorada', () => {
		const t = new ActiveTimer(0, true, 30000);
		t.setVisible(false, 1000);
		t.interact(2000);
		assert.equal(t.activeMs(3000), 1000);
	});
});

describe('scroll', () => {
	test('nao reporta 100% quando o documento nao rola', () => {
		assert.deepEqual(computeScroll({ scrollTop: 0, scrollHeight: 800, clientHeight: 800 }), {
			scrollable: false,
			percent: 0
		});
		assert.equal(
			computeScroll({ scrollTop: 0, scrollHeight: 802, clientHeight: 800 }).scrollable,
			false
		);
	});

	test('calcula percentual no intervalo rolavel', () => {
		assert.equal(
			computeScroll({ scrollTop: 500, scrollHeight: 2000, clientHeight: 1000 }).percent,
			50
		);
		assert.equal(
			computeScroll({ scrollTop: 1000, scrollHeight: 2000, clientHeight: 1000 }).percent,
			100
		);
		assert.equal(
			computeScroll({ scrollTop: 5000, scrollHeight: 2000, clientHeight: 1000 }).percent,
			100
		);
		assert.equal(
			computeScroll({ scrollTop: -20, scrollHeight: 2000, clientHeight: 1000 }).percent,
			0
		);
	});

	test('marcos atingidos', () => {
		assert.deepEqual(reachedMilestones(0), []);
		assert.deepEqual(reachedMilestones(60), [25, 50]);
		assert.deepEqual(reachedMilestones(100), [25, 50, 75, 100]);
	});

	test('ScrollGate aceita apenas scroll proximo de input real e encadeado', () => {
		const g = new ScrollGate();
		assert.equal(g.accept(100), false);
		g.input(1000);
		assert.equal(g.accept(1100), true);
		assert.equal(g.accept(1300), true);
		assert.equal(g.accept(1300 + USER_SCROLL_WINDOW_MS + 5000), false);
		const h = new ScrollGate();
		h.input(0);
		assert.equal(h.accept(USER_SCROLL_WINDOW_MS - 1), true);
		assert.equal(h.accept(USER_SCROLL_WINDOW_MS + 2000), false);
	});
});

describe('session', () => {
	const ids = () => {
		let n = 0;
		return () => `sess-${++n}`;
	};

	test('cria sessao quando nao ha registro', () => {
		const r = resolveSession(null, 1000, ids());
		assert.equal(r.renewed, false);
		assert.equal(r.resumed, false);
		assert.equal(r.session.id, 'sess-1');
	});

	test('retoma dentro de 30 min e renova depois', () => {
		const stored = createSessionRecord(0, 'abc-123456');
		const ok = resolveSession(stored, SESSION_TIMEOUT_MS - 1, ids());
		assert.equal(ok.resumed, true);
		assert.equal(ok.session.id, 'abc-123456');
		const stale = resolveSession(stored, SESSION_TIMEOUT_MS + 1, ids());
		assert.equal(stale.renewed, true);
		assert.notEqual(stale.session.id, 'abc-123456');
		assert.equal(stale.session.seq, 0);
	});

	test('sequencia monotonica e flags 1x', () => {
		const s = createSessionRecord(0, 'x-1234567');
		assert.equal(nextSequence(s), 1);
		assert.equal(nextSequence(s), 2);
		assert.equal(claimOnce(s, 'sv:hero'), true);
		assert.equal(claimOnce(s, 'sv:hero'), false);
	});

	test('parse rejeita registro invalido', () => {
		assert.equal(parseSessionRecord('{"id":1}'), null);
		assert.equal(parseSessionRecord('lixo'), null);
		const s = createSessionRecord(5, 'x-1234567');
		assert.deepEqual(parseSessionRecord(JSON.stringify(s)), s);
	});
});

describe('visibilidade', () => {
	test('elemento alto: cobertura da viewport basta', () => {
		const tall = {
			intersecting: true,
			intersectionRatio: 0.12,
			intersectionHeight: 400,
			viewportHeight: 800
		};
		assert.equal(isViewed(tall), true);
		assert.equal(isViewed({ ...tall, intersectionHeight: 200 }), false);
	});

	test('elemento pequeno: 50% do elemento basta', () => {
		const small = {
			intersecting: true,
			intersectionRatio: 0.5,
			intersectionHeight: 60,
			viewportHeight: 800
		};
		assert.equal(isViewed(small), true);
		assert.equal(isViewed({ ...small, intersectionRatio: 0.4 }), false);
		assert.equal(isViewed({ ...small, intersecting: false, intersectionRatio: 1 }), false);
	});

	test('criterio customizado de preco', () => {
		const s = {
			intersecting: true,
			intersectionRatio: 0.6,
			intersectionHeight: 50,
			viewportHeight: 800
		};
		assert.equal(isViewed(s, { ratio: 0.6, coverage: 0.5 }), true);
		assert.equal(isViewed({ ...s, intersectionRatio: 0.55 }, { ratio: 0.6, coverage: 0.5 }), false);
	});
});

describe('atribuicao e flags', () => {
	test('le utms e ids da URL e ignora referrer proprio', () => {
		const a = parseAttribution(
			'?utm_source=ig&utm_medium=paid_social&campaign_id=1&adset_id=2&ad_id=3&fbclid=ABC',
			'https://l.instagram.com/x?y=1',
			'usepulselead.com'
		);
		assert.equal(a.utm_source, 'ig');
		assert.equal(a.ad_id, '3');
		assert.equal(a.referrer, 'l.instagram.com/x');
		assert.equal(
			parseAttribution('', 'https://usepulselead.com/a', 'usepulselead.com').referrer,
			''
		);
	});

	test('preserva primeira atribuicao quando a URL nao tem sinais', () => {
		const first = parseAttribution('?utm_source=ig', '', 'h');
		const later = parseAttribution('', '', 'h');
		assert.equal(mergeAttribution(first, later).utm_source, 'ig');
		const campaign = parseAttribution('?utm_source=fb', '', 'h');
		assert.equal(mergeAttribution(first, campaign).utm_source, 'fb');
	});

	test('deriva fbc do fbclid apenas quando ausente', () => {
		assert.equal(deriveFbc('', 'ABC', 123), 'fb.1.123.ABC');
		assert.equal(deriveFbc('fb.1.9.Z', 'ABC', 123), 'fb.1.9.Z');
		assert.equal(deriveFbc('', '', 123), '');
	});

	test('flags de teste e automacao', () => {
		assert.equal(parseTestQuery('?pl_test=1'), true);
		assert.equal(parseTestQuery('?pl_test=0'), false);
		assert.equal(isLocalHost('localhost'), true);
		assert.equal(isLocalHost('usepulselead.com'), false);
		assert.equal(detectAutomated({ userAgent: 'Mozilla HeadlessChrome/120' }), true);
		assert.equal(detectAutomated({ userAgent: 'facebookexternalhit/1.1' }), true);
		assert.equal(detectAutomated({ userAgent: 'x', webdriver: true }), true);
		assert.equal(
			detectAutomated({ userAgent: 'Mozilla/5.0 (iPhone) AppleWebKit [FBAN/FBIOS;FBAV/450.0]' }),
			false
		);
	});
});
