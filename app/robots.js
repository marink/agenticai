// The page is meant to be found; the API, the MCP server and invite links are not.
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/i/', '/mcp'] },
  };
}
