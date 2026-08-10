import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled ? 'glass-strong shadow-lg' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-16 relative w-full">
          
          {/* Left: Hamburger menu toggle (Visible on all screens) */}
          <div className="flex-1 flex items-center justify-start">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 -ml-2 hover:bg-white/5 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} className="text-white" /> : <Menu size={22} className="text-white" />}
            </button>
          </div>

          {/* Center: Logo */}
          <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-9 sm:h-9 shrink-0 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_15px_rgba(var(--color-primary),0.3)]">
              <Sparkles className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white" />
            </div>
            <span className="text-base sm:text-xl font-bold font-display text-white whitespace-nowrap bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Career Mentor
            </span>
          </Link>

          {/* Right: Actions */}
          <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate('/dashboard')} className="px-2 sm:px-4 text-xs sm:text-sm">Dashboard</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')} className="hidden sm:inline-flex">Log In</Button>
                <Button onClick={() => navigate('/signup')} className="px-2.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm">Get Started</Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown Menu (For all screens) */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-strong border-t border-border absolute top-16 left-0 right-0 z-40"
        >
          <div className="px-4 py-6 space-y-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-gray-400 hover:text-white transition-colors py-2 text-lg md:text-base font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
