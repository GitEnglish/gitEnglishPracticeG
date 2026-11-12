import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { createHmac } from 'node:crypto';
import { handleRequest } from './handler.ts';
import { clearSessions, createSession, getSession, readSessionId } from './sessions.ts';
import { clearTelemetryQueues, flushTelemetry, telemetryCounters } from './telemetry.ts';

process.env.GENIE_JWT_SECRET = 'test-secret';
process.env.HUB_INGEST_URL = 'https://hub.test/api/internal/satellite-telemetry/ingest';
process.env.HUB_INGEST_SECRET = 'ingest-secret';
delete process.env.GENIE_REQUIRE_TOKEN;

const realFetch = globalThis.fetch;

interface CapturedCall {
	method: string;
	url: string;
	body?: Record<string, unknown>;
}

function stubHub(
	respond: (call: CapturedCall) => Response | Promise<Response>
): { calls: CapturedCall[] } {
	const calls: CapturedCall[] = [];
	globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
		const call: CapturedCall = {
			method: init?.method || 'GET',
			url: String(input),
			body: init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : undefined
		};
		calls.push(call);
		return respond(call);
	}) as unknown as typeof fetch;
	return { calls };
}

function mint(overrides: Record<string, unknown> = {}, secret = 'test-secret'): string {
	const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
	const payload = Buffer.from(
		JSON.stringify({
			sub: 4,
			aud: 'practice-genie',
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 300,
			jti: 'test-jti',
			...overrides
		})
	).toString('base64url');
	const signature = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
	return `${header}.${payload}.${signature}`;
}

function document(path: string): Request {
	return new Request(`https://module.test${path}`);
}

function withCookie(path: string, cookie: string): Request {
	return new Request(`https://module.test${path}`, { headers: { cookie } });
}

function sessionCookie(response: Response): string {
	const setCookie = response.headers.get('set-cookie') || '';
	const match = /genie_sid=([^;]+)/.exec(setCookie);
	return match ? `genie_sid=${match[1]}` : '';
}

const hubTargets = {
	studentId: 4,
	studentName: 'Ana',
	slug: 'ana',
	sessionId: 'lac-1',
	theme: 'Work',
	focusVocabulary: ['deadline', 'stakeholder'],
	focusGrammar: ['conditionals'],
	inclusionRate: 75,
	grammarInclusionRate: 60
};

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
	clearSessions();
	clearTelemetryQueues();
	stubHub(() => new Response('unauthorized', { status: 401 }));
});

afterEach(() => {
	globalThis.fetch = realFetch;
	delete process.env.GENIE_REQUIRE_TOKEN;
});

describe('ops endpoints', () => {
	it('reports health with a sha', async () => {
		const response = await handleRequest(document('/healthz'));
		expect(response.status).toBe(200);
		const body = (await response.json()) as { status: string; sha: string };
		expect(body.status).toBe('ok');
		expect(body.sha.length).toBeGreaterThan(0);
	});

	it('reports version and secret state without exposing the secret', async () => {
		const response = await handleRequest(document('/version'));
		const body = (await response.json()) as Record<string, unknown>;
		expect(body.secret_configured).toBe(true);
		expect(JSON.stringify(body)).not.toContain('test-secret');
	});
});

describe('entry gate', () => {
	it('serves anonymous sessions without a cookie', async () => {
		process.env.GENIE_REQUIRE_TOKEN = 'false';
		const response = await handleRequest(document('/api/session'));
		expect(response.status).toBe(401);
		const entry = await handleRequest(document('/?t=garbage'));
		expect(entry.status).toBe(302);
		expect(entry.headers.get('set-cookie')).toBeNull();
	});

	it('creates a session from a valid token and strips the token from the URL', async () => {
		stubHub(() => Response.json(hubTargets));
		const entry = await handleRequest(document(`/?t=${mint()}&theme=Jazz`));
		expect(entry.status).toBe(302);
		expect(entry.headers.get('location')).toBe('/?theme=Jazz');
		expect(sessionCookie(entry)).not.toBe('');

		await tick();
		const response = await handleRequest(withCookie('/api/session', sessionCookie(entry)));
		expect(response.status).toBe(200);
		const body = (await response.json()) as Record<string, unknown>;
		expect(body.focusVocabulary).toEqual(['deadline', 'stakeholder']);
		expect(body.studentId).toBeUndefined();
		expect(body.studentName).toBeUndefined();
	});

	it('falls back to anonymous for tampered and unsigned tokens', async () => {
		const tampered = await handleRequest(document(`/?t=${mint({}, 'wrong-secret')}`));
		expect(tampered.status).toBe(302);
		expect(tampered.headers.get('set-cookie')).toBeNull();
		expect(tampered.headers.get('location')).toBe('/');

		const unsigned = await handleRequest(document('/?t=abc.def.ghi'));
		expect(unsigned.status).toBe(302);
		expect(unsigned.headers.get('set-cookie')).toBeNull();
	});

	it('denies anonymous documents only when the switch is on', async () => {
		process.env.GENIE_REQUIRE_TOKEN = 'true';
		const denied = await handleRequest(document('/'));
		expect(denied.status).toBe(403);
		expect(await denied.text()).toContain('gitEnglish student app');
	});
});

describe('/api/session', () => {
	it('returns 204 and caches nothing when the hub fetch fails', async () => {
		stubHub(() => new Response('nope', { status: 401 }));
		const entry = await handleRequest(document(`/?t=${mint()}`));
		await tick();

		const response = await handleRequest(withCookie('/api/session', sessionCookie(entry)));
		expect(response.status).toBe(204);

		const session = getSession(readSessionId(sessionCookie(entry)));
		expect(session).not.toBeNull();
		expect(session?.targets).toBeNull();
	});

	it('serves cached successes even after the hub goes away', async () => {
		const hub = stubHub(() => Response.json(hubTargets));
		const entry = await handleRequest(document(`/?t=${mint()}`));
		await tick();
		expect((await handleRequest(withCookie('/api/session', sessionCookie(entry)))).status).toBe(200);

		hub.calls.length = 0;
		globalThis.fetch = (async () => {
			throw new TypeError('hub down');
		}) as unknown as typeof fetch;

		expect((await handleRequest(withCookie('/api/session', sessionCookie(entry)))).status).toBe(200);
	});

	it('never returns 200 with empty target arrays', async () => {
		stubHub(() =>
			Response.json({ ...hubTargets, focusVocabulary: [], focusGrammar: [] })
		);
		const entry = await handleRequest(document(`/?t=${mint()}`));
		await tick();
		const response = await handleRequest(withCookie('/api/session', sessionCookie(entry)));
		expect(response.status).toBe(204);
	});

	it('rejects a method other than GET', async () => {
		const response = await handleRequest(
			new Request('https://module.test/api/session', { method: 'POST' })
		);
		expect(response.status).toBe(405);
	});
});

describe('/api/telemetry', () => {
	function postTelemetryRequest(cookie?: string, events: unknown[] = [{ eventType: 'module_exit' }]) {
		return new Request('https://module.test/api/telemetry', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(cookie ? { cookie } : {})
			},
			body: JSON.stringify({ events })
		});
	}

	it('drops anonymous telemetry with a 204 and a counter', async () => {
		const before = telemetryCounters.dropped_anonymous;
		const response = await handleRequest(postTelemetryRequest());
		expect(response.status).toBe(204);
		expect(telemetryCounters.dropped_anonymous).toBe(before + 1);
	});

	it('rejects a present but unknown session cookie with 401', async () => {
		const response = await handleRequest(postTelemetryRequest('genie_sid=not-real'));
		expect(response.status).toBe(401);
	});

	it('rejects more than 200 events per request', async () => {
		const session = createSession(4, 'token', Date.now() + 60_000);
		const events = Array.from({ length: 201 }, () => ({ eventType: 'attempt' }));
		const response = await handleRequest(postTelemetryRequest(`genie_sid=${session.id}`, events));
		expect(response.status).toBe(413);
	});

	it('forwards identified events with server-attached identity', async () => {
		const hub = stubHub((call) =>
			call.url.endsWith('/session') ? Response.json(hubTargets) : new Response('{}', { status: 200 })
		);
		const entry = await handleRequest(document(`/?t=${mint()}`));
		await tick();
		const cookie = sessionCookie(entry);
		await handleRequest(withCookie('/api/session', cookie));

		const response = await handleRequest(
			postTelemetryRequest(cookie, [
				{
					eventType: 'exercise_completed',
					moduleId: 'forged-module',
					sessionId: 'forged-session',
					metadata: { exercise: { questions: [{ answer: 'deadline', correct: true }] } }
				}
			])
		);
		expect(response.status).toBe(204);

		await flushTelemetry();
		const ingest = hub.calls.find((call) => call.url.endsWith('/ingest'));
		expect(ingest).toBeDefined();
		expect(ingest?.body?.studentId).toBe(4);
		const events = (ingest?.body?.events || []) as Array<Record<string, unknown>>;
		expect(events[0].moduleId).toBe('practice-g');
		expect(events[0].sessionId).toBe('lac-1');
		expect(JSON.stringify(ingest?.body)).not.toContain('forged');
	});
});
