import { Link } from 'react-router-dom';
import { Sparkles, Github, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <span className="text-lg font-bold font-display text-white">Career Mentor</span>
            </Link>
            <p className="text-sm text-gray-500 mb-4">Your AI-powered career mentor. Discover, plan, and launch your dream career.</p>
            <div className="flex gap-3">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="p-2 hover:bg-white/5 rounded-lg transition-colors" aria-label="Social link">
                  <Icon size={18} className="text-gray-500 hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'Career Paths', 'Resume Analysis'].map((item) => (
                <li key={item}><a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                <li key={item}><a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <li key={item}><a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} Career Mentor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
