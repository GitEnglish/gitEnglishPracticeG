import type { HubTargets } from './sessions.ts';

export interface TelemetryEvent {
	moduleId: string;
	sessionId: string;
	eventType: string;
	dwellMs?: number;
	activeMs?: number;
	lexicalToken?: string;
	attempts?: number;
	metadata?: Record<string, unknown>;
	timestamp?: number;
}

const HUB_TIMEOUT_MS = 1500;

function stringList(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

export async function getHubTargets(
	bearer: string,
	sessionUrl: string,
	timeoutMs: number = HUB_TIMEOUT_MS
): Promise<HubTargets | null> {
	try {
		const response = await fetch(sessionUrl, {
			headers: { Authorization: `Bearer ${bearer}`, Accept: 'application/json' },
			signal: AbortSignal.timeout(timeoutMs)
		});
		if (!response.ok) return null;
		const data = (await response.json()) as Record<string, unknown> | null;
		if (!data || typeof data !== 'object') return null;
		return {
			theme: typeof data.theme === 'string' ? data.theme : undefined,
			focusVocabulary: stringList(data.focusVocabulary),
			focusGrammar: stringList(data.focusGrammar),
			inclusionRate: typeof data.inclusionRate === 'number' ? data.inclusionRate : undefined,
			grammarInclusionRate:
				typeof data.grammarInclusionRate === 'number' ? data.grammarInclusionRate : undefined,
			sessionId: typeof data.sessionId === 'string' ? data.sessionId : undefined
		};
	} catch {
		return null;
	}
}

/**
 * Fire-and-forget exposure write. Retried at most once and only when no
 * response was received. The hub ingest ignores Idempotency-Key and assigns its
 * own row id, so a retry after an ambiguous failure can duplicate rows —
 * duplicates are preferable to losing an identified session's events.
 */
export async function postTelemetry(
	ingestUrl: string,
	ingestSecret: string,
	studentId: number,
	events: TelemetryEvent[],
	timeoutMs: number = HUB_TIMEOUT_MS
): Promise<boolean> {
	const send = () =>
		fetch(ingestUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-internal-secret': ingestSecret
			},
			body: JSON.stringify({ studentId, events }),
			signal: AbortSignal.timeout(timeoutMs)
		});

	try {
		let response: Response;
		try {
			response = await send();
		} catch {
			response = await send();
		}
		return response.ok;
	} catch {
		return false;
	}
}
