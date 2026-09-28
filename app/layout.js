import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import ThemeRegistry from './ThemeRegistry';
import './globals.css';

export const metadata = {
  title: 'Agentic AI — an agent that drives real ML algorithms',
  description:
    'A Claude agent using tools served over MCP: classic machine-learning algorithms, following Weka ' +
    'and the original papers: K2 Bayesian structure learning, naive Bayes, k-NN and decision trees. ' +
    'Every tool call is shown.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Sets the scheme before first paint, so there is no light flash on a dark OS. */}
        <InitColorSchemeScript attribute="data-mui-color-scheme" defaultMode="system" />
        <AppRouterCacheProvider>
          <ThemeRegistry>{children}</ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
