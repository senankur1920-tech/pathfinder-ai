'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function ProfileCompleteness() {
  const [percentage, setPercentage] = useState(60);
  const [missingItems, setMissingItems] = useState<string[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('student_profile');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const missing: string[] = [];
        let score = 40; // Base score for creating account

        if (parsed.name) score += 15;
        else missing.push('Add full name');

        if (parsed.score10 || parsed.score12) score += 15;
        else missing.push('Fill in academic marks');

        if (parsed.exams && parsed.exams.length > 0) score += 15;
        else missing.push('Add entrance exam scores');

        if (parsed.interests && parsed.interests.length > 0) score += 15;
        else missing.push('Choose interest areas');

        setPercentage(Math.min(score, 100));
        setMissingItems(missing);
      } catch (e) {
        console.error(e);
      }
    } else {
      setMissingItems(['Complete onboarding registration']);
    }
  }, []);

  return (
    <div className="border border-border/80 bg-card rounded-xl p-5 md:p-6 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <UserCheck className="h-4.5 w-4.5 text-primary" />
          <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">Profile Completeness</h3>
        </div>
        <span className="text-xs font-extrabold text-primary">{percentage}%</span>
      </div>

      <div className="space-y-3">
        <Progress value={percentage} className="h-2" />

        {percentage === 100 ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs mt-2">
            <CheckCircle2 className="h-4.5 w-4.5 flex-shrink-0" />
            <span>Awesome! Your profile is complete. AI matching is highly optimized.</span>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              <span>Complete these to optimize AI accuracy:</span>
            </p>
            <ul className="flex flex-col gap-1.5 pl-5 list-disc text-[11px] text-muted-foreground">
              {missingItems.map((item, idx) => (
                <li key={idx}>
                  <Link href="/settings" className="hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
