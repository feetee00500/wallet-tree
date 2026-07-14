import type { Metadata } from 'next';
import { QueryClientProvider } from './query-client-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wallet Tree',
  description: 'Personal income and expense tracking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <QueryClientProvider>{children}</QueryClientProvider>
      </body>
    </html>
  );
}
