import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PathFinder AI — Your AI Career GPS',
  description: 'AI-powered platform to help Indian students discover careers, colleges, scholarships, and skill roadmaps based on interests, academics, and entrance exams.',
  openGraph: {
    title: 'PathFinder AI — Your AI Career GPS',
    description: 'AI-powered platform to help Indian students discover careers, colleges, scholarships, and skill roadmaps.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
