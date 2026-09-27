/** @type {import('next').NextConfig} */
const nextConfig = {
  // Deliberately NOT `output: 'export'`, unlike machinelearning.js.org: the agent
  // loop and the spend cap must run server-side. A static build would have to ship
  // the API key to the browser, where anyone can read it.
  //
  // Also no `trailingSlash` -- that is a static-hosting concern and it makes every
  // API call take a 308 redirect first.
  images: { unoptimized: true },
  agentRules: false,   // don't auto-generate CLAUDE.md / AGENTS.md into this repo
};
export default nextConfig;
