import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { toolManifest, runTool } from '@/lib/tools/registry.js';
import { requestInvite, hidden } from '@/lib/invite.js';

export const runtime = 'nodejs';

// The MCP server: the same tools the agent uses, over Streamable HTTP. Two kinds of client
// connect here: the agent in app/api/agent (with the visitor's invite cookie) and any
// outside MCP client such as Claude Code (with the invite token as a bearer token).
//
// Stateless on purpose: a serverless function keeps nothing between requests, so each
// request gets a fresh server and transport, and replies come back as plain JSON.
function createServer() {
  const server = new Server({ name: 'agenticai', version: '0.1.0' }, { capabilities: { tools: {} } });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: toolManifest() }));

  server.setRequestHandler(CallToolRequestSchema, async ({ params }) => {
    try {
      const output = await runTool(params.name, params.arguments ?? {});
      return { content: [{ type: 'text', text: JSON.stringify(output) }] };
    } catch (e) {
      return { content: [{ type: 'text', text: String(e.message ?? e) }], isError: true };
    }
  });

  return server;
}

async function handle(req) {
  if (!await requestInvite(req)) return hidden();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await createServer().connect(transport);
  return transport.handleRequest(req);
}

export { handle as GET, handle as POST, handle as DELETE };
