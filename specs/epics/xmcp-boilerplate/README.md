# xmcp-boilerplate — Vercel's xmcp boilerplate on Cloudflare Workers

**The template is an MCP server written as files — one tool, one prompt, two
resources, each a file xmcp finds by its folder — and xmcp has its own
Cloudflare build, so the port is where it runs: `xmcp build --cf` compiles the
template's files, unchanged, into one plain, stateless Cloudflare Worker,
deployed by Orun to stage and prod on every merge — and the baseline that
makes a copy of it somebody else's server in one landing.**

| | |
|---|---|
| Status | ✅ Shipped (`baseline-v1`) — proven offline in Baseline CI; not yet live (risk XM-A) |
| Upstream | [vercel/examples `framework-boilerplates/xmcp`](https://github.com/vercel/examples/tree/main/framework-boilerplates/xmcp) (MIT), at `de86723` (2026-10-16) |
| Reference | [hono-mcp](https://github.com/sourceplane/hono-mcp) — the same plain MCP Worker, scaffolding, tests and bootstrap |
| Key | `XM` |

## Read in this order

1. [design.md](design.md) — the template, how each Vercel piece maps to
   Cloudflare, the repository and the build, and the alternatives rejected.
2. [implementation-plan.md](implementation-plan.md) — the milestones and
   what each one lands.
3. [risks-and-open-questions.md](risks-and-open-questions.md) — what is not
   proven, and what was accepted.
4. [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md) — what shipped, and
   every departure from the upstream template.

## Milestones

| Milestone | What it lands | Task |
|---|---|---|
| XM0 — the spec | the repository, its intent, CI, tooling and spec index; this doc set | XM-1 |
| XM1 — the MCP server on Workers | the template in `apps/api`, built by `xmcp build --cf` into one plain Worker, its tests, the README | XM-2 |
| XM2 — a baseline | the console card, the build document, the context pack and the baseline's tests | XM-3 |
