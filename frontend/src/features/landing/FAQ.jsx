import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'How does Career Mentor generate career recommendations?', a: 'Career Mentor uses a Retrieval-Augmented Generation (RAG) pipeline powered by advanced AI models. It analyzes your resume, skills, education, interests, and career preferences against a comprehensive knowledge base of career paths, industry data, and job market trends to produce highly personalized recommendations.' },
  { q: 'Is my data secure?', a: 'Absolutely. All data is encrypted in transit and at rest. We use JWT authentication, input sanitization, and rate limiting. Your resume and personal information are never shared with third parties. You can delete your account and all data at any time.' },
  { q: 'What file formats are supported for resumes?', a: 'We support PDF, DOCX, and DOC files up to 10MB. Our parser automatically extracts your name, contact info, skills, education, experience, projects, and certifications from your resume.' },
  { q: 'How accurate are the career match scores?', a: 'Our AI analyzes dozens of factors including your skills, education, experience, projects, certifications, and market demand. While no AI is 100% accurate, our users report an 85% satisfaction rate with their top career match.' },
  { q: 'Can I use Career Mentor for free?', a: 'Yes! Career Mentor offers a free tier with core features including resume analysis, career recommendations, and skill gap analysis. Premium features like unlimited AI chat and advanced roadmaps will be available in future subscription plans.' },
  { q: 'How is Career Mentor different from other career platforms?', a: 'Unlike generic career quizzes, Career Mentor uses your actual resume and profile data with RAG-powered AI to generate deeply personalized recommendations. We don\'t just suggest careers — we provide complete roadmaps, skill gap analysis, learning resources, and an AI mentor.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-24 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="section-title mb-4">Frequently Asked <span className="gradient-text">Questions</span></h2>
          <p className="section-subtitle mx-auto">Everything you need to know about Career Mentor.</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full card !p-4 text-left flex items-center justify-between gap-4"
                aria-expanded={openIndex === i}
              >
                <span className="text-sm font-medium text-white">{faq.q}</span>
                <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-gray-400 leading-relaxed px-4 py-3">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
