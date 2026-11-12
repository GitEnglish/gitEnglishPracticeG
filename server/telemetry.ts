import { postTelemetry, type TelemetryEvent } from './hub.ts';
import { hubIngestSecret, hubIngestUrl, MODULE_ID } from './config.ts';

const MAX_BATCH = 200;
const MAX_QUEUED_PER_STUDENT = 1000;
const MAX_EVENT_TYPE_LENGTH = 64;
const MAX_TOKEN_LENGTH = 200;

export const telemetryCounters = {
	forwarded: 0,
	failed: 0,
	dropped_anonymous: 0,
	dropped_invalid: 0,
	dropped_overflow: 0
};

interface StudentQueue {
	events: TelemetryEvent[];
}

const queues = new Map<number, StudentQueue>();

function finiteNumber(value: unknown): number | undefined {
	return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/**
 * Server-side normalization. moduleId and sessionId are attached here so the
 * browser cannot claim another module or another student's session.
 */
export function normalizeTelemetryEvent(raw: unknown, sessionId: string): TelemetryEvent | null {
	if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
	const event = raw as Record<string, unknown>;
	const eventType =
		typeof event.eventType === 'string'
			? event.eventType
			: typeof event.type === 'string'
				? event.type
				: null;
	if (!eventType) return null;

	const metadata =
		event.metadata && typeof event.metadata === 'object' && !Array.isArray(event.metadata)
			? (event.metadata as Record<string, unknown>)
			: {};

	return {
		moduleId: MODULE_ID,
		sessionId,
		eventType: eventType.slice(0, MAX_EVENT_TYPE_LENGTH),
		dwellMs: finiteNumber(event.dwellMs),
		activeMs: finiteNumber(event.activeMs),
		lexicalToken:
			typeof event.lexicalToken === 'string'
				? event.lexicalToken.slice(0, MAX_TOKEN_LENGTH)
				: undefined,
		attempts: finiteNumber(event.attempts),
		metadata,
		timestamp: finiteNumber(event.timestamp)
	};
}

export function enqueueTelemetry(studentId: number, events: TelemetryEvent[]): void {
	if (events.length === 0) return;
	let queue = queues.get(studentId);
	if (!queue) {
		queue = { events: [] };
		queues.set(studentId, queue);
	}
	if (queue.events.length >= MAX_QUEUED_PER_STUDENT) {
		const overflow = Math.min(
			queue.events.length + events.length - MAX_QUEUED_PER_STUDENT,
			events.length
		);
		if (overflow > 0) {
			telemetryCounters.dropped_overflow += overflow;
			events = events.slice(overflow);
		}
	}
	queue.events.push(...events);
}

export function clearTelemetryQueues(): void {
	queues.clear();
	for (const key of Object.keys(telemetryCounters) as Array<keyof typeof telemetryCounters>) {
		telemetryCounters[key] = 0;
	}
}

/**
 * Flush one batch per student. The hub authenticates per-student batches, so
 * events from different students can never be combined into one request.
 * Sending stops for a student as soon as a batch fails, to avoid hammering a
 * rate-limited endpoint (60 req/min, shared across this module's single IP).
 */
export async function flushTelemetry(): Promise<void> {
	const ingestUrl = hubIngestUrl();
	const ingestSecret = hubIngestSecret();
	if (!ingestUrl || !ingestSecret) return;

	for (const [studentId, queue] of queues) {
		while (queue.events.length > 0) {
			const batch = queue.events.splice(0, MAX_BATCH);
			const ok = await postTelemetry(ingestUrl, ingestSecret, studentId, batch);
			if (!ok) {
				telemetryCounters.failed += batch.length;
				break;
			}
			telemetryCounters.forwarded += batch.length;
		}
		if (queue.events.length === 0) queues.delete(studentId);
	}
}

export function startTelemetryFlusher(intervalMs = 10_000): () => void {
	const timer = setInterval(() => {
		void flushTelemetry().catch(() => {
			/* flush never throws into the request path */
		});
	}, intervalMs);
	return () => clearInterval(timer);
}
