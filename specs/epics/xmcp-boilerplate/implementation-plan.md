# xmcp-boilerplate — implementation plan

Three milestones, one task each, each landed as one pull request.

## XM0 — the spec (XM-1)

The repository is born with hono-mcp's frame — `intent.yaml` (dev
verify-only, stage, prod after stage; the placeholder workspace
`ws_CHANGE_ME`, so CI plans nothing until it is linked), `ci.yml` byte for
byte turso-starter's (as hono-mcp carries it), the shared TypeScript and
ESLint configuration, the wrangler renderer, the pnpm workspace and turbo
pipeline (the build's outputs include `worker.js` and `.xmcp/`), and the spec
index — and this doc set and the three task contracts land on it.

## XM1 — the MCP server on Workers (XM-2)

- `apps/api/src/{tools,prompts,resources}/` are upstream's files, unchanged;
  `xmcp.config.ts` is upstream's with the server's name from
  `src/identity.ts` (`API_NAME`); `apps/api/LICENSE.md` is the template's MIT
  licence. xmcp 1.9.0 and zod 4 (design §2).
- `src/worker.ts` serves the `worker.js` `xmcp build --cf` writes;
  `src/health.ts` adds the name and environment to `/health`.
- `apps/api/wrangler.jsonc` (per-environment `env` sections, `nodejs_compat`)
  and `component.yaml` (`cloudflare-worker-turbo`) with a smoke over
  `/health`, an MCP `initialize` and a `tools/call` of `greet`.
- `tests/api`: vitest calling the template's files, the health wrapper over a
  stand-in, and an MCP SDK client against the built Worker in-process.
- The README: run, test, connect a client, deploy; how each Vercel piece maps.

Done when typecheck, lint, test and build are green, and `wrangler dev`
answers the MCP SDK's own client.

## XM2 — a baseline (XM-3)

hono-mcp's machinery on this tree: the card, the build document (one
landing, `01-product`, then the record, `02-docs`), `.baseline/` (identity,
the product's README, task contracts), the rename engine, the bootstrap
helpers, the deployment-record renderer (which also lists the tools `/mcp`
answers with), the phase pages, the context pack, and the baseline's tests —
with the end-to-end tier building the Worker in the staged job tree and making
a real MCP exchange against it (`testing/lib/mcp-client.mjs`): the tool, the
prompt and both resources. Done when every Baseline CI tier is green; tagged
`baseline-v1`.
