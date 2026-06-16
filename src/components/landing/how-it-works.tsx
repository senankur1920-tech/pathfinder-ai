'use client';

import { motion } from 'framer-motion';
import { UserPlus, BrainCircuit, Compass } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      step: '01',
      title: 'Create Your Profile',
      description: 'Fill out details about your stream, marks, target exams (JEE, CUET, etc.), category, and broad interest zones.',
    },
    {
      icon: BrainCircuit,
      step: '02',
      title: 'AI Curation Engine',
      description: 'Our system parses your data, checks regional cutoff matrices, eligibility metrics, and matches your skills.',
    },
    {
      icon: Compass,
      step: '03',
      title: 'Navigate Your Path',
      description: 'Interact with recommendations, check predicted options, lock scholarships, and follow custom roadmap tasks.',
    },
  ];

  const lineVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { duration: 1.2, ease: 'easeInOut' },
    },
  };

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-primary mb-3">Onboarding</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            How PathFinder AI Guides You
          </p>
          <p className="text-muted-foreground mt-4 text-base sm:text-lg">
            A three-step approach to mapping out your educational and career choices.
          </p>
        </div>

        {/* Steps container */}
        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="absolute top-[52px] left-[15%] right-[15%] h-[2px] hidden md:block z-0 bg-border">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={lineVariants}
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 origin-left"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2, duration: 0.5 }}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Icon Node */}
                  <div className="h-[104px] w-[104px] rounded-full border border-border bg-card shadow-sm flex items-center justify-center relative transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/5">
                    <div className="h-16 w-16 rounded-full bg-secondary/80 flex items-center justify-center border border-border/40 group-hover:bg-primary/5 transition-colors">
                      <Icon className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    {/* Number Badge */}
                    <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 border-2 border-background text-white text-xs font-bold flex items-center justify-center">
                      {step.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mt-6 mb-3 tracking-tight group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
