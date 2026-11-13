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
	authorization?: string;
	body?: Record<string, unknown>;
}

function stubHub(
	respond: (call: CapturedCall) => Response | Promise<Response>
): { calls: CapturedCall[] } {
	const calls: CapturedCall[] = [];
	globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
		const headers = (init?.headers || {}) as Record<string, string>;
		const call: CapturedCall = {
			method: init?.method || 'GET',
			url: String(input),
			authorization: headers.Authorization || headers.authorization,
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

const hubClasses = {
	studentId: 4,
	classes: [
		{
			lacId: 'lac-1',
			title: 'Voltage Searches & Explain-To',
			date: '09-04-2026',
			vocabularyCount: 13,
			grammarCount: 3
		},
		{
			lacId: 'lac-2',
			title: 'Airport Delays',
			date: '09-03-2026',
			vocabularyCount: 9,
			grammarCount: 2
		}
	]
};

function classRequest(cookie?: string, body: unknown = { lacId: 'lac-2' }): Request {
	return new Request('https://module.test/api/class', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...(cookie ? { cookie } : {})
		},
		body: typeof body === 'string' ? body : JSON.stringify(body)
	});
}

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

describe('/api/classes and /api/class', () => {
	async function identifiedEntry(): Promise<string> {
		const entry = await handleRequest(document(`/?t=${mint()}`));
		await tick();
		return sessionCookie(entry);
	}

	it('rejects anonymous sessions on both routes', async () => {
		expect((await handleRequest(document('/api/classes'))).status).toBe(401);
		expect((await handleRequest(classRequest())).status).toBe(401);
	});

	it('lists the hub classes for an identified session and keeps the bearer server-side', async () => {
		const hub = stubHub((call) =>
			call.url.endsWith('/classes') ? Response.json(hubClasses) : Response.json(hubTargets)
		);
		const cookie = await identifiedEntry();

		const response = await handleRequest(withCookie('/api/classes', cookie));
		expect(response.status).toBe(200);
		const body = (await response.json()) as { classes: Array<Record<string, unknown>> };
		expect(body.classes).toHaveLength(2);
		expect(body.classes[0].lacId).toBe('lac-1');
		expect(body.classes[0].title).toBe('Voltage Searches & Explain-To');
		expect(body.classes[0].vocabularyCount).toBe(13);

		const call = hub.calls.find((entry) => entry.url.endsWith('/classes'));
		expect(call?.authorization?.startsWith('Bearer eyJ')).toBe(true);
		expect(JSON.stringify(body)).not.toContain('eyJ');
	});

	it('serves the cached list and refetches at most once per minute', async () => {
		const hub = stubHub((call) =>
			call.url.endsWith('/classes') ? Response.json(hubClasses) : Response.json(hubTargets)
		);
		const cookie = await identifiedEntry();

		expect((await handleRequest(withCookie('/api/classes', cookie))).status).toBe(200);
		expect((await handleRequest(withCookie('/api/classes', cookie))).status).toBe(200);
		expect(hub.calls.filter((call) => call.url.endsWith('/classes'))).toHaveLength(1);
	});

	it('returns 204 when the hub does not answer and nothing is cached', async () => {
		stubHub(() => new Response('unauthorized', { status: 401 }));
		const cookie = await identifiedEntry();
		expect((await handleRequest(withCookie('/api/classes', cookie))).status).toBe(204);
	});

	it('keeps the previous list when a refetch fails', async () => {
		const hub = stubHub((call) =>
			call.url.endsWith('/classes') ? Response.json(hubClasses) : Response.json(hubTargets)
		);
		const cookie = await identifiedEntry();
		expect((await handleRequest(withCookie('/api/classes', cookie))).status).toBe(200);

		globalThis.fetch = (async () => {
			throw new TypeError('hub down');
		}) as unknown as typeof fetch;
		const session = getSession(readSessionId(cookie));
		if (session) session.classesFetchAt = 0;

		const response = await handleRequest(withCookie('/api/classes', cookie));
		expect(response.status).toBe(200);
		const body = (await response.json()) as { classes: unknown[] };
		expect(body.classes).toHaveLength(2);
		expect(hub.calls.length).toBeGreaterThan(1);
	});

	it('rejects a missing, oversized or header-only class id', async () => {
		const cookie = await identifiedEntry();
		expect((await handleRequest(classRequest(cookie, {}))).status).toBe(400);
		expect(
			(await handleRequest(classRequest(cookie, { lacId: 'x'.repeat(129) }))).status
		).toBe(400);
		expect((await handleRequest(classRequest(cookie, 'not json'))).status).toBe(400);

		const headerOnly = new Request('https://module.test/api/class', {
			method: 'POST',
			headers: { cookie, 'x-lac-id': 'lac-2', 'Content-Type': 'application/json' },
			body: '{}'
		});
		expect((await handleRequest(headerOnly)).status).toBe(400);
	});

	it('switches the class and returns the new targets', async () => {
		const hub = stubHub((call) => {
			if (call.url.endsWith('/classes')) return Response.json(hubClasses);
			if (call.url.includes('session=lac-2')) {
				return Response.json({
					...hubTargets,
					sessionId: 'lac-2',
					theme: 'Travel',
					focusVocabulary: ['layover', 'aisle'],
					focusGrammar: ['past perfect']
				});
			}
			return Response.json(hubTargets);
		});
		const cookie = await identifiedEntry();
		expect((await handleRequest(withCookie('/api/session', cookie))).status).toBe(200);

		const response = await handleRequest(classRequest(cookie, { lacId: 'lac-2' }));
		expect(response.status).toBe(200);
		const body = (await response.json()) as Record<string, unknown>;
		expect(body.focusVocabulary).toEqual(['layover', 'aisle']);
		expect(body.sessionId).toBe('lac-2');

		const switchCall = hub.calls.find((call) => call.url.includes('session=lac-2'));
		expect(switchCall?.authorization?.startsWith('Bearer eyJ')).toBe(true);

		const session = getSession(readSessionId(cookie));
		expect(session?.sessionId).toBe('lac-2');
		expect(session?.targets?.focusVocabulary).toEqual(['layover', 'aisle']);

		const after = await handleRequest(withCookie('/api/session', cookie));
		expect(after.status).toBe(200);
		const afterBody = (await after.json()) as Record<string, unknown>;
		expect(afterBody.focusVocabulary).toEqual(['layover', 'aisle']);
	});

	it('leaves the previous targets intact when the switch fails', async () => {
		stubHub((call) =>
			call.url.endsWith('/classes') ? Response.json(hubClasses) : Response.json(hubTargets)
		);
		const cookie = await identifiedEntry();
		expect((await handleRequest(withCookie('/api/session', cookie))).status).toBe(200);

		globalThis.fetch = (async () => {
			throw new TypeError('hub down');
		}) as unknown as typeof fetch;

		const response = await handleRequest(classRequest(cookie, { lacId: 'lac-2' }));
		expect(response.status).toBe(204);

		const after = await handleRequest(withCookie('/api/session', cookie));
		expect(after.status).toBe(200);
		const body = (await after.json()) as Record<string, unknown>;
		expect(body.focusVocabulary).toEqual(['deadline', 'stakeholder']);
		expect(body.sessionId).toBe('lac-1');
	});

	it('rejects the wrong methods', async () => {
		const cookie = await identifiedEntry();
		expect(
			(
				await handleRequest(
					new Request('https://module.test/api/classes', { method: 'POST', headers: { cookie } })
				)
			).status
		).toBe(405);
		expect((await handleRequest(withCookie('/api/class', cookie))).status).toBe(405);
	});
});
