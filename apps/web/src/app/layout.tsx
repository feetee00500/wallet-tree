import type { Metadata } from 'next';
import { QueryClientProvider } from './query-client-provider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Wallet Tree',
    template: '%s · Wallet Tree',
  },
  description: 'ติดตามรายรับรายจ่ายและสร้างวินัยการเงินผ่าน LINE',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="bg-canvas">
      <body className="min-h-screen">
        <QueryClientProvider>{children}</QueryClientProvider>
      </body>
    </html>
  );
}
