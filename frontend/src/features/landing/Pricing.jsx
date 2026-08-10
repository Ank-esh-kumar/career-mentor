import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button';
import SpotlightCard from '../../components/ui/SpotlightCard';

const plans = [
  { name: 'Free', price: '$0', period: 'forever', features: ['Resume Upload & Analysis', '5 Career Recommendations', 'Basic Skill Gap Analysis', 'AI Chat (10 messages/day)', 'Career Roadmap'], cta: 'Get Started', popular: false },
  { name: 'Pro', price: '$19', period: '/month', features: ['Everything in Free', 'Ultimate ATS Resume Builder', 'Real-time ATS Score', 'Deep AI ATS Scan', 'Unlimited AI Chat', 'Priority AI Processing', 'Export Reports'], cta: 'Start Free Trial', popular: true, disabled: false },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Pro', 'Team Management', 'API Access', 'Custom Integrations', 'Dedicated Support', 'Analytics Dashboard', 'SLA Guarantee'], cta: 'Contact Us', popular: false, disabled: true },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="section-title mb-4">Simple, Transparent <span className="gradient-text">Pricing</span></h2>
          <p className="section-subtitle mx-auto">Start free. Upgrade when you&apos;re ready.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <SpotlightCard
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`card relative ${plan.popular ? 'border-primary/40 shadow-glow' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-primary to-accent rounded-full text-xs font-semibold text-white flex items-center gap-1">
                  <Sparkles size={12} /> Most Popular
                </div>
              )}
              <div className="text-center mb-6 pt-2">
                <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-gray-400">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.popular ? 'primary' : 'secondary'}
                className="w-full"
                disabled={plan.disabled}
              >
                {plan.cta}
              </Button>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
