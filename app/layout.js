import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import './globals.css';

export const metadata = {
  title: 'Agentic AI — an agent that drives real ML algorithms',
  description:
    'A Claude agent with MCP-shaped tools over hand-written machine-learning implementations: ' +
    'K2 Bayesian structure learning, naive Bayes, k-NN and decision trees. Every tool call is shown.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
      </body>
    </html>
  );
}
