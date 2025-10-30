/**
 * Root Layout - Next.js 16+ App Directory
 * Main application layout with providers and global styles
 */

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CortexBuild - Quantum Intelligence Platform',
  description: 'Advanced AI-powered construction management platform with quantum computing capabilities',
  keywords: ['AI', 'construction', 'quantum computing', 'project management'],
  authors: [{ name: 'CortexBuild Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
