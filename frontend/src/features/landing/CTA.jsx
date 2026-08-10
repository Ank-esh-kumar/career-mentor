import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function CTA() {
  const navigate = useNavigate();
  return (
    <section className="py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="relative rounded-3xl p-12 md:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-surface-card to-accent/10 rounded-3xl" />
          <div className="absolute inset-0 border border-primary/20 rounded-3xl" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold font-display text-white mb-4">
              Ready to Discover Your<br /><span className="gradient-text">Dream Career?</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto mb-8">
              Join thousands of professionals who transformed their careers with AI-powered guidance. Start your journey today — it&apos;s free.
            </p>
            <Button size="lg" icon={ArrowRight} iconRight onClick={() => navigate('/signup')}>
              Start Your Journey
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
