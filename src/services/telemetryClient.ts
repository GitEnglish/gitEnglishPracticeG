export interface ClientTelemetryEvent {
	eventType: string;
	dwellMs?: number;
	activeMs?: number;
	lexicalToken?: string;
	attempts?: number;
	metadata?: Record<string, unknown>;
}

const MAX_BATCH = 200;
const FLUSH_INTERVAL_MS = 20_000;

let queue: ClientTelemetryEvent[] = [];
let timer: ReturnType<typeof setInterval> | null = null;
let startedAt = Date.now();

function send(payload: string, keepalive: boolean): void {
	void fetch('/api/telemetry', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: payload,
		credentials: 'same-origin',
		keepalive
	}).catch(() => {
		/* anonymous sessions, missing server runtime and hub outages are silent */
	});
}

export function recordTelemetry(event: ClientTelemetryEvent): void {
	if (queue.length >= MAX_BATCH) flushTelemetry();
	queue.push(event);
	if (!timer) timer = setInterval(() => flushTelemetry(), FLUSH_INTERVAL_MS);
}

export function flushTelemetry(keepalive = false): void {
	if (queue.length === 0) return;
	const batch = queue.splice(0, MAX_BATCH);
	send(JSON.stringify({ events: batch }), keepalive);
}

/**
 * Records the module view/exit pair and flushes on the way out. Exit is recorded
 * before the beacon so the final event is included.
 */
export function installTelemetryLifecycle(): () => void {
	startedAt = Date.now();
	recordTelemetry({ eventType: 'module_view' });

	const onPageHide = () => {
		recordTelemetry({ eventType: 'module_exit', dwellMs: Date.now() - startedAt });
		if (queue.length === 0) return;
		const batch = queue.splice(0, MAX_BATCH);
		try {
			navigator.sendBeacon(
				'/api/telemetry',
				new Blob([JSON.stringify({ events: batch })], { type: 'application/json' })
			);
		} catch {
			flushTelemetry(true);
		}
	};

	window.addEventListener('pagehide', onPageHide);
	return () => {
		window.removeEventListener('pagehide', onPageHide);
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	};
}
