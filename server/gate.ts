import { createHmac, timingSafeEqual } from 'node:crypto';

export interface GateCounters {
	valid_token: number;
	invalid_token: number;
	anonymous: number;
}

export const gateCounters: GateCounters = { valid_token: 0, invalid_token: 0, anonymous: 0 };

export interface EntryClaims {
	sub: number;
	exp: number;
}

const CLOCK_SKEW_SECONDS = 60;

function decodeJson(segment: string): unknown {
	try {
		return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));
	} catch {
		return null;
	}
}

/**
 * HS256-only handoff token check. Returns the student id and token expiry, or
 * null for anything that is not a valid, unexpired, correctly-audienced token.
 * An unset secret means every token is treated as absent.
 */
export function verifyEntryToken(
	token: string,
	secret: string,
	now: number = Date.now(),
	audience: string = 'practice-genie'
): EntryClaims | null {
	if (!secret || !token) return null;

	const parts = token.split('.');
	if (parts.length !== 3) return null;
	const [headerSegment, payloadSegment, signatureSegment] = parts;

	const header = decodeJson(headerSegment) as { alg?: unknown } | null;
	if (!header || header.alg !== 'HS256') return null;

	const expected = createHmac('sha256', secret).update(`${headerSegment}.${payloadSegment}`).digest();
	let provided: Buffer;
	try {
		provided = Buffer.from(signatureSegment, 'base64url');
	} catch {
		return null;
	}
	if (provided.length !== expected.length) return null;
	if (!timingSafeEqual(provided, expected)) return null;

	const payload = decodeJson(payloadSegment) as Record<string, unknown> | null;
	if (!payload || typeof payload !== 'object') return null;

	const aud = payload.aud;
	const audienceMatches =
		typeof aud === 'string' ? aud === audience : Array.isArray(aud) && aud.includes(audience);
	if (!audienceMatches) return null;

	const exp = payload.exp;
	if (typeof exp !== 'number' || !Number.isFinite(exp)) return null;
	if (exp * 1000 < now - CLOCK_SKEW_SECONDS * 1000) return null;

	const rawSub = payload.sub;
	const sub = typeof rawSub === 'string' ? Number(rawSub) : rawSub;
	if (typeof sub !== 'number' || !Number.isInteger(sub) || sub <= 0) return null;

	return { sub, exp };
}

/** Same path, same query, same hash — only the `t` parameter is removed. */
export function stripEntryToken(url: URL): string {
	const cleaned = new URL(url.href);
	cleaned.searchParams.delete('t');
	return `${cleaned.pathname}${cleaned.search}${cleaned.hash}`;
}

export function entryDeniedPage(): string {
	return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Practice Genie</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0f1115;color:#e5e7eb;font:16px/1.6 system-ui,sans-serif}main{max-width:34rem;padding:2rem;text-align:center}p{color:#9ca3af}</style>
</head><body><main><h1>Practice Genie</h1>
<p>This module opens from a link in the gitEnglish student app.</p></main></body></html>`;
}
