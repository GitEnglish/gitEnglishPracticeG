import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import {
	clearTelemetryQueues,
	enqueueTelemetry,
	flushTelemetry,
	normalizeTelemetryEvent,
	telemetryCounters
} from './telemetry.ts';

process.env.HUB_INGEST_URL = 'https://hub.test/api/internal/satellite-telemetry/ingest';
process.env.HUB_INGEST_SECRET = 'ingest-secret';

const realFetch = globalThis.fetch;

interface Captured {
	body: { studentId: number; events: Array<Record<string, unknown>> };
}

function stubFetch(
	respond: () => Response | Promise<Response>
): { calls: Captured[] } {
	const calls: Captured[] = [];
	globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
		calls.push({ body: JSON.parse(String(init?.body)) as Captured['body'] });
		return respond();
	}) as unknown as typeof fetch;
	return { calls };
}

beforeEach(() => {
	clearTelemetryQueues();
});

afterEach(() => {
	globalThis.fetch = realFetch;
	clearTelemetryQueues();
});

function event(overrides: Record<string, unknown> = {}) {
	return normalizeTelemetryEvent(
		{ eventType: 'exercise_completed', lexicalToken: 'resilient', ...overrides },
		'sid-from-server'
	)!;
}

describe('normalizeTelemetryEvent', () => {
	it('attaches moduleId and sessionId server-side and ignores client claims', () => {
		const normalized = normalizeTelemetryEvent(
			{
				eventType: 'attempt',
				moduleId: 'someone-else',
				sessionId: 'forged',
				accessCode: 'ABC-123',
				name: 'Student',
				attempts: 2
			},
			'sid-from-server'
		);
		expect(normalized?.moduleId).toBe('practice-g');
		expect(normalized?.sessionId).toBe('sid-from-server');
		expect(normalized?.attempts).toBe(2);
		expect(JSON.stringify(normalized)).not.toContain('ABC-123');
		expect(JSON.stringify(normalized)).not.toContain('Student');
	});

	it('drops events without a type and truncates long tokens', () => {
		expect(normalizeTelemetryEvent({ metadata: {} }, 'sid')).toBeNull();
		const long = 'x'.repeat(500);
		expect(normalizeTelemetryEvent({ eventType: 'attempt', lexicalToken: long }, 'sid')?.lexicalToken?.length).toBe(200);
	});
});

describe('flushTelemetry', () => {
	it('splits one student queue into batches of at most 200', async () => {
		const { calls } = stubFetch(() => new Response('{}', { status: 200 }));
		enqueueTelemetry(4, Array.from({ length: 250 }, () => event()));
		await flushTelemetry();

		expect(calls.length).toBe(2);
		expect(calls[0].body.studentId).toBe(4);
		expect(calls[0].body.events.length).toBe(200);
		expect(calls[1].body.events.length).toBe(50);
		expect(telemetryCounters.forwarded).toBe(250);
	});

	it('retries once when no response is received, then counts the failure', async () => {
		let attempts = 0;
		globalThis.fetch = (async () => {
			attempts += 1;
			throw new TypeError('network down');
		}) as unknown as typeof fetch;

		enqueueTelemetry(7, [event()]);
		await flushTelemetry();

		expect(attempts).toBe(2);
		expect(telemetryCounters.failed).toBe(1);
		expect(telemetryCounters.forwarded).toBe(0);
	});

	it('does not retry an HTTP error response', async () => {
		const { calls } = stubFetch(() => new Response('rate limited', { status: 429 }));
		enqueueTelemetry(7, [event()]);
		await flushTelemetry();

		expect(calls.length).toBe(1);
		expect(telemetryCounters.failed).toBe(1);
	});

	it('keeps students in separate requests', async () => {
		const { calls } = stubFetch(() => new Response('{}', { status: 200 }));
		enqueueTelemetry(4, [event()]);
		enqueueTelemetry(9, [event()]);
		await flushTelemetry();

		expect(calls.map((call) => call.body.studentId).sort()).toEqual([4, 9]);
		expect(telemetryCounters.forwarded).toBe(2);
	});

	it('does nothing when ingest is not configured', async () => {
		const { calls } = stubFetch(() => new Response('{}', { status: 200 }));
		delete process.env.HUB_INGEST_URL;
		enqueueTelemetry(4, [event()]);
		await flushTelemetry();
		expect(calls.length).toBe(0);
		process.env.HUB_INGEST_URL = 'https://hub.test/api/internal/satellite-telemetry/ingest';
	});
});
