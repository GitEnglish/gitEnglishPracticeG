# Module contract: hub handoff entry + attributed telemetry

The replication recipe for every satellite module (this one is `practice-g`). The module owns a
Bun server that sits in front of its static `dist/`. The hub owns the URL, the token, and the
student identity.

## Environment (server-side only, never in the client bundle or build args)

| Variable | Purpose |
| --- | --- |
| `GENIE_JWT_SECRET` | HS256 secret shared with the hub. Unset = every token treated as absent; the server still boots. |
| `GENIE_REQUIRE_TOKEN` | `true` denies anonymous document requests (403). Default `false`. |
| `HUB_INGEST_URL` | Hub telemetry ingest, e.g. `https://gitenglish.com/api/internal/satellite-telemetry/ingest`. Its origin is also used to derive the hub session URL. |
| `HUB_INGEST_SECRET` | Mirrors the hub's `INTERNAL_API_SECRET` (or `SATELLITE_SECRET` when that is the one set — the hub uses the first non-empty). Server-to-server only. |

## Entry token

`GET <any entry path>?t=<jwt>` — the path is the hub's business; the module serves whatever it lands
on.

- `alg` must be `HS256`. `none` and everything else is rejected.
- Signature verified with `GENIE_JWT_SECRET` (constant-time compare).
- `aud` must equal this module's audience: **`practice-genie` here**. Every module uses its own
  value; sharing one audience makes one module's token valid at every module.
- `exp` must be in the future (60 s clock skew allowed). `sub` is the numeric student id; it is the
  only claim read.
- Every request carrying `t` gets a `302` to the same path with only `t` removed, whether the token
  is valid, invalid, expired, tampered, or the secret is unset. The token never survives in the
  address bar or history.
- Valid token → server-side session, `genie_sid` cookie (`HttpOnly; Secure; SameSite=Lax; 12h`).
  The token and the student id are never sent to the browser.
- Invalid/absent → anonymous session, silent: no banner, no error page, no redirect to the hub.
  With `GENIE_REQUIRE_TOKEN=true`, anonymous document requests get a static 403 page.

## Targets

At entry the module calls `GET {origin of HUB_INGEST_URL}/api/internal/practice-genie/session` with
`Authorization: Bearer <t>` (1500 ms timeout, no retry) and caches the result **server-side**.
Only successes are cached; failures are retried on the next `/api/session` call after a 30 s
backoff, and only while the handoff token is still valid.

`GET /api/session`:

| State | Response |
| --- | --- |
| no valid session cookie | `401` |
| identified, no targets (hub fetch failed/unavailable) | `204` |
| identified, targets available | `200` `{theme, focusVocabulary, focusGrammar, inclusionRate, grammarInclusionRate, sessionId}` |
| identified, targets empty | `204` (never `200` with empty arrays) |

`studentId` / `studentName` are never returned to the browser; `sessionId` is the hub's class id
(the `lacId`), used only to preselect the class switcher. **Content precedence: non-empty
session targets win; otherwise the URL params (`theme`, `focusVocabulary`, `focusGrammar`) are the
fallback. Never merge the two.**

## Classes and switching

The switcher changes class without leaving the module. Both routes sit behind the same session
check as `/api/session`, and the hub bearer never reaches the browser.

`GET /api/classes` → hub `GET {origin}/api/internal/practice-genie/classes` with the session's
bearer (1500 ms timeout, no retry). The list is cached on the session and refetched at most once
per 60 s.

| State | Response |
| --- | --- |
| no valid session cookie | `401` |
| hub answered (fresh or cached) | `200` `{classes:[{lacId, title, date, vocabularyCount, grammarCount}]}` |
| hub failed, nothing cached | `204` |
| hub failed, list cached | `200` with the cached list (a failed refetch never empties the dropdown) |

`POST /api/class` with `{lacId}` → hub `GET …/session?session=<lacId>` with the same bearer.

- The class id is accepted **only** in this JSON body. Never from a header, a query param or client
  storage, so the browser cannot attribute a write to a class it did not select.
- `400` for a missing/invalid `lacId`, an oversized id (>128 chars) or a body over 4 KB.
- `200` with the same target shape as `/api/session`; the session's targets, telemetry
  `sessionId` and the cached list stay consistent with the selected class.
- `204` when the hub fails: the previous targets are left intact, so a failed switch never blanks
  the exercise configuration.

Client: a compact `Class` select in the sidebar header, rendered only when the list is non-empty,
plus a `← Back to Practice` link to `https://gitenglish.com/practice`. A `401`/`204`/network failure
renders no dropdown and no error — anonymous mode stays visually identical to today.

## Telemetry

Browser → `POST /api/telemetry` (same origin, batched ≤200 events, 20 s interval + `pagehide`).
Server → `POST HUB_INGEST_URL` with `x-internal-secret: HUB_INGEST_SECRET` and
`{studentId, events:[…]}`.

- No session cookie → `204`, events dropped, `dropped_anonymous` incremented. Anonymous is a
  supported mode; do not 401 it.
- Cookie present but unknown/invalid → `401`.
- Identified → `204` immediately, forwarded in the background. `moduleId` and `sessionId` are
  attached server-side; the browser cannot claim either.
- Event fields: `moduleId`, `sessionId`, `eventType`, `dwellMs`, `activeMs`, `lexicalToken`,
  `attempts`, `metadata`. No access codes, names, or emails.
- Retried at most once, and only when no response was received. The hub has no idempotency key and
  assigns its own row id, so an ambiguous failure can duplicate rows.
- **Rate-limit ceiling:** every student's telemetry arrives from this module's single IP, so the
  hub's `checkRateLimit(..., 60)` bucket is shared. At the 20 s batch interval, 25 concurrently
  active students ≈ 75 req/min → 429s. Fine at classroom scale (~2 concurrent); raise the hub
  limit or batch less often before that changes.

## Ops

- `GET /healthz` → `200 {status:"ok", sha}` (`RAILWAY_GIT_COMMIT_SHA`).
- `GET /version` → `{name, sha, secret_configured, gate:{valid_token, invalid_token, anonymous},
  telemetry:{forwarded, failed, dropped_anonymous, dropped_invalid, dropped_overflow}}`.
  `secret_configured` is the difference between "secret missing in prod" and "hub not minting yet".
- `/health` and `/api/health` also answer `200`.

## Flipping to strict

`GENIE_REQUIRE_TOKEN=true` only after the hub both mints `?t=` on the redirect and accepts the
bearer on `/api/internal/practice-genie/session`. Sessions are in-memory, so a Railway restart
revokes every session: with the switch on, every visitor is 403'd until they re-enter through the
hub link.

## Deploy

`railway.toml` pins `bun run build` / `bun run start` / `healthcheckPath = "/healthz"`. Static
assets stay cache-immutable; `index.html` and all API responses are `no-store`.
