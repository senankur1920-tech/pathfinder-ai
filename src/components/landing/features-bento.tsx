'use client';

import { motion } from 'framer-motion';
import { Target, GraduationCap, Award, Map, FileText, ArrowRight } from 'lucide-react';

export default function FeaturesBento() {
  const features = [
    {
      icon: Target,
      title: 'AI Career Matcher',
      description: 'Find optimal careers based on personality profiling, academic history, and interest maps analyzed by Gemini 1.5 Pro.',
      className: 'md:col-span-1',
      bgGrad: 'from-blue-500/10 to-indigo-500/10 hover:border-indigo-500/40',
    },
    {
      icon: GraduationCap,
      title: 'College Admission Predictor',
      description: 'Input your JEE, NEET, or CUET ranks to dynamically check safe, moderate, and reach options with cutoffs and placements.',
      className: 'md:col-span-1',
      bgGrad: 'from-indigo-500/10 to-purple-500/10 hover:border-purple-500/40',
    },
    {
      icon: Award,
      title: 'Scholarship Finder',
      description: 'Auto-discover government and private scholarship opportunities based on caste, family income, merit, and state quota eligibility.',
      className: 'md:col-span-1',
      bgGrad: 'from-purple-500/10 to-pink-500/10 hover:border-pink-500/40',
    },
    {
      icon: Map,
      title: 'Personalized Skill Roadmaps',
      description: 'Close the gap between college and market demands. Get interactive week-by-week learning paths complete with curated free study resources, courses, and project milestones.',
      className: 'md:col-span-2',
      bgGrad: 'from-pink-500/10 to-rose-500/10 hover:border-rose-500/40',
      action: 'Try roadmap builder',
    },
    {
      icon: FileText,
      title: 'ATS Resume Review',
      description: 'Upload your resume to receive an instant ATS score, missing keyword gaps, and prioritized feedback to grab recruiters attention.',
      className: 'md:col-span-1',
      bgGrad: 'from-rose-500/10 to-blue-500/10 hover:border-blue-500/40',
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <section id="features" className="py-24 bg-secondary/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-primary mb-3">Core Engine</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Everything you need to navigate the Indian educational landscape.
          </p>
          <p className="text-muted-foreground mt-4 text-base sm:text-lg">
            Stop searching across outdated forums and generic portals. Get personalized, data-backed insights immediately.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={cardVariants}
                className={`group border border-border bg-card/60 backdrop-blur-sm rounded-xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 ${feature.className}`}
              >
                <div>
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-tr ${feature.bgGrad} flex items-center justify-center border border-border/60 transition-transform group-hover:scale-105 duration-300`}>
                    <Icon className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold mt-5 mb-2.5 tracking-tight group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                {feature.action && (
                  <div className="flex items-center gap-2 mt-6 text-sm font-semibold text-primary cursor-pointer group-hover:underline">
                    <span>{feature.action}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
