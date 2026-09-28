/**
 * Private-link access for live runs.
 *
 * The page is public and crawlable; it shows a recorded run. Running the agent is not
 * public: it needs an invite, handed out as a link (/i/<token>). Opening the link sets an
 * httpOnly cookie and redirects to the page, so the person it was sent to never logs in
 * or types anything.
 *
 *   INVITE_TOKENS="label:token,label2:token2"
 *
 * The label is only for the logs, so you can tell which link was used. Revoking a link
 * means removing its entry and redeploying. Without INVITE_TOKENS nothing is invited
 * and the API stays hidden.
 */
import { timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const INVITE_COOKIE = 'invite';
export const INVITE_MAX_AGE = 60 * 60 * 24 * 60;   // 60 days

function invites() {
  return (process.env.INVITE_TOKENS ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(entry => {
      const i = entry.indexOf(':');
      return i < 0 ? { label: 'invite', token: entry } : { label: entry.slice(0, i), token: entry.slice(i + 1) };
    })
    .filter(x => x.token.length >= 16);   // refuse guessable tokens rather than trust them
}

/** The label of the invite this token belongs to, or null. */
export function findInvite(token) {
  if (!token) return null;
  const given = Buffer.from(String(token));
  for (const { label, token: known } of invites()) {
    const want = Buffer.from(known);
    if (given.length === want.length && timingSafeEqual(given, want)) return label;
  }
  return null;
}

/** The invite on the current request's cookie, or null. For pages and route handlers. */
export async function currentInvite() {
  const jar = await cookies();
  return findInvite(jar.get(INVITE_COOKIE)?.value);
}

/**
 * The invite on a request from either kind of caller: a browser carries it in the cookie,
 * an MCP client such as Claude Code sends it as `Authorization: Bearer <token>`.
 */
export async function requestInvite(req) {
  const auth = req.headers.get('authorization') ?? '';
  if (auth.startsWith('Bearer ')) return findInvite(auth.slice(7).trim());
  return currentInvite();
}

/** What an uninvited caller gets from the API: the same as a route that doesn't exist. */
export const hidden = () => new Response('Not Found', { status: 404 });
