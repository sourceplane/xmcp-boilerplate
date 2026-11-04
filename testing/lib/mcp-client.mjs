#!/usr/bin/env node
// A real MCP client exchange against a served Worker — the e2e's proof that
// the server a bootstrap produces speaks MCP, not just that /mcp answers 200.
//
//   node testing/lib/mcp-client.mjs <base-url> <expected-server-name> <sdk-dir>
//
// The client is the MCP SDK's own (`Client` over `StreamableHTTPClientTransport`),
// loaded from <sdk-dir>'s dependencies (tests/api, whose suite drives the same
// exchange in-process), so the handshake is the one any MCP client makes:
// initialize, then the initialized notification, then everything the
// template's files offer — tools/list and a tools/call of its tool,
// prompts/list and prompts/get of its prompt, resources/list, the resource
// templates, and a resources/read of each. It prints one line on success and
// exits non-zero naming the first thing that was wrong.
import { createRequire } from "node:module";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

const [base, expectedName, sdkDir] = process.argv.slice(2);
if (!base || !expectedName || !sdkDir) {
  console.error("usage: mcp-client.mjs <base-url> <expected-server-name> <sdk-dir>");
  process.exit(2);
}

const require = createRequire(path.join(path.resolve(sdkDir), "package.json"));
const load = async (spec) => import(pathToFileURL(require.resolve(spec)).href);
const { Client } = await load("@modelcontextprotocol/sdk/client/index.js");
const { StreamableHTTPClientTransport } = await load("@modelcontextprotocol/sdk/client/streamableHttp.js");

function fail(message) {
  console.error(`  ✕ ${message}`);
  process.exit(1);
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const client = new Client({ name: "xmcp-boilerplate-e2e", version: "1.0.0" });
const transport = new StreamableHTTPClientTransport(new URL("/mcp", base));
try {
  await client.connect(transport);
} catch (error) {
  fail(`initialize failed: ${error?.message ?? error}`);
}

const server = client.getServerVersion();
if (server?.name !== expectedName) fail(`the server names itself ${JSON.stringify(server?.name)}, not ${JSON.stringify(expectedName)}`);
const caps = client.getServerCapabilities() ?? {};
for (const cap of ["tools", "prompts", "resources"]) if (!caps[cap]) fail(`the server does not offer ${cap}`);
// Stateless: the server issues no session id, so any isolate answers any call.
if (transport.sessionId !== undefined) fail(`the server issued a session id (${transport.sessionId}); it is meant to be stateless`);

const { tools } = await client.listTools();
const toolNames = tools.map((t) => t.name);
if (!same(toolNames, ["greet"])) fail(`tools/list answered ${JSON.stringify(toolNames)}`);
const greeting = (await client.callTool({ name: "greet", arguments: { name: "Ada" } })).content?.[0]?.text;
if (greeting !== "Hello, Ada!!") fail(`tools/call greet answered ${JSON.stringify(greeting)}`);

const { prompts } = await client.listPrompts();
if (!same(prompts.map((p) => p.name), ["review-code"])) fail(`prompts/list answered ${JSON.stringify(prompts.map((p) => p.name))}`);
const prompt = await client.getPrompt({ name: "review-code", arguments: { code: "let x = 1" } });
const promptText = prompt.messages?.[0]?.content?.text ?? "";
if (prompt.messages?.[0]?.role !== "user" || !promptText.includes("Please review this code for:") || !promptText.includes("let x = 1")) {
  fail(`prompts/get review-code answered ${JSON.stringify(prompt).slice(0, 200)}`);
}

const { resources } = await client.listResources();
if (!same(resources.map((r) => r.uri), ["config://app"])) fail(`resources/list answered ${JSON.stringify(resources.map((r) => r.uri))}`);
const { resourceTemplates } = await client.listResourceTemplates();
if (!same(resourceTemplates.map((r) => r.uriTemplate), ["users://{userId}"])) {
  fail(`resources/templates/list answered ${JSON.stringify(resourceTemplates.map((r) => r.uriTemplate))}`);
}
const reads = [
  ["config://app", "App configuration here"],
  ["users://42", "Profile data for user 42"],
];
for (const [uri, want] of reads) {
  const text = (await client.readResource({ uri })).contents?.[0]?.text;
  if (text !== want) fail(`resources/read ${uri} answered ${JSON.stringify(text)}, not ${JSON.stringify(want)}`);
}

await client.close();
console.log(
  `   an MCP client: initialize (${server.name} ${server.version}, no session), tools/list + tools/call (greet), ` +
    `prompts/list + prompts/get (review-code), resources/list + templates + ${reads.length} resources/read`,
);
