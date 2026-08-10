import { motion } from 'framer-motion';
import { FileText, Compass, BarChart3, Map, MessageSquare, BookOpen } from 'lucide-react';
import SpotlightCard from '../../components/ui/SpotlightCard';

const features = [
  { icon: FileText, title: 'AI Resume Analysis', description: 'Get your resume scored, analyzed, and optimized with AI-powered insights and ATS compatibility checks.', color: 'bg-primary/10 text-primary-lighter' },
  { icon: Compass, title: 'Career Recommendations', description: 'Receive top 5 personalized career paths with match scores, salary data, and growth projections.', color: 'bg-emerald-500/10 text-emerald-400' },
  { icon: BarChart3, title: 'Skill Gap Analysis', description: 'Compare your current skills against industry requirements and get a prioritized learning plan.', color: 'bg-purple-500/10 text-purple-400' },
  { icon: Map, title: 'Career Roadmap', description: 'Follow a step-by-step learning path with weekly milestones from your current level to job-ready.', color: 'bg-amber-500/10 text-amber-400' },
  { icon: MessageSquare, title: 'AI Career Assistant', description: 'Chat with an AI counselor for career advice, interview tips, and personalized learning suggestions.', color: 'bg-cyan-500/10 text-cyan-400' },
  { icon: BookOpen, title: 'Learning Resources', description: 'Get curated courses, books, projects, and certifications recommended specifically for your goals.', color: 'bg-rose-500/10 text-rose-400' },
];

export default function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="section-title mb-4">Everything You Need to<br /><span className="gradient-text">Launch Your Career</span></h2>
          <p className="section-subtitle mx-auto">Comprehensive AI-powered tools that guide you from resume to dream job.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <SpotlightCard
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card group cursor-default"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 
                group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
