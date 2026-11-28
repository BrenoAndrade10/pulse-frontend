import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
	sanitizeBatch,
	sanitizeEvent,
	sanitizeSnapshot
} from '../../../../netlify/functions/c-track.ts';
import { CtaThrottle, DemoGate, normalizeDemoProps } from '../analytics/demo-gate.ts';

const base = { demoType: 'strategy_simulation', operationType: 'paid_launch' } as const;

describe('DemoGate', () => {
	test('progress so quando maxStep aumenta e 1 por step na execucao', () => {
		const g = new DemoGate();
		assert.equal(g.allow('DemoPlay', { ...base, totalSteps: 4 }, 0), true);
		assert.equal(g.allow('DemoProgress', { ...base, step: 1, maxStep: 1 }, 1000), true);
		assert.equal(g.allow('DemoProgress', { ...base, step: 1, maxStep: 1 }, 1001), false);
		assert.equal(g.allow('DemoProgress', { ...base, step: 2, maxStep: 2 }, 1002), true);
		assert.equal(g.allow('DemoProgress', { ...base, step: 1, maxStep: 2 }, 1003), false);
	});

	test('completed 1x por execucao; replay abre nova execucao', () => {
		const g = new DemoGate();
		g.allow('DemoPlay', base, 0);
		assert.equal(g.allow('DemoCompleted', base, 10), true);
		assert.equal(g.allow('DemoCompleted', base, 11), false);
		assert.equal(g.allow('DemoReplay', base, 5000), true);
		assert.equal(g.allow('DemoProgress', { ...base, step: 1, maxStep: 1 }, 5001), true);
		assert.equal(g.allow('DemoCompleted', base, 5002), true);
		assert.equal(g.allow('DemoCompleted', base, 5003), false);
	});

	test('play duplicado por reatividade e barrado; runId explicito deduplica', () => {
		const g = new DemoGate();
		assert.equal(g.allow('DemoPlay', base, 0), true);
		assert.equal(g.allow('DemoPlay', base, 100), false);
		assert.equal(g.allow('DemoPlay', base, 2000), true);
		assert.equal(g.allow('DemoPlay', { ...base, value: 'r1' }, 9000), true);
		assert.equal(g.allow('DemoPlay', { ...base, value: 'r1' }, 20000), false);
		assert.equal(g.allow('DemoPlay', { ...base, value: 'r2' }, 30000), true);
	});

	test('chaves independentes por demoType e operationType; exige demoType', () => {
		const g = new DemoGate();
		g.allow('DemoPlay', base, 0);
		g.allow('DemoPlay', { demoType: 'heat_evolution', operationType: 'evergreen' }, 0);
		assert.equal(g.allow('DemoCompleted', base, 1), true);
		assert.equal(
			g.allow('DemoCompleted', { demoType: 'heat_evolution', operationType: 'evergreen' }, 1),
			true
		);
		assert.equal(g.allow('DemoPlay', {}, 5000), false);
		assert.equal(g.allow('PageView', {}, 0), true);
	});

	test('limites de props', () => {
		const p = normalizeDemoProps({
			...base,
			step: 99,
			maxStep: -3,
			totalSteps: 7.6,
			durationMs: 9e9
		});
		assert.equal(p.step, 50);
		assert.equal(p.maxStep, 0);
		assert.equal(p.totalSteps, 8);
		assert.equal(p.durationMs, 1800000);
		assert.equal('step' in normalizeDemoProps({ ...base, step: Number.NaN }), false);
	});
});

describe('c-track demos', () => {
	const ev = {
		eventId: 'evt-00000009',
		eventName: 'DemoCompleted',
		occurredAt: '2026-11-26T11:59:00.000Z',
		sessionId: 'sess-00000001',
		visitorId: 'vis-000000001',
		demoType: 'strategy_simulation',
		operationType: 'evergreen',
		step: 99,
		maxStep: 3,
		totalSteps: 4,
		durationMs: 99999999
	};
	const NOW = Date.parse('2026-11-26T12:00:00.000Z');

	test('aceita novos eventos e limita numericos', () => {
		const e = sanitizeEvent(ev, NOW);
		assert.ok(e);
		assert.equal(e.eventName, 'DemoCompleted');
		assert.equal(e.demoType, 'strategy_simulation');
		assert.equal(e.step, 50);
		assert.equal(e.durationMs, 1800000);
		assert.equal(sanitizeEvent({ ...ev, eventName: 'DemoReplay' }, NOW)?.eventName, 'DemoReplay');
	});

	test('demoType fora da allowlist vira vazio', () => {
		assert.equal(sanitizeEvent({ ...ev, demoType: 'x' }, NOW)?.demoType, '');
		assert.ok(sanitizeBatch({ events: [ev] }, NOW).ok);
	});

	test('snapshot saneia demoStats', () => {
		const s = sanitizeSnapshot(
			{
				sessionId: 'sess-00000001',
				visitorId: 'vis-000000001',
				demoStats: [
					{ demoType: 'heat_evolution', operationType: 'evergreen', plays: 2, maxStep: 400 },
					{ demoType: 'nope', plays: 1 },
					'lixo'
				]
			},
			NOW
		);
		assert.ok(s);
		assert.equal(s.demoStats.length, 1);
		assert.equal(s.demoStats[0].maxStep, 50);
		assert.equal(s.demoStats[0].plays, 2);
	});
});

describe('scenario', () => {
	const NOW = Date.parse('2026-11-26T12:00:00.000Z');
	const ev = {
		eventId: 'evt-00000010',
		eventName: 'FeatureExplore',
		sessionId: 'sess-00000001',
		visitorId: 'vis-000000001',
		scenario: 'intermediate_cta',
		demoType: 'dispatch_agenda'
	};

	test('c-track valida scenario e novos demoType', () => {
		const e = sanitizeEvent(ev, NOW);
		assert.ok(e);
		assert.equal(e.scenario, 'intermediate_cta');
		assert.equal(e.demoType, 'dispatch_agenda');
		assert.equal(sanitizeEvent({ ...ev, scenario: 'x' }, NOW)?.scenario, '');
		assert.equal(
			sanitizeEvent({ ...ev, demoType: 'message_personalization' }, NOW)?.demoType,
			'message_personalization'
		);
		assert.equal(
			sanitizeEvent({ ...ev, demoType: 'problem_comparison' }, NOW)?.demoType,
			'problem_comparison'
		);
	});

	test('snapshot saneia scenariosExplored e scenario em demoStats', () => {
		const s = sanitizeSnapshot(
			{
				sessionId: 'sess-00000001',
				visitorId: 'vis-000000001',
				scenariosExplored: ['pulse_heat', 'pulse_heat', 'nope'],
				demoStats: [{ demoType: 'problem_comparison', scenario: 'problem_comparison', plays: 1 }]
			},
			NOW
		);
		assert.ok(s);
		assert.deepEqual(s.scenariosExplored, ['pulse_heat']);
		assert.equal(s.demoStats[0].scenario, 'problem_comparison');
	});

	test('gate usa scenario na chave quando operationType falta', () => {
		const g = new DemoGate();
		const a = { demoType: 'heat_evolution', scenario: 'pulse_heat' } as const;
		const b = { demoType: 'heat_evolution', scenario: 'lead_journey' } as const;
		assert.equal(g.allow('DemoPlay', a, 0), true);
		assert.equal(g.allow('DemoPlay', b, 0), true);
		assert.equal(g.allow('DemoProgress', { ...a, step: 1, maxStep: 1 }, 1), true);
		assert.equal(g.allow('DemoProgress', { ...a, step: 1, maxStep: 1 }, 2), false);
		assert.equal(g.allow('DemoProgress', { ...b, step: 1, maxStep: 1 }, 3), true);
		assert.equal(g.allow('DemoCompleted', a, 4), true);
		assert.equal(g.allow('DemoCompleted', a, 5), false);
		assert.equal(g.allow('DemoCompleted', b, 6), true);
	});

	test('CTA intermediario: 1x por 2 s por ctaSource', () => {
		const t = new CtaThrottle();
		const p = { scenario: 'intermediate_cta', ctaSource: 'mid_1' } as const;
		assert.equal(t.allow('FeatureExplore', p, 0), true);
		assert.equal(t.allow('FeatureExplore', p, 1500), false);
		assert.equal(t.allow('FeatureExplore', { ...p, ctaSource: 'mid_2' }, 1500), true);
		assert.equal(t.allow('FeatureExplore', p, 2001), true);
		assert.equal(t.allow('FeatureExplore', { scenario: 'pulse_heat' }, 2002), true);
		assert.equal(t.allow('FeatureExplore', { scenario: 'pulse_heat' }, 2003), true);
		assert.equal(t.allow('PlanInterest', p, 2004), true);
	});
});
