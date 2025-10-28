import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ASAgents - Construction Management Platform',
  description: 'Your all-in-one employee portal for seamless company communication, scheduling, policy access, and support.',
  keywords: 'construction, management, platform, ASAgents, cladding, roofing',
  authors: [{ name: 'Adrian Stanca', url: 'https://asagents.co.uk' }],
  creator: 'Adrian Stanca',
  publisher: 'AS Cladding & Roofing Ltd',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://asagents.co.uk'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://asagents.co.uk',
    title: 'ASAgents - Construction Management Platform',
    description: 'Your all-in-one employee portal for seamless company communication, scheduling, policy access, and support.',
    siteName: 'ASAgents',
    images: [
      {
        url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1320206f2_logo.png',
        width: 1200,
        height: 630,
        alt: 'ASAgents Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ASAgents - Construction Management Platform',
    description: 'Your all-in-one employee portal for seamless company communication, scheduling, policy access, and support.',
    images: ['https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1320206f2_logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1320206f2_logo.png',
    shortcut: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1320206f2_logo.png',
    apple: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1320206f2_logo.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ASAgents" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        <div id="root" className="h-full">
          {children}
        </div>
      </body>
    </html>
  );
}
