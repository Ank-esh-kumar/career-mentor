import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, FileText, Compass, BarChart3, Map,
  Bookmark, BookOpen, Settings, LogOut, ChevronLeft, Sparkles, X, Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/resume', label: 'Resume', icon: FileText },
  { path: '/career', label: 'Career Recommendation', icon: Compass },
  { path: '/skill-gap', label: 'Skill Gap Analysis', icon: BarChart3 },
  { path: '/roadmap', label: 'Career Roadmap', icon: Map },
  { path: '/saved-careers', label: 'Saved Careers', icon: Bookmark },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-surface-card/70 backdrop-blur-2xl border-r border-white/5 shadow-2xl
          transition-all duration-300 flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}
      >
        {/* Elegant Floating Toggle Button (Desktop Only) */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-6 w-6 h-6 bg-surface border border-white/10 hover:bg-surface-card hover:border-primary/50 rounded-full hidden lg:flex items-center justify-center z-50 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-110 group"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft size={14} className={`text-gray-400 group-hover:text-primary-lighter transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Mobile Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg lg:hidden z-50 transition-colors">
          <X size={20} className="text-gray-400 hover:text-white" />
        </button>

        {/* User info (Padded elegantly at the top) */}
        {!collapsed && user ? (
          <div className="px-5 pt-8 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary via-accent to-purple-500 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-[0_0_20px_rgba(var(--color-primary),0.3)] ring-2 ring-white/10">
                {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate tracking-wide">{user.full_name}</p>
                <p className="text-xs text-primary-lighter/70 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        ) : (
          /* Spacer when collapsed to align navigation */
          <div className="h-[92px] hidden lg:block" />
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 custom-scrollbar">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3.5 px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-300 overflow-hidden
                ${isActive
                  ? 'text-white bg-gradient-to-r from-primary/10 to-transparent shadow-[inset_1px_0_0_rgba(var(--color-primary),0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              {({ isActive }) => (
                <>
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-primary to-accent rounded-r-full shadow-[0_0_10px_rgba(var(--color-primary),0.6)]"
                    />
                  )}
                  
                  <div className={`relative z-10 flex items-center justify-center transition-transform duration-300 ${!collapsed && 'group-hover:translate-x-1'} ${isActive ? 'text-primary-lighter' : 'group-hover:text-gray-200'}`}>
                    <Icon size={20} className={`shrink-0 transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(var(--color-primary),0.5)]' : 'group-hover:scale-110'}`} />
                  </div>
                  
                  {!collapsed && (
                    <span className={`relative z-10 transition-transform duration-300 group-hover:translate-x-1 ${isActive ? 'font-semibold tracking-wide' : ''}`}>
                      {label}
                    </span>
                  )}
                  
                  {/* Soft hover glow effect behind text */}
                  {!isActive && !collapsed && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className={`group relative flex items-center gap-3.5 px-3 py-3 rounded-2xl text-sm font-medium text-gray-400 
              hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 w-full overflow-hidden
              ${collapsed ? 'justify-center' : ''}`}
          >
            <div className={`transition-transform duration-300 ${!collapsed && 'group-hover:translate-x-1'}`}>
               <LogOut size={20} className="shrink-0 group-hover:scale-110 transition-transform duration-300" />
            </div>
            {!collapsed && (
              <span className="transition-transform duration-300 group-hover:translate-x-1 font-semibold">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
