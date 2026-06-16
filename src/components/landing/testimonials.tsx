'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Aarav Sharma',
      role: 'Class 12 Student • JEE Aspirant',
      quote: "JoSAA counseling was incredibly confusing. PathFinder predicted my admission to NIT Raipur CSE perfectly. The career matcher also opened my eyes to Product Management.",
      rating: 5,
    },
    {
      name: 'Priya Patel',
      role: 'Class 12 Commerce • CUET Aspirant',
      quote: "Coming from a lower-income home, I didn't know about government scholarships. The scholarship matcher instantly identified three schemes. I saved over ₹60,000 in tuition fees!",
      rating: 5,
    },
    {
      name: 'Rahul Verma',
      role: 'B.Tech Mechanical Graduate',
      quote: "I wanted to switch to Data Science but had no roadmap. The AI skill builder gave me a week-by-week checklist. Combined with the resume analyzer, I landed an internship in 4 months.",
      rating: 5,
    },
    {
      name: 'Meera Iyer',
      role: 'Class 11 PCB Student • Chennai',
      quote: "NEET prep is stressful. PathFinder mapped out medical backup plans (B.Pharm, Biotechnology) that aligned with my interests. Highly recommend for peace of mind.",
      rating: 5,
    },
    {
      name: 'Vikram Singh',
      role: 'Parent of Class 10 Student',
      quote: "Excellent tool for parents. It explained emerging fields like Machine Learning and UI/UX design with earning trends, making it easy for us to support our son's choices.",
      rating: 5,
    },
    {
      name: 'Ananya Gupta',
      role: 'B.Sc Computer Science Student',
      quote: "The resume analyzer is top-notch. It highlighted exactly which keywords were missing for frontend developer roles. My resume score went from 52 to 81, and I got 3 callbacks.",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-24 bg-secondary/15 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-primary mb-3">Testimonials</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Loved by Students and Parents
          </p>
          <p className="text-muted-foreground mt-4 text-base sm:text-lg">
            Hear from users who mapped their educational milestones with PathFinder AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="border border-border bg-card/50 glass rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all duration-300"
            >
              {/* Quote Icon Background */}
              <Quote className="absolute -right-2 -top-2 h-24 w-24 text-primary/[0.03] rotate-12 pointer-events-none" />

              <div>
                {/* Rating */}
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
                  ))}
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground italic mb-6">
                  &ldquo;{test.quote}&rdquo;
                </p>
              </div>

              <div className="border-t border-border/80 pt-4 mt-auto">
                <h4 className="font-bold text-sm text-foreground">{test.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{test.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
