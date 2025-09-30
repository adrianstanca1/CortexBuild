import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import ErrorBoundary from "../components/ErrorBoundary";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Monaco", "Consolas", "monospace"]
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Monaco", "Consolas", "monospace"]
});

export const metadata: Metadata = {
  title: "Open Lovable v2",
  description: "Re-imagine any website in seconds with AI-powered website builder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${robotoMono.variable} font-sans`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
