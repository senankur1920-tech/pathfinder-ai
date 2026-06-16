'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 to-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border border-border/80 bg-card/65 backdrop-blur-md rounded-2xl p-8 md:p-16 text-center flex flex-col items-center gap-6 relative shadow-2xl overflow-hidden"
        >
          {/* Inner mesh highlights */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-violet-500/5 to-pink-500/5 opacity-40 pointer-events-none" />

          {/* Sparkles icon */}
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl leading-tight">
            Ready to Discover Your Future Path?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl leading-relaxed">
            Create your account today to receive custom recommendations, college predictors, and roadmap progress tools.
          </p>

          {/* Form */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md mt-4 relative z-10">
            <input
              type="email"
              placeholder="Enter your school/college email"
              className="h-11 px-4 rounded-md border border-input bg-background/80 w-full text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all shadow-sm"
              required
            />
            <Button size="lg" className="h-11 bg-primary hover:bg-primary/95 text-white w-full sm:w-auto flex items-center justify-center gap-2 shadow-md">
              <span>Start Journey</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Info details */}
          <p className="text-xs text-muted-foreground mt-2">
            No credit card required &bull; Free forever for students
          </p>
        </motion.div>
      </div>
    </section>
  );
}
