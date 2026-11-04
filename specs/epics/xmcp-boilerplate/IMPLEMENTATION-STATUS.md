# xmcp-boilerplate — implementation status

| Milestone | State | Landed |
|---|---|---|
| XM0 — the spec | ✅ | XM-1 |
| XM1 — the MCP server on Workers | ✅ | XM-2 |
| XM2 — a baseline | planned | XM-3 |

## Departures from the upstream template

Everything not listed here is the template as it is upstream at `de86723`:
`src/tools/greet.ts`, `src/prompts/review-code.ts`,
`src/resources/(config)/app.ts` and `src/resources/(users)/[userId]/index.ts`
are byte for byte upstream's.

| # | What | Why |
|---|---|---|
| 1 | The app lives in `apps/api` of a pnpm workspace (`@app/api`); upstream's README and lockfile are replaced by the workspace's, and its `tsconfig.json` by one extending the workspace's Worker config | The workspace's shape (hono-mcp's) |
| 2 | `xmcp` `^0.5.0` → `1.9.0` (exact), with `@xmcp-dev/compiler` `1.9.0` (which xmcp 1.x's CLI needs for `dev` and `build`) | 0.5 has no Cloudflare build; `xmcp build --cf` arrived in 1.1 and was fixed in 1.8. Exact, because `src/worker.ts` relies on the build's output (risk XM-B) |
| 3 | `zod` `3.24.4` → `^4.6.7` | xmcp 1.x imports `zod/v3`, absent from 3.24; on 3.25 the build's type check fails on the template's prompt (TS2589). The template's files are unchanged (risk XM-C) |
| 4 | `xmcp.config.ts` adds `template: { name: API_NAME }`, from `src/identity.ts` | One rename seam for the name `initialize` and the landing page answer with; its value is xmcp's default (`xmcp server`), so the template answers as it did |
| 5 | `src/worker.ts` (wrangler's `main`) serves the `worker.js` that `xmcp build --cf` writes; `src/health.ts` adds `name` and `environment` to xmcp's `/health`, keeping its fields | The deploy's smoke and the bootstrap's probes read which environment answered |
| 6 | Scripts: `build` is `xmcp build --cf && wrangler deploy --dry-run --outdir dist`; `preview` serves the Worker under `wrangler dev`; `start` (`node dist/http.js`) dropped; `dev` (`xmcp dev`) kept | There is no Node server on Workers; the Worker is the server |
| 7 | `engines.node` `22.x` kept; `"type": "module"` added | The workspace's packages are ES modules; `worker.js` is one |
| 8 | `apps/api/LICENSE.md` is vercel/examples' MIT licence | The template ships under it; the product carries it |
| 9 | `wrangler.jsonc` (`<repo>-api`, `nodejs_compat`, `env.{dev,stage,prod}`) and `component.yaml` (`cloudflare-worker-turbo`, a smoke over `/health`, an MCP `initialize` and a `tools/call` of `greet`) | The Worker's config and the deploy contract replace Vercel's; xmcp writes a wrangler config only when there is none, so the committed one stands |
| 10 | Tests (the template ships none): `tests/api` — the template's files called directly, `src/health.ts` over a stand-in, and an MCP SDK client's exchange with the built `worker.js` in-process (initialize with no session, the tool and a refused bad argument, the prompt, both resources, `/`, `/health`, a 404, `GET /mcp` 405) | A test package of the workspace's shape |
