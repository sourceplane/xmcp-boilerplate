# xmcp-boilerplate — decisions

The choices that shape this repository, one line each, with where the full
reasoning lives. Superseded decisions stay listed, marked, so the history
reads in order.

| # | Decision | Why | Source |
|---|---|---|---|
| 1 | A plain Worker (`cloudflare-worker-turbo`), no adapter, no Durable Object | `xmcp build --cf` already emits a Workers module (`worker.js`), and its Streamable HTTP transport is stateless — no session — so nothing has to outlive a request | `specs/epics/xmcp-boilerplate/design.md` |
| 2 | xmcp 1.9.0, pinned exactly, with `@xmcp-dev/compiler` 1.9.0 | The template's 0.5 has no Cloudflare build; 1.1 added one and 1.8 fixed `build --cf`; an exact pin because `src/worker.ts` rests on the build's output shape | design.md, risk XM-B |
| 3 | zod 4, not the template's 3.24.4 | xmcp 1.x imports `zod/v3` (3.25+), and on zod 3.25's types the template's prompt fails to compile (TS2589); the template's files are unchanged on zod 4 | risk XM-C |
| 4 | The template's tool, prompt and resources kept byte for byte | They are the template; xmcp finds them by folder as it did on Vercel | IMPLEMENTATION-STATUS |
| 5 | A three-line entry (`src/worker.ts`) over xmcp's `worker.js`, adding the server's name and environment to `/health` | The deploy smoke and the bootstrap's probes must see WHICH environment answered; xmcp's own `/health` does not say, and every one of its fields is kept | design.md, `apps/api/src/health.ts` |
| 6 | One name seam (`apps/api/src/identity.ts`), handed to xmcp as `template.name` | `initialize`, the landing page's title and `/health` all answer with it, and the rename has one line to change; it spells xmcp's default, so the template's behaviour is unchanged | `apps/api/xmcp.config.ts` |
| 7 | `wrangler.jsonc` is committed, not rendered (and not xmcp's generated one) | The Worker binds nothing; xmcp writes a config only when there is none, so the committed one stands and the lane's structure check finds it before any build | design.md, `apps/api/component.yaml` |
| 8 | The build output (`worker.js`, `.xmcp/`) is a turbo output, never committed | A cache hit must restore the Worker the deploy bundles; a committed build would drift from the files | `turbo.json`, `.gitignore` |
| 9 | The smoke makes an MCP `initialize` and a `tools/call` of `greet` after `/health` | The MCP calls prove the server, not just the Worker, answers | `apps/api/component.yaml` |
| 10 | One landing (`01-product`) then the record (`02-docs`) | A landing has a fixed cost; the plan, not the phases, carries deploy order (cirrus-baseline since baseline-v22) | `repo-blueprint.yaml` |
| 11 | `ci.yml` plans nothing while `intent.yaml` names `ws_CHANGE_ME` | A bootstrap cannot set a repository variable | hono-api's design |
| 12 | stack-tectonic 0.19.0 | The family's one pin (risk XM-G) | risks-and-open-questions.md |
| 13 | `subdomain` is read from the Cloudflare connection, never asked; the console asks for no domain | It belongs to the account; a domain is an owner's step after the bootstrap | `blueprint.yaml` |
| 14 | No authentication in front of `/mcp` | The template has none, and what it serves is public; an owner adds xmcp's auth before a tool does anything private (risk XM-D) | operations.md |
