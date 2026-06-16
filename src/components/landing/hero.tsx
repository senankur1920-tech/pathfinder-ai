'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, ArrowRight, Play, GraduationCap, Award, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden gradient-mesh">
      {/* Background radial highlight */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-60">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center flex flex-col items-center gap-6"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Trusted by 10,000+ students across India</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-sans text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.05]"
          >
            Your AI Career GPS — <br />
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
              From Confusion to Clarity
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed mt-2"
          >
            Discover suitable careers, predict college admissions, find regional scholarships, and build skill roadmaps — all powered by AI that understands the Indian education system.
          </motion.p>

          {/* Actions */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto"
          >
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="bg-primary hover:bg-primary/95 text-white w-full sm:w-auto shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 group">
                <span>Get Started Free</span>
                <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-2">
              <Play className="h-4.5 w-4.5 text-primary fill-primary/10" />
              <span>Watch Demo</span>
            </Button>
          </motion.div>

          {/* Mock Dashboard Preview */}
          <motion.div
            variants={itemVariants}
            className="w-full max-w-5xl mt-16 rounded-xl border border-border bg-card/45 backdrop-blur-md shadow-2xl overflow-hidden animate-float relative"
          >
            {/* Window bar */}
            <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="h-3.5 w-3.5 rounded-full bg-rose-500/80" />
                <div className="h-3.5 w-3.5 rounded-full bg-amber-500/80" />
                <div className="h-3.5 w-3.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="text-xs text-muted-foreground font-mono">pathfinder-ai.in/dashboard</div>
              <div className="w-14" />
            </div>

            {/* Dashboard Mock Body */}
            <div className="p-6 md:p-8 bg-background/50 text-left grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Quick Profile */}
              <div className="md:col-span-1 border border-border/80 bg-card rounded-lg p-5 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold">AS</div>
                  <div>
                    <h3 className="font-semibold text-sm">Aarav Sharma</h3>
                    <p className="text-xs text-muted-foreground">Class 12, PCM (General)</p>
                  </div>
                </div>
                <div className="border-t border-border pt-4 flex flex-col gap-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">JEE Mains Target:</span>
                    <span className="font-semibold">98.5 Percentile</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Interest Areas:</span>
                    <span className="font-semibold text-primary">AI, Cloud Systems</span>
                  </div>
                </div>
                <div className="mt-2 rounded-md bg-secondary/50 p-3 flex flex-col gap-1.5 border border-border/40">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Profile Status</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Onboarding Complete</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-medium">100%</span>
                  </div>
                </div>
              </div>

              {/* Right Columns: Insights */}
              <div className="md:col-span-2 flex flex-col gap-6">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="border border-border/80 bg-card p-4 rounded-lg flex flex-col gap-1 shadow-sm">
                    <GraduationCap className="h-5 w-5 text-indigo-500" />
                    <span className="text-xs text-muted-foreground mt-1">Colleges Safe</span>
                    <span className="text-lg font-bold text-foreground">12 NITs/IIITs</span>
                  </div>
                  <div className="border border-border/80 bg-card p-4 rounded-lg flex flex-col gap-1 shadow-sm">
                    <Award className="h-5 w-5 text-indigo-500" />
                    <span className="text-xs text-muted-foreground mt-1">Scholarships</span>
                    <span className="text-lg font-bold text-foreground">8 Eligible</span>
                  </div>
                  <div className="border border-border/80 bg-card p-4 rounded-lg flex flex-col gap-1 shadow-sm">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    <span className="text-xs text-muted-foreground mt-1">Resume Score</span>
                    <span className="text-lg font-bold text-foreground">78 / 100</span>
                  </div>
                </div>

                {/* Recommendations mockup */}
                <div className="border border-border/80 bg-card rounded-lg p-5 flex flex-col gap-3.5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Top AI Career Matches</h4>
                    <span className="text-[10px] text-primary font-semibold hover:underline cursor-pointer">View All</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between p-2.5 rounded-md hover:bg-secondary/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold bg-indigo-500/10 text-indigo-500 h-6 w-6 rounded-full flex items-center justify-center">1</span>
                        <div>
                          <p className="text-xs font-medium">Machine Learning Engineer</p>
                          <p className="text-[10px] text-muted-foreground">High growth, matches interest in Math</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-500">96% Fit</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-md hover:bg-secondary/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold bg-indigo-500/10 text-indigo-500 h-6 w-6 rounded-full flex items-center justify-center">2</span>
                        <div>
                          <p className="text-xs font-medium">Software Systems Architect</p>
                          <p className="text-[10px] text-muted-foreground">High package, matches B.Tech CSE track</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-500">92% Fit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
