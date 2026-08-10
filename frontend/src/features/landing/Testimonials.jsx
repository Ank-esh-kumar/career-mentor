import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import SpotlightCard from '../../components/ui/SpotlightCard';

const testimonials = [
  { name: 'Sarah Chen', role: 'Software Engineer at Google', text: 'Career Mentor helped me transition from marketing to software engineering. The personalized roadmap was incredibly detailed and kept me on track for 6 months until I landed my dream job.', rating: 5 },
  { name: 'Marcus Williams', role: 'Data Scientist at Meta', text: 'The skill gap analysis was eye-opening. I knew I wanted to get into data science, but Career Mentor showed me exactly which skills to focus on and in what order. Game changer!', rating: 5 },
  { name: 'Priya Patel', role: 'UX Designer at Airbnb', text: 'I was overwhelmed by career options after graduation. Career Mentor matched me with UX Design at 94% — a field I hadn\'t even considered. Best career decision I\'ve ever made.', rating: 5 },
  { name: 'James Rodriguez', role: 'DevOps Engineer at AWS', text: 'The AI resume analysis improved my ATS score from 45 to 89. Within two weeks of updating my resume based on the suggestions, I started getting interview calls.', rating: 5 },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="testimonials" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="section-title mb-4">Loved by <span className="gradient-text">Career Changers</span></h2>
          <p className="section-subtitle mx-auto">See how Career Mentor has transformed careers for thousands.</p>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <SpotlightCard
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="card-glass text-center py-10 px-8"
            >
              <Quote size={36} className="text-primary/30 mx-auto mb-6" />
              <p className="text-lg text-gray-300 leading-relaxed mb-8 italic">&ldquo;{testimonials[current].text}&rdquo;</p>
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(testimonials[current].rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold mx-auto mb-3">
                {testimonials[current].name.charAt(0)}
              </div>
              <p className="font-semibold text-white">{testimonials[current].name}</p>
              <p className="text-sm text-gray-400">{testimonials[current].role}</p>
            </SpotlightCard>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={prev} className="p-2 glass rounded-lg hover:bg-white/10 transition-colors" aria-label="Previous testimonial">
              <ChevronLeft size={20} className="text-gray-400" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-primary w-6' : 'bg-gray-600'}`} aria-label={`Go to testimonial ${i + 1}`} />
              ))}
            </div>
            <button onClick={next} className="p-2 glass rounded-lg hover:bg-white/10 transition-colors" aria-label="Next testimonial">
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
