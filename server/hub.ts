import type { HubClass, HubTargets } from './sessions.ts';

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
	timeoutMs: number = HUB_TIMEOUT_MS,
	lacId?: string
): Promise<HubTargets | null> {
	let url = sessionUrl;
	if (lacId) {
		try {
			const target = new URL(sessionUrl);
			target.searchParams.set('session', lacId);
			url = target.toString();
		} catch {
			return null;
		}
	}
	try {
		const response = await fetch(url, {
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
 * Lists the student's classes with the same 1.5 s abort and no-retry policy as
 * the target fetch. Any non-2xx, malformed body or network failure is null; the
 * caller decides whether to serve a cached list or 204.
 */
export async function getHubClasses(
	bearer: string,
	classesUrl: string,
	timeoutMs: number = HUB_TIMEOUT_MS
): Promise<HubClass[] | null> {
	try {
		const response = await fetch(classesUrl, {
			headers: { Authorization: `Bearer ${bearer}`, Accept: 'application/json' },
			signal: AbortSignal.timeout(timeoutMs)
		});
		if (!response.ok) return null;
		const data = (await response.json()) as Record<string, unknown> | null;
		if (!data || typeof data !== 'object' || !Array.isArray(data.classes)) return null;

		const classes: HubClass[] = [];
		for (const raw of data.classes) {
			if (!raw || typeof raw !== 'object') continue;
			const item = raw as Record<string, unknown>;
			if (typeof item.lacId !== 'string' || item.lacId.trim().length === 0) continue;
			classes.push({
				lacId: item.lacId,
				title: typeof item.title === 'string' ? item.title : '',
				date: typeof item.date === 'string' ? item.date : undefined,
				vocabularyCount: typeof item.vocabularyCount === 'number' ? item.vocabularyCount : undefined,
				grammarCount: typeof item.grammarCount === 'number' ? item.grammarCount : undefined
			});
		}
		return classes;
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
