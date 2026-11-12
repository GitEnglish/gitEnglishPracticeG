import { describe, it, expect } from 'bun:test';
import { createHmac } from 'node:crypto';
import { stripEntryToken, verifyEntryToken } from './gate.ts';

const SECRET = 'test-secret';

function mint(overrides: Record<string, unknown> = {}, alg = 'HS256'): string {
	const header = Buffer.from(JSON.stringify({ alg, typ: 'JWT' })).toString('base64url');
	const payload = Buffer.from(
		JSON.stringify({
			sub: 4,
			aud: 'practice-genie',
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 300,
			...overrides
		})
	).toString('base64url');
	const signature = createHmac('sha256', SECRET).update(`${header}.${payload}`).digest('base64url');
	return `${header}.${payload}.${signature}`;
}

describe('verifyEntryToken', () => {
	it('accepts a valid HS256 handoff token and returns sub + exp', () => {
		const claims = verifyEntryToken(mint(), SECRET);
		expect(claims?.sub).toBe(4);
		expect(claims?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
	});

	it('rejects alg=none and any non-HS256 algorithm', () => {
		const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
		const payload = Buffer.from(
			JSON.stringify({ sub: 4, aud: 'practice-genie', exp: Date.now() / 1000 + 300 })
		).toString('base64url');
		expect(verifyEntryToken(`${header}.${payload}.`, SECRET)).toBeNull();
		expect(verifyEntryToken(mint({}, 'HS512'), SECRET)).toBeNull();
	});

	it('rejects the wrong audience', () => {
		expect(verifyEntryToken(mint({ aud: 'another-module' }), SECRET)).toBeNull();
	});

	it('rejects expired tokens, allowing 60s of clock skew', () => {
		const nowSeconds = Math.floor(Date.now() / 1000);
		expect(verifyEntryToken(mint({ exp: nowSeconds - 120 }), SECRET)).toBeNull();
		expect(verifyEntryToken(mint({ exp: nowSeconds - 30 }), SECRET)?.sub).toBe(4);
	});

	it('rejects a tampered signature and a malformed token', () => {
		const token = mint();
		const [header, payload] = token.split('.');
		expect(verifyEntryToken(`${header}.${payload}.deadbeef`, SECRET)).toBeNull();
		expect(verifyEntryToken('not-a-jwt', SECRET)).toBeNull();
	});

	it('treats every token as absent when the secret is unset', () => {
		expect(verifyEntryToken(mint(), '')).toBeNull();
	});

	it('rejects a missing or non-numeric sub', () => {
		expect(verifyEntryToken(mint({ sub: 'student' }), SECRET)).toBeNull();
		expect(verifyEntryToken(mint({ sub: undefined }), SECRET)).toBeNull();
	});
});

describe('stripEntryToken', () => {
	it('removes only t and keeps the path and other params', () => {
		const url = new URL('https://module.test/practice/genie?t=abc.def.ghi&theme=Jazz&session=12');
		expect(stripEntryToken(url)).toBe('/practice/genie?theme=Jazz&session=12');
	});

	it('keeps a bare path clean', () => {
		expect(stripEntryToken(new URL('https://module.test/?t=x'))).toBe('/');
	});
});
