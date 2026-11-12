import { AUDIENCE, hubSessionUrl, jwtSecret, requireToken, sha } from './config.ts';
import { entryDeniedPage, gateCounters, stripEntryToken, verifyEntryToken } from './gate.ts';
import { getHubTargets } from './hub.ts';
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
 */
function refreshTargets(session: GenieSession): Promise<void> | null {
	const sessionUrl = hubSessionUrl();
	const now = Date.now();
	if (!sessionUrl) return null;
	if (session.targets) return null;
	if (now >= session.hubTokenExp - 60_000) return null;
	if (now - session.lastFetchAt < TARGET_FETCH_BACKOFF_MS) return null;

	session.lastFetchAt = now;
	return getHubTargets(session.hubToken, sessionUrl).then((targets) => {
		if (!targets) return;
		session.targets = targets;
		if (targets.sessionId) session.sessionId = targets.sessionId;
	});
}

interface ClientTargets {
	theme: string;
	focusVocabulary: string[];
	focusGrammar: string[];
	inclusionRate: number;
	grammarInclusionRate: number;
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
		grammarInclusionRate: targets.grammarInclusionRate ?? 50
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
	if (path === '/api/telemetry') {
		if (request.method !== 'POST') return noContent(405);
		return telemetryResponse(request);
	}

	const staticFile = await serveStaticFile(path);
	if (staticFile) return staticFile;

	return documentResponse(request, url);
}
