'use client';

import Link from 'next/link';
import { Sparkles, GraduationCap, Award, FileText, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function QuickActions() {
  const actions = [
    {
      href: '/careers',
      icon: Sparkles,
      title: 'AI Career Matcher',
      description: 'Explore emerging career paths custom aligned to your PCM/PCB/Commerce stream.',
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      href: '/colleges',
      icon: GraduationCap,
      title: 'College Predictor',
      description: 'Find safe, moderate, and reach colleges based on exam ranks and category quotas.',
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
    {
      href: '/scholarships',
      icon: Award,
      title: 'Scholarship Finder',
      description: 'Discover regional state scholarship opportunities matching your profile.',
      color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
    },
    {
      href: '/resume',
      icon: FileText,
      title: 'Resume Analyzer',
      description: 'Check your ATS score and get AI tips to align your resume to tech/business roles.',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <Link key={act.href} href={act.href} className="group block">
            <Card className="hover:border-primary/40 transition-all duration-300 h-full hover:shadow-md hover:shadow-primary/5 cursor-pointer relative overflow-hidden">
              <CardHeader className="flex flex-row items-start gap-4 p-5">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${act.color} transition-transform group-hover:scale-105 duration-300`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-grow space-y-1 pr-6">
                  <CardTitle className="text-sm font-bold group-hover:text-primary transition-colors flex items-center gap-1">
                    <span>{act.title}</span>
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {act.description}
                  </CardDescription>
                </div>
                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </CardHeader>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
