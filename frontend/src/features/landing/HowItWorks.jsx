import { motion } from 'framer-motion';
import { Upload, Brain, Sparkles, Rocket } from 'lucide-react';

const steps = [
  { icon: Upload, title: 'Upload Your Resume', description: 'Upload your resume or fill in your profile with skills, education, and experience.', step: '01' },
  { icon: Brain, title: 'AI Analyzes Your Profile', description: 'Our AI engine processes your data using advanced RAG to understand your unique strengths.', step: '02' },
  { icon: Sparkles, title: 'Get Personalized Insights', description: 'Receive career recommendations, skill gaps, and a customized learning roadmap.', step: '03' },
  { icon: Rocket, title: 'Launch Your Career', description: 'Follow your roadmap, track progress, and achieve your career goals step by step.', step: '04' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="section-title mb-4">How <span className="gradient-text">Career Mentor</span> Works</h2>
          <p className="section-subtitle mx-auto">Four simple steps to discover and launch your ideal career.</p>
        </motion.div>

        <div className="relative">
          {}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="relative inline-flex mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-surface-card border border-border flex items-center justify-center relative z-10">
                    <step.icon size={32} className="text-primary-lighter" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent
                    flex items-center justify-center text-xs font-bold text-white z-20">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
