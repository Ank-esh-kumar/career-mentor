import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Target } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center pt-16">
      {}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px]" />
        {}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-8"
          >
            <Sparkles size={14} className="text-accent" />
            <span className="text-sm text-gray-300">Powered by Advanced AI</span>
          </motion.div>

          {}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-display leading-tight mb-6"
          >
            <span className="text-white">Your AI</span>
            <br />
            <span className="gradient-text">Career Mentor</span>
          </motion.h1>

          {}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 text-balance"
          >
            Discover your perfect career path with AI-powered guidance. Get personalized recommendations,
            skill analysis, and learning roadmaps tailored to your unique profile.
          </motion.p>

          {}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button size="lg" icon={ArrowRight} iconRight onClick={() => navigate('/signup')}>
              Get Started Free
            </Button>
            <Button variant="secondary" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore Features
            </Button>
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {[
              { icon: Target, text: 'Career Matching' },
              { icon: Zap, text: 'AI Resume Analysis' },
              { icon: Sparkles, text: 'Personalized Roadmaps' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-border">
                <item.icon size={14} className="text-primary-lighter" />
                <span className="text-sm text-gray-400">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {}
        <div className="relative mt-20 max-w-3xl mx-auto hidden md:block pt-8 pb-12 px-12 lg:px-16">
          {}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0, y: [0, -12, 0] }}
            transition={{ y: { duration: 5, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.6, delay: 0.5 }, x: { duration: 0.6, delay: 0.5 } }}
            className="absolute -left-4 lg:-left-10 top-0 z-20 glass rounded-2xl p-4 shadow-glow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Target size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Career Match</p>
                <p className="text-xs text-emerald-400">92% Match Found</p>
              </div>
            </div>
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0, y: [0, 12, 0] }}
            transition={{ y: { duration: 6, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.6, delay: 0.7 }, x: { duration: 0.6, delay: 0.7 } }}
            className="absolute -right-4 lg:-right-10 top-1/3 z-20 glass rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap size={20} className="text-primary-lighter" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">ATS Score</p>
                <p className="text-xs text-primary-lighter">85/100</p>
              </div>
            </div>
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, -8, 0] }}
            transition={{ y: { duration: 7, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.6, delay: 0.9 } }}
            className="absolute left-4 lg:left-8 -bottom-4 z-20 glass rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Sparkles size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Skills Analyzed</p>
                <p className="text-xs text-purple-400">12 Skills Detected</p>
              </div>
            </div>
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative z-10 glass rounded-2xl p-1 shadow-glass"
          >
            <div className="bg-surface-card rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Career Match', value: '92%', color: 'from-primary to-accent' },
                  { label: 'Skills Score', value: '78%', color: 'from-emerald-500 to-emerald-400' },
                  { label: 'ATS Score', value: '85%', color: 'from-purple-500 to-purple-400' },
                ].map((item) => (
                  <div key={item.label} className="bg-surface/50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-2">{item.label}</p>
                    <p className={`text-2xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-primary to-accent rounded-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
