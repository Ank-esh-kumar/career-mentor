import Navbar from '../../components/layout/Navbar';
import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';
import CareerCategories from './CareerCategories';
import Testimonials from './Testimonials';
import Statistics from './Statistics';
import FAQ from './FAQ';
import Pricing from './Pricing';
import Team from './Team';
import CTA from './CTA';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface overflow-hidden">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CareerCategories />
      <Statistics />
      <Testimonials />
      <Pricing />
      <Team />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
