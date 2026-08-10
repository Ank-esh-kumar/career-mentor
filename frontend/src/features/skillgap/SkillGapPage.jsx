import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Sparkles, ArrowRight } from 'lucide-react';
import { skillGapAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Progress from '../../components/ui/Progress';
import EmptyState from '../../components/ui/EmptyState';
import toast from '../../utils/toast';

export default function SkillGapPage() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [targetCareer, setTargetCareer] = useState('');

  useEffect(() => { fetchLatest(); }, []);

  const fetchLatest = async () => {
    try { const res = await skillGapAPI.getLatest(); setAnalysis(res.data); } catch {} finally { setLoading(false); }
  };

  const handleAnalyze = async () => {
    if (!targetCareer.trim()) { toast.error('Enter a target career'); return; }
    setAnalyzing(true);
    try {
      const res = await skillGapAPI.analyze({ target_career: targetCareer });
      setAnalysis(res.data);
      toast.success('Skill gap analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed');
    } finally { setAnalyzing(false); }
  };

  const priorityColors = { High: 'red', Medium: 'yellow', Low: 'green' };
  const difficultyColors = { Hard: 'red', Moderate: 'yellow', Easy: 'green' };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-white mb-1">Skill Gap Analysis</h1>
        <p className="text-gray-400 text-sm">Compare your skills against your target career requirements.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <div className="flex gap-3">
          <Input value={targetCareer} onChange={(e) => setTargetCareer(e.target.value)} placeholder="e.g., Software Engineer, Data Scientist..." className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()} />
          <Button icon={Sparkles} onClick={handleAnalyze} loading={analyzing}>Analyze</Button>
        </div>
      </motion.div>

      {analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="card flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Target Career</p>
              <p className="text-xl font-bold text-white">{analysis.target_career}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Overall Readiness</p>
              <p className="text-3xl font-bold gradient-text">{analysis.overall_readiness}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.matched_skills?.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-semibold text-emerald-400 mb-3">✓ Matched Skills ({analysis.matched_skills.length})</h3>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.matched_skills.map((s) => <Badge key={s} color="green">{s}</Badge>)}
                </div>
              </div>
            )}
            {analysis.missing_skills?.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-semibold text-red-400 mb-3">✗ Missing Skills ({analysis.missing_skills.length})</h3>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missing_skills.map((s) => <Badge key={s} color="red">{s}</Badge>)}
                </div>
              </div>
            )}
          </div>

          {analysis.skill_gaps?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Skill Gap Details</h3>
              {analysis.skill_gaps.map((gap, i) => (
                <motion.div key={gap.skill_name || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="card !p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{gap.skill_name}</h4>
                    <div className="flex gap-2">
                      <Badge color={priorityColors[gap.learning_priority] || 'blue'}>{gap.learning_priority || 'Medium'} Priority</Badge>
                      <Badge color={difficultyColors[gap.difficulty] || 'blue'}>{gap.difficulty || 'Moderate'}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span>{gap.current_level || 'None'}</span>
                    <ArrowRight size={12} />
                    <span className="text-primary-lighter">{gap.required_level || 'Intermediate'}</span>
                    {gap.estimated_learning_time && <span className="ml-auto">⏱ {gap.estimated_learning_time}</span>}
                  </div>
                  <Progress value={gap.current_level === 'Advanced' ? 80 : gap.current_level === 'Intermediate' ? 50 : gap.current_level === 'Beginner' ? 25 : 5} size="sm" showValue={false} color={gap.gap_level === 'Large' ? 'red' : gap.gap_level === 'Small' ? 'green' : 'yellow'} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {!analysis && !loading && (
        <EmptyState icon={BarChart3} title="No Analysis Yet" description="Enter a target career above to compare your current skills against what's required." />
      )}
    </div>
  );
}
