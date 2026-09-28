import { cookies, headers } from 'next/headers';
import Showcase from './Showcase';
import { currentInvite, INVITE_COOKIE } from '@/lib/invite.js';
import { toolManifest } from '@/lib/tools/registry.js';
import { LIMITS } from '@/lib/cap.js';
import recorded from '@/lib/recorded/eczema.json';

// Rendered on the server so the public page is complete for crawlers, and so whether
// the live runner exists at all is decided here, not by hiding it in the browser.
export default async function Home() {
  const invited = Boolean(await currentInvite());
  const tools = toolManifest().map(({ name, description }) => ({ name, description }));

  // For an invited visitor only: how to reach the MCP server from their own agent. The
  // token is the one already in their cookie, so nothing new is revealed to them.
  let connect = null;
  if (invited) {
    const h = await headers();
    const proto = h.get('x-forwarded-proto') ?? 'http';
    const token = (await cookies()).get(INVITE_COOKIE).value;
    connect = { url: `${proto}://${h.get('host')}/mcp`, token };
  }

  return (
    <Showcase
      recorded={recorded}
      tools={tools}
      live={invited}
      connect={connect}
      limits={{ maxSteps: LIMITS.maxSteps, maxTokensPerRun: LIMITS.maxTokensPerRun }}
    />
  );
}
