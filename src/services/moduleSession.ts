export interface ModuleTargets {
	theme?: string;
	focusVocabulary: string[];
	focusGrammar: string[];
	inclusionRate?: number;
	grammarInclusionRate?: number;
	/** The hub's class id for the targets, used to preselect the switcher. */
	sessionId?: string;
}

export interface ModuleClass {
	lacId: string;
	title: string;
	date?: string;
	vocabularyCount?: number;
	grammarCount?: number;
}

function stringList(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

/** Parses the target shape shared by /api/session and /api/class. */
function parseTargets(data: unknown): ModuleTargets | null {
	if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
	const record = data as Record<string, unknown>;
	const focusVocabulary = stringList(record.focusVocabulary);
	const focusGrammar = stringList(record.focusGrammar);
	// A 200 never carries empty target arrays; treat it as no data regardless.
	if (focusVocabulary.length === 0 && focusGrammar.length === 0) return null;

	return {
		theme: typeof record.theme === 'string' ? record.theme : undefined,
		focusVocabulary,
		focusGrammar,
		inclusionRate: typeof record.inclusionRate === 'number' ? record.inclusionRate : undefined,
		grammarInclusionRate:
			typeof record.grammarInclusionRate === 'number' ? record.grammarInclusionRate : undefined,
		sessionId: typeof record.sessionId === 'string' ? record.sessionId : undefined
	};
}

/**
 * Targets for an identified session, resolved server-side from the hub handoff
 * token. Anonymous sessions (401), unresolved sessions (204) and a missing
 * server runtime (dev server, network error) all resolve to null so the URL
 * params stay untouched.
 */
export async function fetchModuleTargets(timeoutMs = 2500): Promise<ModuleTargets | null> {
	try {
		const response = await fetch('/api/session', {
			credentials: 'same-origin',
			headers: { Accept: 'application/json' },
			signal: AbortSignal.timeout(timeoutMs)
		});
		if (response.status !== 200) return null;
		return parseTargets(await response.json());
	} catch {
		return null;
	}
}

/**
 * The student's classes, for the switcher. Anonymous (401), unavailable (204)
 * and network failures all resolve to an empty list: the switcher renders
 * nothing rather than an empty or broken dropdown.
 */
export async function fetchModuleClasses(timeoutMs = 2500): Promise<ModuleClass[]> {
	try {
		const response = await fetch('/api/classes', {
			credentials: 'same-origin',
			headers: { Accept: 'application/json' },
			signal: AbortSignal.timeout(timeoutMs)
		});
		if (response.status !== 200) return [];
		const data = (await response.json()) as Record<string, unknown> | null;
		if (!data || !Array.isArray(data.classes)) return [];

		const classes: ModuleClass[] = [];
		for (const raw of data.classes) {
			if (!raw || typeof raw !== 'object') continue;
			const item = raw as Record<string, unknown>;
			if (typeof item.lacId !== 'string' || item.lacId.trim().length === 0) continue;
			classes.push({
				lacId: item.lacId,
				title: typeof item.title === 'string' ? item.title : '',
				date: typeof item.date === 'string' ? item.date : undefined,
				vocabularyCount:
					typeof item.vocabularyCount === 'number' ? item.vocabularyCount : undefined,
				grammarCount: typeof item.grammarCount === 'number' ? item.grammarCount : undefined
			});
		}
		return classes;
	} catch {
		return [];
	}
}

/**
 * Switches the session to another class. The class id travels only in the body;
 * the hub bearer stays on the server. A hub failure returns null so the caller
 * keeps the previous targets instead of blanking them.
 */
export async function switchModuleClass(
	lacId: string,
	timeoutMs = 5000
): Promise<ModuleTargets | null> {
	try {
		const response = await fetch('/api/class', {
			method: 'POST',
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
			body: JSON.stringify({ lacId }),
			signal: AbortSignal.timeout(timeoutMs)
		});
		if (response.status !== 200) return null;
		return parseTargets(await response.json());
	} catch {
		return null;
	}
}
