// Server-side only. Never imported from src/ (the browser bundle).
// Values are read lazily so a missing variable can never crash boot and tests
// can vary the environment per case.

export const MODULE_ID = 'practice-g';

// Per-module audience. The next module must use its own value, otherwise one
// module's handoff token is valid at every module.
export const AUDIENCE = 'practice-genie';

const HUB_SESSION_PATH = '/api/internal/practice-genie/session';

export function port(): number {
	return Number(process.env.PORT || 3000);
}

export function jwtSecret(): string {
	return process.env.GENIE_JWT_SECRET || '';
}

export function requireToken(): boolean {
	return process.env.GENIE_REQUIRE_TOKEN === 'true';
}

export function hubIngestUrl(): string {
	return process.env.HUB_INGEST_URL || '';
}

export function hubIngestSecret(): string {
	return process.env.HUB_INGEST_SECRET || '';
}

export function sha(): string {
	return process.env.RAILWAY_GIT_COMMIT_SHA || process.env.GIT_SHA || 'unknown';
}

export function hubSessionUrl(): string | null {
	const ingestUrl = hubIngestUrl();
	if (!ingestUrl) return null;
	try {
		return new URL(HUB_SESSION_PATH, new URL(ingestUrl)).toString();
	} catch {
		return null;
	}
}
