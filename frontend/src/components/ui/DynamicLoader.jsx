import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BrainCircuit } from 'lucide-react';

const defaultTexts = [
  "Analyzing your profile...",
  "Cross-referencing industry standards...",
  "Synthesizing personalized insights...",
  "Applying AI models...",
  "Adding finishing touches...",
];

export default function DynamicLoader({ texts = defaultTexts, subtext = "This usually takes 5-10 seconds." }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % texts.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 space-y-8 text-center min-h-[300px] w-full">
      {}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-[30px] animate-pulse" />
        <div className="relative w-20 h-20 bg-surface-card/80 backdrop-blur-xl border border-primary/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(var(--color-primary),0.3)]">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ rotate: { duration: 4, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
          >
            <BrainCircuit className="w-10 h-10 text-primary-lighter" />
          </motion.div>
        </div>
      </div>

      {}
      <div className="h-10 relative w-full max-w-sm flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
            className="absolute text-lg font-display font-medium text-white tracking-wide"
          >
            {texts[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      {subtext && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm text-gray-500 font-medium"
        >
          {subtext}
        </motion.p>
      )}
    </div>
  );
}
