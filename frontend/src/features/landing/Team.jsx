import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Linkedin, Mail, Code, Terminal, BrainCircuit, Layout, PenTool, Database, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import Button from '../../components/ui/Button';
import SpotlightCard from '../../components/ui/SpotlightCard';

export default function Team() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <section className="py-24 relative overflow-hidden" id="team">
      <div className="max-w-6xl mx-auto px-6 space-y-12 relative z-10">

        {}
        <div className="text-center space-y-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white font-display"
          >
            Meet The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Developers</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            The passionate minds bridging the gap between ambition and opportunity through AI-driven career guidance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex justify-center pt-4"
          >
            <Button
              onClick={() => setIsVisible(!isVisible)}
              variant={isVisible ? "secondary" : "primary"}
              className="gap-2"
            >
              {isVisible ? (
                <>Hide Developers <ChevronUp size={18} /></>
              ) : (
                <>View Developers <ChevronDown size={18} /></>
              )}
            </Button>
          </motion.div>
        </div>

        {}
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden"
            >
              <div className="relative w-full max-w-5xl mx-auto flex flex-col md:flex-row items-stretch justify-center gap-8 pt-6 pb-10">

                {}
                <SpotlightCard
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="w-full flex-1 max-w-[420px] h-full flex flex-col card bg-surface/50 border-border hover:border-white/10 transition-colors p-10 z-10 order-2 md:order-1"
                >
                  <div className="flex flex-col items-center text-center space-y-4 mb-6">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-4xl shadow-inner overflow-hidden">
                      👩‍💻
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Garima</h3>
                      <p className="text-primary-lighter text-sm font-bold uppercase tracking-wider mt-1">Core Developer & UI Support</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm text-gray-300 leading-relaxed flex-1">
                    <p>
                      Garima played a crucial role in bringing the frontend components to life and ensuring a smooth user experience across the application.
                    </p>

                    <div>
                      <h4 className="font-semibold text-gray-400 uppercase tracking-wider text-xs mb-3">Key Contributions</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <Layout size={16} className="text-secondary shrink-0 mt-0.5" />
                          <span><strong>UI Implementation:</strong> Crafted and implemented the rich interactive frontend components.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <PenTool size={16} className="text-secondary shrink-0 mt-0.5" />
                          <span><strong>Styling & Design:</strong> Ensured beautiful layouts and consistent design systems.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Code size={16} className="text-secondary shrink-0 mt-0.5" />
                          <span><strong>Code Testing & QA:</strong> Verified functionality and usability across the app.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-center gap-6 pt-6 mt-6 border-t border-border">
                    <button className="text-gray-400 hover:text-white transition-colors scale-110"><Github size={20} /></button>
                    <button className="text-gray-400 hover:text-[#0A66C2] transition-colors scale-110"><Linkedin size={20} /></button>
                    <a href="https://garima-por-tfo-lio.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent transition-colors scale-110" aria-label="Portfolio"><Globe size={20} /></a>
                  </div>
                </SpotlightCard>

                {}
                <SpotlightCard
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-full flex-1 max-w-[420px] h-full flex flex-col card bg-gradient-to-b from-white/[0.05] to-surface/50 border-primary/30 shadow-[0_0_40px_-15px_rgba(168,85,247,0.2)] p-10 z-20 order-1 md:order-2"
                >
                  <div className="flex flex-col items-center text-center space-y-4 mb-6">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/40 flex items-center justify-center text-4xl shadow-xl overflow-hidden relative">
                      👨‍💻
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent mix-blend-overlay"></div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Ankesh</h3>
                      <p className="text-primary-light text-sm font-bold uppercase tracking-wider mt-1">Lead Architect & Full-Stack Developer</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm text-gray-300 leading-relaxed flex-1">
                    <p>
                      Ankesh envisioned the core architecture and drove the full-stack development of Career Mentor. He integrated the advanced AI engines and built the scalable backend infrastructure.
                    </p>

                    <div>
                      <h4 className="font-semibold text-gray-400 uppercase tracking-wider text-xs mb-3">Major Contributions</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <BrainCircuit size={16} className="text-primary shrink-0 mt-0.5" />
                          <span><strong>AI Orchestration:</strong> Engineered the advanced LLM prompts and ATS scoring logic.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Database size={16} className="text-primary shrink-0 mt-0.5" />
                          <span><strong>System Architecture:</strong> Designed the robust FastAPI backend and MongoDB schemas.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Terminal size={16} className="text-primary shrink-0 mt-0.5" />
                          <span><strong>Full-Stack Mastery:</strong> Led the development of the complex dynamic React frontend and API services.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-center gap-6 pt-6 mt-6 border-t border-border">
                    <button className="text-gray-400 hover:text-white transition-colors scale-110"><Github size={20} /></button>
                    <button className="text-gray-400 hover:text-[#0A66C2] transition-colors scale-110"><Linkedin size={20} /></button>
                    <button className="text-gray-400 hover:text-primary transition-colors scale-110"><Mail size={20} /></button>
                    <a href="https://my-3-d-port-seven.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent transition-colors scale-110" aria-label="Portfolio"><Globe size={20} /></a>
                  </div>
                </SpotlightCard>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
