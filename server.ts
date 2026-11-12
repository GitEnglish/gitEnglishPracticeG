import {
	hubIngestSecret,
	hubIngestUrl,
	jwtSecret,
	port,
	sha
} from './server/config.ts';
import { handleRequest } from './server/handler.ts';
import { startTelemetryFlusher, flushTelemetry } from './server/telemetry.ts';

const stopFlusher = startTelemetryFlusher();

const server = Bun.serve({
	port: port(),
	hostname: '0.0.0.0',
	fetch: handleRequest
});

console.log(`[genie] listening on ${server.url} (sha ${sha()})`);
console.log(`[genie] entry tokens: ${jwtSecret() ? 'enabled' : 'secret not set'}`);
console.log(`[genie] hub ingest: ${hubIngestUrl() ? new URL(hubIngestUrl()).origin : 'not configured'}`);
if (hubIngestUrl() && !hubIngestSecret()) {
	console.warn('[genie] HUB_INGEST_URL is set but HUB_INGEST_SECRET is empty; telemetry will queue and drop');
}

async function shutdown(): Promise<void> {
	stopFlusher();
	await flushTelemetry().catch(() => {
		/* best effort on the way out */
	});
	server.stop();
	process.exit(0);
}

process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());
