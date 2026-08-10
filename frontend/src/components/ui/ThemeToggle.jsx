import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCurrentIcon = () => {
    if (mode === 'light') return <Sun size={18} />;
    if (mode === 'dark') return <Moon size={18} />;
    return <Monitor size={18} />;
  };

  const options = [
    { id: 'system', label: 'System', icon: Monitor },
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        aria-label="Toggle Theme"
      >
        {getCurrentIcon()}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-36 glass-strong rounded-xl shadow-xl border border-white/10 overflow-hidden z-50 flex flex-col py-1"
          >
            {options.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setMode(t.id);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 text-sm w-full transition-colors ${
                  mode === t.id ? 'text-primary-lighter bg-primary/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <t.icon size={16} />
                <span>{t.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
