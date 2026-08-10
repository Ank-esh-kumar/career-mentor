import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { analyticsAPI } from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';

const COLORS = ['#2563EB', '#22C55E', '#A855F7', '#F59E0B', '#EF4444', '#38BDF8'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs">
      <p className="text-white font-medium">{label || payload[0]?.name}</p>
      <p className="text-gray-400">{payload[0]?.value}%</p>
    </div>
  );
};

export default function AnalyticsPage() {
  const [careerMatch, setCareerMatch] = useState([]);
  const [skillProgress, setSkillProgress] = useState([]);
  const [resumeScore, setResumeScore] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cm, sp, rs] = await Promise.all([
          analyticsAPI.getCareerMatch().catch(() => ({ data: { data: [] } })),
          analyticsAPI.getSkillProgress().catch(() => ({ data: { data: [] } })),
          analyticsAPI.getResumeScore().catch(() => ({ data: { data: [] } })),
        ]);
        setCareerMatch(cm.data.data || []);
        setSkillProgress(sp.data.data || []);
        setResumeScore(rs.data.data || []);
      } catch {} finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const hasData = careerMatch.length > 0 || skillProgress.length > 0 || resumeScore.length > 0;

  if (!hasData) return <EmptyState icon={BarChart3} title="No Analytics Data" description="Upload your resume and generate career recommendations to see analytics." />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-white mb-1">Analytics</h1>
        <p className="text-gray-400 text-sm">Visual overview of your career journey.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Career Match Distribution */}
        {careerMatch.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Career Match Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={careerMatch} dataKey="match" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4} strokeWidth={0}>
                  {careerMatch.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {careerMatch.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-400">{item.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Skill Categories */}
        {skillProgress.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Skill Categories</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={skillProgress}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar dataKey="count" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Resume Score */}
        {resumeScore.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Resume Analysis Scores</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={resumeScore} barSize={40}>
                <XAxis dataKey="metric" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {resumeScore.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </div>
  );
}
