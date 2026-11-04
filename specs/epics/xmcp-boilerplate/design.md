# xmcp-boilerplate — design

## 1. What the template is

A Model Context Protocol server written as files, built with
[xmcp](https://xmcp.dev). `xmcp.config.ts` turns the HTTP transport on and
names three folders; xmcp registers whatever they hold:

- `src/tools/greet.ts` — a `greet` tool (a zod schema of one string, `name`;
  read-only, idempotent annotations) answering `Hello, <name>!!`;
- `src/prompts/review-code.ts` — a `review-code` prompt (a user-role message
  asking for a review of the `code` argument);
- `src/resources/(config)/app.ts` — a static resource, `config://app`;
- `src/resources/(users)/[userId]/index.ts` — a resource template,
  `users://{userId}` (the folder path is the URI).

On Vercel, `xmcp build` (0.5) writes a Node HTTP server and Vercel runs it;
`node dist/http.js` serves it anywhere else. No auth, no data.

## 2. The mapping (Vercel → Cloudflare)

| Vercel | Here |
|---|---|
| `xmcp build` (0.5) → a Node HTTP server | `xmcp build --cf` (1.9) → `worker.js`, xmcp's own Cloudflare Worker: Streamable HTTP at `/mcp`, stateless (no session id), a landing page at `/`, `/health`; wrangler deploys it with `nodejs_compat` (xmcp imports `async_hooks`) |
| xmcp's `/health` (`status`, `transport`, `mode`, `auth`) | The same fields, plus `name` and `environment`: `src/worker.ts` serves `worker.js` through `src/health.ts`, which rewrites that one route and passes everything else through |
| The server named by xmcp's default (`xmcp server`) | The same name, from one seam: `src/identity.ts`'s `API_NAME`, handed to xmcp as `template.name` |
| `zod` 3.24.4 | zod 4: xmcp 1.x imports `zod/v3` (3.25+), and on zod 3.25's types the template's prompt fails the build's type check (TS2589); zod 4 compiles it, and the template uses nothing zod 4 changed |
| `vc dev` · `vc build` · `vc deploy` | `xmcp dev` / `preview` (`wrangler dev` over the build) · `xmcp build --cf && wrangler deploy --dry-run --outdir dist` · Orun's `wrangler deploy --env <stage\|prod>` on merge |
| A wrangler config xmcp would generate | Committed instead (`wrangler.jsonc`, `main: src/worker.ts`); xmcp writes one only when the app has none, so it never touches this one |

Alternatives rejected:

- **Stay on xmcp 0.5 and serve its Node build through `httpServerHandler`**
  (as express-api serves Express). 0.5's HTTP server is an Express app with a
  session store; xmcp's own Cloudflare build is the supported path, and the
  template moves forward with it.
- **Use xmcp's generated `worker.js` as wrangler's `main` directly.** Then
  `/health` could not say which environment answered, which is the contract
  the deploy's smoke and the bootstrap's probes read. A three-line entry keeps
  xmcp's Worker whole and adds only that.
- **zod 3.25 with a cast in the template's prompt.** It would change the
  template's code to suit a version the template never used; zod 4 leaves it
  untouched.
- **A Durable Object per session** (Cloudflare's `McpAgent`). The template
  is stateless; a session store would be a different server.

## 3. The repository

```
apps/api               the template's files, xmcp.config.ts, the entry (src/worker.ts, src/health.ts), the name (src/identity.ts), its licence, the Worker config
  component.yaml       Orun component: build with turbo (xmcp build --cf, then wrangler's dry run), deploy with wrangler --env; the smoke
  wrangler.jsonc       worker name, compatibility date, nodejs_compat, observability, env.{dev,stage,prod} vars
tests/api              vitest: the template's files, the health wrapper, an MCP client against the built Worker — in-process, no workerd
tooling/*              shared tsconfig / eslint / wrangler wiring renderer (unused here: nothing to wire)
intent.yaml            environments dev (verify) · stage · prod; `work:` points at specs/epics and tasks
```

## 4. The build

`pnpm --filter @app/api build` = `xmcp build --cf && wrangler deploy
--dry-run --outdir dist`: xmcp's compiler (rspack) bundles the template's
files, xmcp's runtime, the MCP server and zod into `worker.js` (502 KiB), and
wrangler bundles `src/worker.ts` over it into `dist/worker.js` — 719 KiB,
160 KiB gzipped, well under Workers Free's 3 MiB — and exits before upload.
`worker.js` and `.xmcp/` are turbo outputs, so a cache hit restores the
Worker the deploy bundles; neither is ever committed.

## 5. The smoke and the tests

The deploy's smoke reads `/health` for THIS environment, then POSTs an MCP
`initialize` (it must return `serverInfo`) and a `tools/call` of `greet` (it
must return `Hello, Orun!!`) — so a green deploy is a server that speaks MCP,
not a Worker that answers. The vitest suite calls the template's files,
checks the health wrapper over a stand-in, and drives the MCP SDK's own
client against the built `worker.js` in-process (the transport's `fetch`
pointed at the Worker's handler); the end-to-end tier builds and serves the
staged Worker with `wrangler dev --env stage`, runs the smoke verbatim and as
the planned step, and makes the full exchange over HTTP
(`testing/lib/mcp-client.mjs`): initialize with no session id issued, the
tool, the prompt and both resources.

## 6. The baseline

hono-mcp's, unchanged in shape: one landing (`01-product`) then the record
(`02-docs`); one brokered key pair (`workers-deploy`, `account-id`); the name
seam `API_NAME` in `apps/api/src/identity.ts`, which `initialize`, `/` and
`/health` all read; the workers.dev subdomain from the Cloudflare connection;
no domain asked. The deployment record adds one row per environment: the
tools `/mcp` lists. The leak gate requires `apps/api/LICENSE.md` and the
template's files to ship, and refuses xmcp's build output, so a product
cannot lose the template's credit or carry a stale build.
