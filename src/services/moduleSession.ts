export interface ModuleTargets {
	theme?: string;
	focusVocabulary: string[];
	focusGrammar: string[];
	inclusionRate?: number;
	grammarInclusionRate?: number;
}

function stringList(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
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

		const data = (await response.json()) as Record<string, unknown>;
		const focusVocabulary = stringList(data.focusVocabulary);
		const focusGrammar = stringList(data.focusGrammar);
		// A 200 never carries empty target arrays; treat it as no data regardless.
		if (focusVocabulary.length === 0 && focusGrammar.length === 0) return null;

		return {
			theme: typeof data.theme === 'string' ? data.theme : undefined,
			focusVocabulary,
			focusGrammar,
			inclusionRate: typeof data.inclusionRate === 'number' ? data.inclusionRate : undefined,
			grammarInclusionRate:
				typeof data.grammarInclusionRate === 'number' ? data.grammarInclusionRate : undefined
		};
	} catch {
		return null;
	}
}
