import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, Bell, Sparkles } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatWidget from '../../features/chat/ChatWidget';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main content */}
      <div className={`transition-all duration-300 ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 glass-strong flex items-center justify-between px-4 md:px-6 relative">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-white/5 rounded-lg lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} className="text-gray-400" />
          </button>

          {/* Centered Branding (Clickable) */}
          <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:gap-2.5 hover:opacity-80 transition-opacity cursor-pointer group">
            <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_15px_rgba(var(--color-primary),0.3)] group-hover:shadow-[0_0_20px_rgba(var(--color-primary),0.5)] transition-shadow">
              <Sparkles className="w-4 h-4 sm:w-[16px] sm:h-[16px] text-white" />
            </div>
            <span className="text-base sm:text-xl font-bold font-display text-white whitespace-nowrap bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Career Mentor
            </span>
          </Link>

          <div className="flex items-center gap-3 ml-auto">
            <button className="p-2 hover:bg-white/5 rounded-lg relative" aria-label="Notifications">
              <Bell size={20} className="text-gray-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      {/* Floating chat */}
      <ChatWidget />
    </div>
  );
}
