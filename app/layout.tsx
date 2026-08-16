import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Suyash Singh — AI Digital Twin | Realtime Voice & Verified Portfolio',
  description:
    'Meet Suyash Singh’s AI digital twin. Have a live voice conversation about his engineering projects (PathFlow, Semantic LLM Gateway), research at ICDDS 2025, technical stack, and internships with 100% grounded source citations.',
  keywords: [
    'Suyash Singh',
    'AI Digital Twin',
    'PathFlow',
    'Omnisavant',
    'LiveKit Voice Agent',
    'AI Agent Observability',
    'ICDDS 2025',
    'Semantic LLM Gateway',
    'Full Stack Engineer',
  ],
  authors: [{ name: 'Suyash Singh', url: 'https://github.com/anothercodingguy' }],
  openGraph: {
    title: 'Suyash Singh — AI Digital Twin',
    description:
      'Conversational AI Digital Twin powered by LiveKit and grounded in verified resume sources with real-time citations.',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Suyash Singh — AI Digital Twin',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Suyash Singh — AI Digital Twin',
    description:
      'Realtime voice conversation with Suyash Singh’s AI digital twin with 100% grounded citations.',
    images: ['/og-image.png'],
  },
};

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <body className="bg-[var(--bg)] text-[var(--text-primary)] min-h-screen selection:bg-[var(--selection)]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
