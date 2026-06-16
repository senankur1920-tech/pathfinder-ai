'use client';

import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

export default function GreetingHeader() {
  const [name, setName] = useState('Student');
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    // 1. Get profile name
    const raw = localStorage.getItem('student_profile');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.name) setName(parsed.name.split(' ')[0]);
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Time based greeting
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Good morning');
    else if (hours < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6 mb-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {greeting}, <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">{name}</span> 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back to PathFinder AI. Let&apos;s check your career matching progress.
        </p>
      </div>

      <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-card/50 text-xs font-semibold text-muted-foreground w-fit shadow-sm">
        <Calendar className="h-4 w-4 text-primary" />
        <span>{todayStr}</span>
      </div>
    </div>
  );
}
