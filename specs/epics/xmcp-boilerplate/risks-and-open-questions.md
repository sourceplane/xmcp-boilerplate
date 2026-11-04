# xmcp-boilerplate — risks and open questions

## XM-A — No live bootstrap yet (OPEN)

Everything short of the platform is proven on every pull request: the card
against the build, the blueprint read by the pinned orun, the leak gate, the
offline bootstrap with the blueprint's own hooks, the server's own plan for
the 01-product merge, and the produced server built by `xmcp build --cf`,
dry-deployed, served, smoke-tested and called by the MCP SDK's client in the
job tree orun stages. Not proven: the repository created and linked, the
token minted, a real `wrangler deploy`, the smoke against workers.dev, and an
MCP client connected to the deployed `/mcp`.

## XM-B — `src/worker.ts` rests on the shape of xmcp's Cloudflare build (WATCH)

The entry imports `../worker.js`, which `xmcp build --cf` writes beside
`package.json`, and serves its default export (`{ fetch }`). It also relies
on xmcp writing a `wrangler.jsonc` of its own only when the app has none
(1.9.0: neither `wrangler.toml` nor `wrangler.jsonc` exists), so the
committed one stands. xmcp's Cloudflare build is young — it landed in
1.1 (2026-01) and `build --cf` was fixed in 1.8 (2026-08) — so xmcp is pinned
exactly (1.9.0, with `@xmcp-dev/compiler` 1.9.0), and a bump is a pull
request the vitest suite (an MCP client against the built `worker.js`) and
the e2e tier (the staged lane's own build, then `wrangler dev`) prove first.

## XM-C — zod 4, not the template's zod 3.24.4 (ACCEPTED)

xmcp 1.x imports `zod/v3`, which zod 3.24 does not export, and declares
`zod ^3.25.76 || ^4`. On zod 3.25 the build's type check fails on the
template's own prompt (`InferSchema<typeof schema>`, TS2589: type
instantiation is excessively deep). On zod 4 it compiles, and the template's
files use only `z.string().describe(...)`, which zod 4 keeps — so they are
unchanged.

## XM-D — `/mcp` is open (ACCEPTED)

As upstream: no authentication. Anyone with the URL can list and call the
tool, read the resources and fill the prompt, which are all public. An owner
adds xmcp's own auth (an API key or OAuth, in `xmcp.config.ts` or a
`src/middleware.ts`, with the key an Orun runtime secret) before a tool does
anything private — and the smoke then sends the credential too. The README
and operations.md say so.

## XM-E — The first landing's push must have a `before` (WATCH)

As hono-api's HA-G: `orun plan --changed` on a push with an all-zeros
`before` plans nothing. The landing merges into orun's seeded `Initial
commit`, so the merge's push has one. Confirmed by the first live bootstrap.

## XM-F — wrangler's multi-environment warning on the local build (ACCEPTED)

`wrangler.jsonc` carries `env.dev`, `env.stage` and `env.prod`; a bare
`wrangler deploy --dry-run` warns that no environment was given and bundles
the top level (`ENVIRONMENT=local`). Orun's lanes always pass `--env`.

## XM-G — stack-tectonic 0.19.0 (ACCEPTED)

The family's one pin (0.20.0's lane-scoped install breaks the Next.js
baselines). The end-to-end tier stages the job with whichever install scope
the pinned composition plans, so a bump is tested rather than assumed.

## XM-H — xmcp's landing page loads Google Fonts (ACCEPTED)

`GET /` is xmcp's own page, and it links Geist from fonts.googleapis.com, so a
browser that opens it fetches the fonts from Google. It is the template's look
and nothing an MCP client reads; the endpoint, `/health` and the smoke are
unaffected.

## XM-I — xmcp logs a notice on its first request (ACCEPTED)

xmcp 1.9 logs `responseMode: 'json' drops mid-call notifications …` once per
isolate. It is xmcp's own notice about a mode the template does not use (no
tool emits progress notifications mid-call); Workers Logs will show it.
