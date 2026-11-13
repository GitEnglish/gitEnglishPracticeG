import { AUDIENCE, hubClassesUrl, hubSessionUrl, jwtSecret, requireToken, sha } from './config.ts';
import { entryDeniedPage, gateCounters, stripEntryToken, verifyEntryToken } from './gate.ts';
import { getHubClasses, getHubTargets } from './hub.ts';
import {
	createSession,
	getSession,
	pruneSessions,
	readSessionId,
	sessionCookie,
	type GenieSession,
	type HubTargets
} from './sessions.ts';
import { indexResponse, jsonResponse, noContent, serveStaticFile } from './static.ts';
import {
	enqueueTelemetry,
	normalizeTelemetryEvent,
	telemetryCounters
} from './telemetry.ts';

const MAX_EVENTS_PER_REQUEST = 200;
const TARGET_FETCH_BACKOFF_MS = 30_000;
const CLASSES_CACHE_MS = 60_000;
const MAX_LAC_ID_LENGTH = 128;
const MAX_CLASS_BODY_BYTES = 4096;

function documentHeaders(): Record<string, string> {
	return {
		'Cache-Control': 'no-store',
		'Referrer-Policy': 'no-referrer',
		'X-Content-Type-Options': 'nosniff'
	};
}

/**
 * Fetches targets only while the handoff token is still valid, and only once per
 * backoff window. Successes are cached on the session; failures are never
 * cached, so a hub that starts accepting the bearer later does not require a new
 * login — the next /api/session call retries.
 *
 * The entry handoff starts this fetch without awaiting it so the 302 stays fast.
 * A caller that arrives while it is still in flight joins that promise instead
 * of answering from an empty cache, which is what made roughly a quarter of
 * entries render with no targets.
 */
function refreshTargets(session: GenieSession): Promise<void> | null {
	const sessionUrl = hubSessionUrl();
	const now = Date.now();
	if (!sessionUrl) return null;
	if (session.targets) return null;
	if (now >= session.hubTokenExp - 60_000) return null;
	if (session.targetsFetch) return session.targetsFetch;
	if (now - session.lastFetchAt < TARGET_FETCH_BACKOFF_MS) return null;

	session.lastFetchAt = now;
	const pending = getHubTargets(session.hubToken, sessionUrl)
		.then((targets) => {
			if (!targets) return;
			session.targets = targets;
			if (targets.sessionId) session.sessionId = targets.sessionId;
		})
		.finally(() => {
			session.targetsFetch = null;
		});
	session.targetsFetch = pending;
	return pending;
}

interface ClientTargets {
	theme: string;
	focusVocabulary: string[];
	focusGrammar: string[];
	inclusionRate: number;
	grammarInclusionRate: number;
	/** The hub's class id, so the switcher can preselect the active class. */
	sessionId?: string;
}

function nonEmptyTargets(targets: HubTargets | null): ClientTargets | null {
	if (!targets) return null;
	const focusVocabulary = (targets.focusVocabulary || []).filter(
		(value) => typeof value === 'string' && value.trim().length > 0
	);
	const focusGrammar = (targets.focusGrammar || []).filter(
		(value) => typeof value === 'string' && value.trim().length > 0
	);
	if (focusVocabulary.length === 0 && focusGrammar.length === 0) return null;
	return {
		theme: targets.theme || '',
		focusVocabulary,
		focusGrammar,
		inclusionRate: targets.inclusionRate ?? 50,
		grammarInclusionRate: targets.grammarInclusionRate ?? 50,
		...(targets.sessionId ? { sessionId: targets.sessionId } : {})
	};
}

async function sessionResponse(request: Request): Promise<Response> {
	const session = getSession(readSessionId(request.headers.get('cookie')));
	if (!session) return jsonResponse({ error: 'anonymous' }, 401);

	const pending = refreshTargets(session);
	if (pending) await pending;

	const targets = nonEmptyTargets(session.targets);
	if (!targets) return noContent(204);
	return jsonResponse(targets, 200);
}

/** The hub bearer cannot be replayed once it is about to expire. */
function canCallHub(session: GenieSession): boolean {
	return Date.now() < session.hubTokenExp - 60_000;
}

/**
 * Class list for the switcher. Served from the session for 60 s; resolved once
 * from the hub per window. A failed refetch keeps the previous list rather than
 * yanking the dropdown out from under the student.
 */
async function classesResponse(session: GenieSession): Promise<Response> {
	const fresh = session.classes !== null && Date.now() - session.classesFetchAt < CLASSES_CACHE_MS;
	if (fresh) return jsonResponse({ classes: session.classes }, 200);

	const cached = session.classes;
	const classesUrl = hubClassesUrl();
	if (!classesUrl || !canCallHub(session)) {
		return cached ? jsonResponse({ classes: cached }, 200) : noContent(204);
	}

	session.classesFetchAt = Date.now();
	const classes = await getHubClasses(session.hubToken, classesUrl);
	if (!classes) return cached ? jsonResponse({ classes: cached }, 200) : noContent(204);

	session.classes = classes;
	return jsonResponse({ classes }, 200);
}

/**
 * Switches the session to another class. The class id arrives only in this
 * body — never from a header, a query param or client storage — and the hub
 * bearer never leaves the server.
 */
async function classResponse(request: Request, session: GenieSession): Promise<Response> {
	const declaredLength = Number(request.headers.get('content-length') || 0);
	if (Number.isFinite(declaredLength) && declaredLength > MAX_CLASS_BODY_BYTES) {
		return jsonResponse({ error: 'body too large' }, 400);
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return jsonResponse({ error: 'invalid JSON' }, 400);
	}
	const lacId =
		body && typeof body === 'object' ? (body as { lacId?: unknown }).lacId : undefined;
	if (typeof lacId !== 'string') return jsonResponse({ error: 'lacId required' }, 400);
	const requested = lacId.trim();
	if (requested.length === 0 || requested.length > MAX_LAC_ID_LENGTH) {
		return jsonResponse({ error: 'invalid lacId' }, 400);
	}

	const sessionUrl = hubSessionUrl();
	if (!sessionUrl || !canCallHub(session)) return noContent(204);

	const targets = await getHubTargets(session.hubToken, sessionUrl, undefined, requested);
	const switched = targets
		? { ...targets, sessionId: targets.sessionId || requested }
		: null;
	const client = nonEmptyTargets(switched);
	// Leave the previous targets in place when the hub cannot answer: a failed
	// switch must not blank the exercise configuration.
	if (!switched || !client) return noContent(204);

	session.targets = switched;
	session.sessionId = switched.sessionId || requested;
	return jsonResponse(client, 200);
}

async function telemetryResponse(request: Request): Promise<Response> {
	const sessionId = readSessionId(request.headers.get('cookie'));
	if (!sessionId) {
		telemetryCounters.dropped_anonymous += 1;
		return noContent(204);
	}

	const session = getSession(sessionId);
	if (!session) {
		telemetryCounters.dropped_invalid += 1;
		return jsonResponse({ error: 'unknown session' }, 401);
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return jsonResponse({ error: 'invalid JSON' }, 400);
	}

	const rawEvents = Array.isArray(body)
		? body
		: body && typeof body === 'object' && Array.isArray((body as { events?: unknown }).events)
			? (body as { events: unknown[] }).events
			: null;
	if (!rawEvents) return jsonResponse({ error: 'events required' }, 400);
	if (rawEvents.length > MAX_EVENTS_PER_REQUEST) {
		return jsonResponse({ error: `max ${MAX_EVENTS_PER_REQUEST} events per request` }, 413);
	}

	const events = rawEvents
		.map((raw) => normalizeTelemetryEvent(raw, session.sessionId))
		.filter((event): event is NonNullable<typeof event> => event !== null);
	enqueueTelemetry(session.studentId, events);
	return noContent(204);
}

async function documentResponse(request: Request, url: URL): Promise<Response> {
	if (url.searchParams.has('t')) {
		const token = url.searchParams.get('t') || '';
		const claims = verifyEntryToken(token, jwtSecret(), Date.now(), AUDIENCE);
		const headers = new Headers({ ...documentHeaders(), Location: stripEntryToken(url) });

		if (claims) {
			gateCounters.valid_token += 1;
			const session = createSession(claims.sub, token, claims.exp * 1000);
			headers.append('Set-Cookie', sessionCookie(session.id));
			void refreshTargets(session);
		} else {
			gateCounters.invalid_token += 1;
			console.warn('[genie] entry token rejected; continuing anonymously');
		}
		return new Response(null, { status: 302, headers });
	}

	const session = getSession(readSessionId(request.headers.get('cookie')));
	if (!session) {
		gateCounters.anonymous += 1;
		if (requireToken()) {
			return new Response(entryDeniedPage(), {
				status: 403,
				headers: { ...documentHeaders(), 'Content-Type': 'text/html; charset=utf-8' }
			});
		}
	}

	return indexResponse();
}

export async function handleRequest(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const path = url.pathname;

	pruneSessions();

	if (path === '/healthz') return jsonResponse({ status: 'ok', sha: sha() });
	if (path === '/version') {
		return jsonResponse({
			name: 'practice-genie',
			sha: sha(),
			secret_configured: Boolean(jwtSecret()),
			gate: { ...gateCounters },
			telemetry: { ...telemetryCounters }
		});
	}
	if (path === '/health' || path === '/api/health') return jsonResponse({ status: 'ok' });

	if (path === '/api/session') {
		if (request.method !== 'GET') return noContent(405);
		return sessionResponse(request);
	}
	if (path === '/api/classes') {
		if (request.method !== 'GET') return noContent(405);
		const session = getSession(readSessionId(request.headers.get('cookie')));
		if (!session) return jsonResponse({ error: 'anonymous' }, 401);
		return classesResponse(session);
	}
	if (path === '/api/class') {
		if (request.method !== 'POST') return noContent(405);
		const session = getSession(readSessionId(request.headers.get('cookie')));
		if (!session) return jsonResponse({ error: 'anonymous' }, 401);
		return classResponse(request, session);
	}
	if (path === '/api/telemetry') {
		if (request.method !== 'POST') return noContent(405);
		return telemetryResponse(request);
	}

	const staticFile = await serveStaticFile(path);
	if (staticFile) return staticFile;

	return documentResponse(request, url);
}
