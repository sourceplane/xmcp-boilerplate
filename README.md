# xmcp-boilerplate

Vercel's [xmcp boilerplate](https://github.com/vercel/examples/tree/main/framework-boilerplates/xmcp)
— a Model Context Protocol server built with [xmcp](https://xmcp.dev), where
each tool, prompt and resource is a file (`src/tools/greet.ts`,
`src/prompts/review-code.ts`, `src/resources/(config)/app.ts`,
`src/resources/(users)/[userId]/index.ts`) and xmcp serves them over
Streamable HTTP at `/mcp` — running natively as a **Cloudflare Worker**, and
packaged as an **Orun baseline**: one command takes a new MCP server from
nothing to live on stage and prod, in its own repository, under its own name
— in ONE landing.

`xmcp build --cf` compiles the template's files into xmcp's own Cloudflare
Worker (`worker.js`): Streamable HTTP at `/mcp`, stateless — no session, so
any isolate answers any call — xmcp's landing page at `/` and a health check.
wrangler deploys it through a three-line entry (`src/worker.ts`) whose one
addition is that `GET /health` also names the server and the environment the
Worker runs, which the deploy smoke-tests before it makes an MCP call. The
template's files are the template's files, unchanged. The port moves the
template from xmcp 0.5 (which had no Cloudflare build) to xmcp 1.9 and from
zod 3.24 to zod 4 (xmcp 1.x needs zod 3.25 or later, and on zod 3.25's types
the template's prompt fails to compile), and adds
the Worker's config, the monorepo wrapper, a test package and the deploy
contract. What the baseline adds is everything needed to make a copy of it
somebody else's — built the way
[cirrus-baseline](https://github.com/sourceplane/cirrus-baseline) is. See
[`specs/epics/xmcp-boilerplate`](specs/epics/xmcp-boilerplate/README.md) for
the design, the milestones and the as-built status.

## Instantiating a product

```bash
git clone --depth 1 --branch <baseline-tag> https://github.com/sourceplane/xmcp-boilerplate
cd xmcp-boilerplate
orun new --blueprint repo-blueprint.yaml --out ~/mcp/acme-mcp --run-hooks --resume \
  --set reponame=acme-mcp --set productname="Acme MCP" \
  --set githuborg=acme-inc --set subdomain=<workers-dev-subdomain>
```

Or, once the platform's registry lists it, from the Orun console (Baselines →
`xmcp-boilerplate` → Build). Two phases — `01-product` (the repository, its CI and
the whole server in one pull request, deployed to stage and prod by one
convergence, smoke-tested) and `02-docs` (the live deployment recorded) —
each landing one pull request in the new repository.
**[BOOTSTRAP.md](BOOTSTRAP.md)** is the operator guide;
[docs/phases/](docs/phases/README.md) has a page per phase.

The new repository receives the **server only** — the Worker, its tests, its
CI, its tooling, a README of its own, its operating contract and the
template's licence — renamed throughout to the server's name, repository and
Cloudflare Worker. None of this
repository's machinery ships, and nothing that ships names it.

| What makes it a baseline | Where |
|---|---|
| The console card (inputs, secrets, programme) | `blueprint.yaml` |
| The build document (modules, phases, hooks) | `repo-blueprint.yaml` |
| This tree's identity, and the bootstrap's task contracts | `.baseline/` |
| The rename engine | `tooling/rebrand/rebrand.mjs` |
| The bootstrap's helpers (deferrals, redeploy marker, work-tree strip) | `tooling/bootstrap/` |
| The deployment-record renderer | `hooks/render-deployment-docs.sh` |
| The server's README and context pack | `.baseline/product/README.md`, `ai/context/` |
| The baseline's tests: contract, leak, offline bootstrap, end to end | `testing/`, `.github/workflows/baseline.yml` |
| Cutting a `baseline-vN` tag | `.github/workflows/tag.yml` |

## What is here (the product)

| Surface | Where |
|---|---|
| The template's tool, prompt and resources — one file each, found by xmcp from their folders | `apps/api/src/{tools,prompts,resources}/` |
| xmcp's configuration (HTTP transport, the folders, the server's name) | `apps/api/xmcp.config.ts` |
| The Worker's entry: xmcp's build (`worker.js`) served with `/health` naming the server and its environment | `apps/api/src/worker.ts`, `apps/api/src/health.ts` |
| The server's name (the rename's seam; what `initialize`, the landing page's title and `/health` answer with) | `apps/api/src/identity.ts` |
| The template's licence (MIT, Vercel) | `apps/api/LICENSE.md` |
| Worker config (name, compatibility, per-environment vars) | `apps/api/wrangler.jsonc` |
| Deploy contract | `apps/api/component.yaml` (`cloudflare-worker-turbo`) |
| Tests | `tests/api` (vitest: the template's files called directly, the health check, and an MCP client's exchange with the built Worker in-process) |

## Getting started

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test             # builds the server first (xmcp build --cf), then the suite
pnpm build            # xmcp build --cf, then wrangler deploy --dry-run → apps/api/dist
```

Run it locally. `xmcp dev` is the template's own development server (Node,
reloading on save); `preview` builds the Worker and serves it under workerd:

```bash
pnpm --filter @app/api dev          # the template's: xmcp dev
pnpm --filter @app/api preview      # xmcp build --cf, then wrangler dev → http://localhost:8787
curl http://localhost:8787/health   # {"status":"ok",…,"name":"xmcp server","environment":"local"}
curl -X POST http://localhost:8787/mcp \
  -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

Add a tool by adding a file to `apps/api/src/tools/` (a `schema`, a
`metadata` and a default export, as `greet.ts` has); prompts and resources
the same way in their folders. Any MCP client connects to
`http://localhost:8787/mcp` (the MCP Inspector:
`npx @modelcontextprotocol/inspector`). `/mcp` is open, as the template has
it: add xmcp's auth (its middleware or an API key) before a tool does
anything a stranger should not.

## How it maps to Vercel

| Vercel | Here |
|---|---|
| `xmcp build` (xmcp 0.5) and Vercel's Node runtime serving `dist/http.js` | `xmcp build --cf` (xmcp 1.9): xmcp's own Cloudflare Worker (`worker.js`), deployed by wrangler with `nodejs_compat` |
| `pnpm start` → `node dist/http.js` | No Node server: the Worker is the server. `xmcp dev` stays for local development |
| xmcp's `/health` | Kept, with every field it answers, plus the server's name and the environment (`src/health.ts`), which the deploy smoke reads |
| The server named by xmcp's default ("xmcp server") | The same name, written once in `src/identity.ts` and handed to xmcp as `template.name`, so a product renames it in one line |
| `zod` 3.24.4 | zod 4 (xmcp 1.x imports `zod/v3`, which 3.24 lacks, and on zod 3.25's types the template's prompt schema fails to compile, TS2589) |
| `vc dev` · `vc build` · `vc deploy` | `xmcp dev` / `preview` · `xmcp build --cf && wrangler deploy --dry-run --outdir dist` · `wrangler deploy --env <stage\|prod>` |
| Deploy on push | Orun deploys `<repo>-api-{stage,prod}` on merge to `main` and smoke-tests `/health`, an MCP `initialize` and a `tools/call` of `greet` (`apps/api/component.yaml`) |
| "Deploy with Vercel" (clone the template) | `orun new --blueprint repo-blueprint.yaml` — a new repository, branded, deployed |

## CI

| Workflow | What it runs | Ships to a server |
|---|---|---|
| `ci.yml` | the Orun pipeline, and the only workflow a server carries: `orun plan --changed`, then one job per lane. A pull request runs the verify lanes (the Worker built, type-checked and dry-deployed per environment; the tests' `quick-check` lane installs and checks the package, it does not run them), except the bootstrap's own landings (`orun/BASE-*`), where `plan` alone is the check; a merge deploys stage → prod. It plans nothing while `intent.yaml` names the placeholder workspace `ws_CHANGE_ME`, as this repository does. A manual run (Orunbase's Deploy button, or Run workflow on `main`) plans the environment and components it names under the push-to-main trigger, so they deploy as a merge deploys them | yes |
| `baseline.yml` | the baseline's own tiers: contract tests, the blueprint read by the pinned orun, the leak gate, the offline bootstrap, the server built, dry-deployed, served and called by the MCP SDK's own client | no |
| `tag.yml` | cuts a `baseline-vN` tag (manual) | no |

## Credits

The server is Vercel's xmcp boilerplate
([vercel/examples](https://github.com/vercel/examples), `framework-boilerplates/xmcp`,
MIT — `apps/api/LICENSE.md`), built with [xmcp](https://github.com/basementstudio/xmcp).
