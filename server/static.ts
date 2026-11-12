import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST_DIR = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist');
const INDEX_FILE = join(DIST_DIR, 'index.html');

const MIME_TYPES: Record<string, string> = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.map': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.txt': 'text/plain; charset=utf-8',
	'.webmanifest': 'application/manifest+json'
};

export function jsonResponse(payload: unknown, status: number = 200): Response {
	return new Response(JSON.stringify(payload), {
		status,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'no-store',
			'X-Content-Type-Options': 'nosniff'
		}
	});
}

export function noContent(status: number = 204): Response {
	return new Response(null, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function serveStaticFile(pathname: string): Promise<Response | null> {
	if (pathname === '/') return null;

	let decoded: string;
	try {
		decoded = decodeURIComponent(pathname);
	} catch {
		return null;
	}
	if (decoded.includes('\0')) return null;

	const relative = normalize(decoded).replace(/^[/\\]+/, '');
	const filePath = join(DIST_DIR, relative);
	if (!filePath.startsWith(DIST_DIR + sep)) return null;

	const file = Bun.file(filePath);
	if (!(await file.exists())) {
		// A missing asset is a 404; a missing route falls through to the SPA.
		return extname(relative) ? new Response('Not found', { status: 404 }) : null;
	}

	const immutable = relative.startsWith('assets/');
	return new Response(file, {
		headers: {
			'Content-Type': MIME_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream',
			'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
			'X-Content-Type-Options': 'nosniff'
		}
	});
}

export async function indexResponse(): Promise<Response> {
	const file = Bun.file(INDEX_FILE);
	if (!(await file.exists())) {
		return new Response('Build output missing. Run "bun run build" first.', {
			status: 500,
			headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
		});
	}
	return new Response(file, {
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': 'no-store',
			'Referrer-Policy': 'no-referrer',
			'X-Content-Type-Options': 'nosniff'
		}
	});
}
