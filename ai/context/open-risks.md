# xmcp-boilerplate — open risks

What is not yet proven or not yet decided. The full write-up of every risk,
including the accepted and resolved ones, is
`specs/epics/xmcp-boilerplate/risks-and-open-questions.md`; this page lists only what
is still live, so it should be short.

| ID | Risk | State | What closes it |
|---|---|---|---|
| XM-A | No live bootstrap yet: the repository created and linked, the deploy token minted, a real `wrangler deploy`, the smoke and the probes against workers.dev, and an MCP client connected to the deployed `/mcp` are all unproven | OPEN | One bootstrap from a tag against a workspace |
| XM-B | `src/worker.ts` serves the `worker.js` that `xmcp build --cf` writes, and relies on xmcp leaving the committed `wrangler.jsonc` alone; a release that changes either would break the Worker | WATCH | xmcp pinned exactly; the tests and the e2e on every bump |
| XM-E | `orun plan --changed` plans nothing for a push with no `before`; the first landing relies on merging into orun's seeded initial commit | WATCH | Confirmed by the first live bootstrap |

Accepted, and worth knowing before you change them: XM-C (zod 4, not the
template's 3.24.4), XM-D (`/mcp` is open: no authentication), XM-F
(wrangler's multi-environment warning on the local build), XM-G
(stack-tectonic 0.19.0), XM-H (xmcp's landing page loads Google Fonts), XM-I
(xmcp's one-line notice on its first request).
