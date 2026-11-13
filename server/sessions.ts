import { randomBytes } from 'node:crypto';

export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const SESSION_COOKIE = 'genie_sid';

export interface HubTargets {
	theme?: string;
	focusVocabulary?: string[];
	focusGrammar?: string[];
	inclusionRate?: number;
	grammarInclusionRate?: number;
	sessionId?: string;
}

/** One of the student's classes (lac) as listed by the hub. */
export interface HubClass {
	lacId: string;
	title: string;
	date?: string;
	vocabularyCount?: number;
	grammarCount?: number;
}

export interface GenieSession {
	id: string;
	studentId: number;
	createdAt: number;
	expiresAt: number;
	/** Hub handoff token, held server-side only for retrying the target fetch. */
	hubToken: string;
	hubTokenExp: number;
	/** Telemetry grouping id: the hub's session id once known, else an opaque module id. */
	sessionId: string;
	targets: HubTargets | null;
	lastFetchAt: number;
	/** Class list shown by the switcher; refetched at most once per minute. */
	classes: HubClass[] | null;
	classesFetchAt: number;
}

const sessions = new Map<string, GenieSession>();

export function createSession(
	studentId: number,
	hubToken: string,
	hubTokenExp: number,
	now: number = Date.now()
): GenieSession {
	const session: GenieSession = {
		id: randomBytes(24).toString('base64url'),
		studentId,
		createdAt: now,
		expiresAt: now + SESSION_TTL_MS,
		hubToken,
		hubTokenExp,
		sessionId: `genie-${randomBytes(6).toString('hex')}`,
		targets: null,
		lastFetchAt: 0,
		classes: null,
		classesFetchAt: 0
	};
	sessions.set(session.id, session);
	return session;
}

export function getSession(id: string | null | undefined, now: number = Date.now()): GenieSession | null {
	if (!id) return null;
	const session = sessions.get(id);
	if (!session) return null;
	if (session.expiresAt <= now) {
		sessions.delete(id);
		return null;
	}
	return session;
}

export function pruneSessions(now: number = Date.now()): void {
	for (const [id, session] of sessions) {
		if (session.expiresAt <= now) sessions.delete(id);
	}
}

export function clearSessions(): void {
	sessions.clear();
}

export function readSessionId(cookieHeader: string | null | undefined): string | null {
	if (!cookieHeader) return null;
	for (const part of cookieHeader.split(';')) {
		const [name, ...rest] = part.trim().split('=');
		if (name === SESSION_COOKIE) return rest.join('=') || null;
	}
	return null;
}

export function sessionCookie(id: string): string {
	return `${SESSION_COOKIE}=${id}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.floor(
		SESSION_TTL_MS / 1000
	)}`;
}
