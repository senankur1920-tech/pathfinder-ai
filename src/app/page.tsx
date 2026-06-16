import Navbar from '@/components/layout/navbar';
import Hero from '@/components/landing/hero';
import FeaturesBento from '@/components/landing/features-bento';
import HowItWorks from '@/components/landing/how-it-works';
import StatsCounter from '@/components/landing/stats-counter';
import Testimonials from '@/components/landing/testimonials';
import CTASection from '@/components/landing/cta-section';
import Footer from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <FeaturesBento />
        <HowItWorks />
        <StatsCounter />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
