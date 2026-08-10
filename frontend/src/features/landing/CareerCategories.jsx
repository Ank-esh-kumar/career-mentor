import { motion } from 'framer-motion';
import { Code, Database, Palette, BarChart3, Shield, Cpu, Megaphone, Stethoscope } from 'lucide-react';
import SpotlightCard from '../../components/ui/SpotlightCard';

const categories = [
  { icon: Code, label: 'Software Engineering', count: '2.5M+ Jobs', color: 'from-blue-500 to-cyan-500' },
  { icon: Database, label: 'Data Science', count: '1.8M+ Jobs', color: 'from-emerald-500 to-teal-500' },
  { icon: Palette, label: 'UX/UI Design', count: '900K+ Jobs', color: 'from-purple-500 to-pink-500' },
  { icon: BarChart3, label: 'Product Management', count: '1.2M+ Jobs', color: 'from-amber-500 to-orange-500' },
  { icon: Shield, label: 'Cybersecurity', count: '1.5M+ Jobs', color: 'from-red-500 to-rose-500' },
  { icon: Cpu, label: 'AI / Machine Learning', count: '2.1M+ Jobs', color: 'from-indigo-500 to-violet-500' },
  { icon: Megaphone, label: 'Digital Marketing', count: '1.1M+ Jobs', color: 'from-pink-500 to-fuchsia-500' },
  { icon: Stethoscope, label: 'Healthcare Tech', count: '800K+ Jobs', color: 'from-teal-500 to-green-500' },
];

export default function CareerCategories() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="section-title mb-4">Explore <span className="gradient-text">Career Paths</span></h2>
          <p className="section-subtitle mx-auto">Career Mentor covers careers across every major industry and specialization.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <SpotlightCard
              key={cat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03 }}
              className="card cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} bg-opacity-10 flex items-center justify-center mb-3
                group-hover:shadow-lg transition-shadow`}>
                <cat.icon size={22} className="text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{cat.label}</h3>
              <p className="text-xs text-gray-500">{cat.count}</p>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
