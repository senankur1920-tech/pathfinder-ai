'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, GraduationCap, Coins, TrendingUp } from 'lucide-react';

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>;
  targetValue: number;
  label: string;
  suffix: string;
  prefix?: string;
  delay?: number;
}

function StatCard({ icon: Icon, targetValue, label, suffix, prefix = '', delay = 0 }: StatItemProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 2000; // 2 seconds
    const intervalTime = 30; // 30ms step
    const steps = duration / intervalTime;
    const increment = targetValue / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetValue) {
        setValue(targetValue);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isInView, targetValue]);

  return (
    <div
      ref={ref}
      className="border border-border/80 bg-card/45 backdrop-blur-sm rounded-xl p-6 md:p-8 flex flex-col items-center justify-center text-center shadow-sm"
    >
      <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center mb-4 border border-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <span className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent mb-1.5">
        {prefix}
        {value.toLocaleString('en-IN')}
        {suffix}
      </span>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

export default function StatsCounter() {
  const stats = [
    {
      icon: Users,
      targetValue: 10000,
      label: 'Students Guided',
      suffix: '+',
    },
    {
      icon: GraduationCap,
      targetValue: 500,
      label: 'Colleges Mapped',
      suffix: '+',
    },
    {
      icon: Coins,
      targetValue: 50,
      label: 'Scholarships Found',
      suffix: 'Cr+',
      prefix: '₹',
    },
    {
      icon: TrendingUp,
      targetValue: 95,
      label: 'Recommendation Accuracy',
      suffix: '%',
    },
  ];

  return (
    <section className="py-20 bg-secondary/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <StatCard
              key={idx}
              icon={stat.icon}
              targetValue={stat.targetValue}
              label={stat.label}
              suffix={stat.suffix}
              prefix={stat.prefix}
              delay={idx * 0.15}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
