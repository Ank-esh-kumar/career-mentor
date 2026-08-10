import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, Sparkles, CheckCircle, Circle, Clock, BookOpen } from 'lucide-react';
import { roadmapAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

import DynamicLoader from '../../components/ui/DynamicLoader';

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [targetCareer, setTargetCareer] = useState('');
  const [targetCompany, setTargetCompany] = useState('');

  useEffect(() => { fetchLatest(); }, []);

  const fetchLatest = async () => {
    try { const res = await roadmapAPI.getLatest(); setRoadmap(res.data); } catch {} finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    if (!targetCareer.trim()) { toast.error('Enter a target career'); return; }
    setGenerating(true);
    try {
      const res = await roadmapAPI.generate({ target_career: targetCareer, target_company: targetCompany });
      setRoadmap(res.data);
      toast.success('Roadmap generated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate roadmap');
    } finally { setGenerating(false); }
  };

  const toggleStep = async (stepNumber) => {
    if (!roadmap) return;
    try {
      const res = await roadmapAPI.toggleStep(roadmap.id, stepNumber);
      setRoadmap((prev) => ({ ...prev, steps: res.data.steps }));
    } catch { toast.error('Failed to update step'); }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <DynamicLoader texts={["Fetching your career roadmap..."]} subtext="" />
      </div>
    );
  }

  if (generating) {
    return (
      <div className="py-20 max-w-2xl mx-auto">
        <DynamicLoader 
          texts={[
            "Analyzing target role requirements...",
            "Mapping required skills and milestones...",
            "Structuring step-by-step career timeline...",
            "Fetching industry-standard resources...",
            "Compiling your ultimate career roadmap..."
          ]} 
          subtext="Our AI is charting out the best path for your career goals."
        />
      </div>
    );
  }

  const completedSteps = roadmap?.steps?.filter((s) => s.is_completed)?.length || 0;
  const totalSteps = roadmap?.steps?.length || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-white mb-1">Career Roadmap</h1>
        <p className="text-gray-400 text-sm">Your personalized step-by-step career path.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input value={targetCareer} onChange={(e) => setTargetCareer(e.target.value)} placeholder="Target Role (e.g., Software Engineer)" className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()} />
          <Input value={targetCompany} onChange={(e) => setTargetCompany(e.target.value)} placeholder="Target Company (Optional, e.g., Google)" className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()} />
          <Button icon={Sparkles} onClick={handleGenerate} loading={generating} className="whitespace-nowrap">Generate</Button>
        </div>
      </motion.div>

      {roadmap && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Header */}
          <div className="card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400">Target Career</p>
              <p className="text-xl font-bold text-white">
                {roadmap.target_career} {roadmap.target_company && <span className="text-primary-lighter">at {roadmap.target_company}</span>}
              </p>
              <p className="text-sm text-gray-500 mt-1">Level: {roadmap.current_level} → Job Ready</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Progress</p>
              <p className="text-2xl font-bold gradient-text">{completedSteps}/{totalSteps}</p>
              {roadmap.estimated_completion && <p className="text-xs text-gray-500">Est: {roadmap.estimated_completion}</p>}
            </div>
          </div>

          {/* Timeline */}
          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-[10px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-emerald-500 opacity-30" />

            <div className="space-y-6">
              {roadmap.steps?.map((step, i) => (
                <motion.div key={step.step_number || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="relative">
                  {/* Dot */}
                  <button onClick={() => toggleStep(step.step_number)} className="absolute -left-8 top-1 z-10" aria-label={`Toggle step ${step.step_number}`}>
                    {step.is_completed ? (
                      <CheckCircle size={22} className="text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Circle size={22} className="text-gray-600 hover:text-primary-lighter transition-colors" />
                    )}
                  </button>

                  <div className={`card !p-4 ${step.is_completed ? 'border-emerald-500/20 bg-emerald-500/5' : ''}`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className={`font-semibold ${step.is_completed ? 'text-emerald-400 line-through' : 'text-white'}`}>
                        {step.title}
                      </h3>
                      {step.duration && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                          <Clock size={12} />{step.duration}
                        </span>
                      )}
                    </div>
                    {step.description && <p className="text-sm text-gray-400 mb-2">{step.description}</p>}
                    {step.resources?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {step.resources.map((r, j) => (
                          <span key={j} className="text-xs px-2 py-1 bg-surface rounded-md text-gray-500 flex items-center gap-1">
                            <BookOpen size={10} />{r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {!roadmap && !loading && (
        <EmptyState icon={Map} title="No Roadmap Yet" description="Enter a target career to generate a personalized step-by-step learning roadmap." />
      )}
    </div>
  );
}
