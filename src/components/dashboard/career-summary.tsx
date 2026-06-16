'use client';

import { Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CareerSummary() {
  const topMatches = [
    { name: 'Machine Learning Engineer', fit: 96, growth: 'Very High', field: 'Technology' },
    { name: 'Software Systems Architect', fit: 92, growth: 'High', field: 'Technology' },
    { name: 'Product Manager (Technical)', fit: 87, growth: 'High', field: 'Business/Tech' },
  ];

  return (
    <div className="border border-border/80 bg-card rounded-xl p-5 md:p-6 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-primary" />
          <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">Top AI Career Matches</h3>
        </div>
        <Link href="/careers" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
          <span>Explore All</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {topMatches.map((career, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-secondary/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold bg-indigo-500/10 text-indigo-500 h-6.5 w-6.5 rounded-full flex items-center justify-center border border-indigo-500/10">
                {idx + 1}
              </span>
              <div>
                <h4 className="text-xs font-semibold text-foreground">{career.name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
                  <span>{career.field}</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-0.5 text-indigo-500 font-medium">
                    <TrendingUp className="h-2.5 w-2.5" />
                    {career.growth} Demand
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-0.5">
              <span className="text-sm font-extrabold text-emerald-500">{career.fit}%</span>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Fit Score</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
