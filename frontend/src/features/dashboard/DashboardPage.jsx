import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Compass, BarChart3, Map, Upload, Sparkles, TrendingUp, Clock, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI } from '../../services/api';
import { CircularProgress } from '../../components/ui/Progress';
import Progress from '../../components/ui/Progress';
import { SkeletonDashboard } from '../../components/ui/Skeleton';
import toast from '../../utils/toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await analyticsAPI.getDashboard();
        setStats(res.data);
      } catch {  }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return <SkeletonDashboard />;

  const quickActions = [
    { icon: Upload, label: 'Upload Resume', path: '/resume', color: 'bg-primary/10 text-primary-lighter' },
    { icon: Compass, label: 'Get Recommendations', path: '/career', color: 'bg-emerald-500/10 text-emerald-400' },
    { icon: BarChart3, label: 'Skill Gap Analysis', path: '/skill-gap', color: 'bg-purple-500/10 text-purple-400' },
    { icon: Map, label: 'Career Roadmap', path: '/roadmap', color: 'bg-amber-500/10 text-amber-400' },
  ];

  return (
    <div className="space-y-6">
      {}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-white">
            Welcome back, <span className="gradient-text">{user?.full_name?.split(' ')[0] || 'there'}</span> 👋
          </h1>
          <p className="text-gray-400 mt-1">Here&apos;s an overview of your career journey.</p>
        </div>
      </motion.div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Profile Completion', value: stats?.profile_completion || 0, icon: Target, color: '#2563EB' },
          { label: 'Career Match', value: stats?.career_match_score || 0, icon: Compass, color: '#22C55E' },
          { label: 'Resume Score', value: stats?.resume_score || 0, icon: FileText, color: '#A855F7' },
          { label: 'Skill Readiness', value: stats?.skill_gap_score || 0, icon: TrendingUp, color: '#F59E0B' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="card flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-white">{card.value}%</p>
            </div>
            <CircularProgress value={card.value} size={64} strokeWidth={5} color={card.color} />
          </motion.div>
        ))}
      </div>

      {}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-accent" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button key={action.label} onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-surface hover:bg-surface-hover border border-border hover:border-border-light transition-all duration-200 group">
              <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <action.icon size={22} />
              </div>
              <span className="text-sm text-gray-300 font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Latest Recommendation</h2>
          {stats?.latest_career ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Compass size={24} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{stats.latest_career}</p>
                <Progress value={stats.career_match_score} color="green" size="sm" showValue={false} />
              </div>
              <span className="text-lg font-bold text-emerald-400">{stats.career_match_score}%</span>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recommendations yet. Upload your resume to get started.</p>
          )}
        </motion.div>

        {}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={18} className="text-gray-400" /> Recent Activity
          </h2>
          {stats?.recent_activities?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_activities.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p className="text-gray-300">{activity.description}</p>
                    <p className="text-xs text-gray-600">{new Date(activity.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent activity.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
