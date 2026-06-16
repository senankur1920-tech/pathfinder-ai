'use client';

import Link from 'next/link';
import { Sparkles, Quote } from 'lucide-react';
import { useEffect, useState } from 'react';

const quotes = [
  {
    text: "JoSAA counseling was incredibly confusing. PathFinder predicted my admission to NIT Raipur CSE perfectly.",
    author: "Aarav Sharma, Class 12 PCM",
  },
  {
    text: "The scholarship matcher instantly identified three schemes. I saved over ₹60,000 in tuition fees!",
    author: "Priya Patel, Class 12 Commerce",
  },
  {
    text: "The AI skill builder gave me a week-by-week checklist. Combined with the resume analyzer, I landed an internship in 4 months.",
    author: "Rahul Verma, B.Tech Graduate",
  },
];

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-background">
      {/* Left panel (branding) - hidden on mobile */}
      <div className="hidden lg:flex lg:col-span-5 relative overflow-hidden bg-slate-950 p-12 flex-col justify-between text-white gradient-mesh border-r border-border/10">
        {/* Subtle mesh background cover */}
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] z-0" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-sans text-xl font-bold tracking-tight">
              PathFinder <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">AI</span>
            </span>
          </Link>
        </div>

        {/* Dynamic testimonial showcase */}
        <div className="relative z-10 max-w-sm mb-10 transition-all duration-500">
          <Quote className="h-10 w-10 text-primary/30 mb-5" />
          <p className="text-lg leading-relaxed text-slate-300 font-medium italic transition-all duration-500">
            &ldquo;{quotes[quoteIdx].text}&rdquo;
          </p>
          <p className="text-xs font-semibold text-primary mt-4 uppercase tracking-wider">
            {quotes[quoteIdx].author}
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          &copy; 2026 PathFinder AI. All rights reserved. &bull; Made with &hearts; for Indian students.
        </div>
      </div>

      {/* Right panel (form container) */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 md:p-12 relative overflow-y-auto min-h-screen">
        {/* Mobile Header branding */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-sans text-lg font-bold tracking-tight">
              PathFinder <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">AI</span>
            </span>
          </Link>
        </div>

        <div className="w-full flex justify-center py-12 lg:py-0">
          {children}
        </div>
      </div>
    </div>
  );
}
