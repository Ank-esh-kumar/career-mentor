import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, ChevronRight, CheckCircle, AlertTriangle, XCircle, 
  TrendingUp, TrendingDown, Minus, Zap, Sparkles 
} from 'lucide-react';
import { CircularProgress } from '../../components/ui/Progress';
import { resumeAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  good: { icon: CheckCircle, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', barColor: 'bg-emerald-500' },
  fair: { icon: AlertTriangle, color: 'text-amber-400', bgColor: 'bg-amber-500/10', barColor: 'bg-amber-500' },
  poor: { icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-500/10', barColor: 'bg-red-500' },
};

function getScoreColor(score) {
  if (score >= 71) return '#22C55E';
  if (score >= 41) return '#F59E0B';
  return '#EF4444';
}

function getScoreLabel(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 71) return 'Good';
  if (score >= 51) return 'Fair';
  if (score >= 30) return 'Needs Work';
  return 'Poor';
}

function SectionAccordion({ name, data }) {
  const [isOpen, setIsOpen] = useState(false);
  const config = STATUS_CONFIG[data.status] || STATUS_CONFIG.poor;
  const StatusIcon = config.icon;

  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.02]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.03] transition-colors"
      >
        <div className={`w-7 h-7 rounded-lg ${config.bgColor} flex items-center justify-center shrink-0`}>
          <StatusIcon size={14} className={config.color} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-xs font-medium text-gray-300 truncate">{data.label}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${config.barColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${data.score}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className={`text-xs font-semibold ${config.color} w-8 text-right`}>{data.score}</span>
          </div>
        </div>
        {isOpen ? (
          <ChevronDown size={14} className="text-gray-500 shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-gray-500 shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-1.5">
              {data.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={`mt-0.5 shrink-0 ${tip.includes('✓') ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {tip.includes('✓') ? '✓' : '•'}
                  </span>
                  <span className={tip.includes('✓') ? 'text-emerald-400' : 'text-gray-400'}>
                    {tip.replace(' ✓', '')}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ATSScorePanel({ scoreData, draft, targetRole, onAutoFix }) {
  const [prevScore, setPrevScore] = useState(null);
  const [scoreDelta, setScoreDelta] = useState(null);
  const [deepScanning, setDeepScanning] = useState(false);
  const [autoFixing, setAutoFixing] = useState(false);
  const deltaTimerRef = useRef(null);

  // Track score changes and show delta animation
  useEffect(() => {
    if (prevScore !== null && scoreData?.overall !== undefined) {
      const delta = scoreData.overall - prevScore;
      if (delta !== 0) {
        setScoreDelta(delta);
        if (deltaTimerRef.current) clearTimeout(deltaTimerRef.current);
        deltaTimerRef.current = setTimeout(() => setScoreDelta(null), 2000);
      }
    }
    if (scoreData?.overall !== undefined) {
      setPrevScore(scoreData.overall);
    }
  }, [scoreData?.overall]);

  const handleDeepScan = async () => {
    if (!draft) return;
    setDeepScanning(true);
    try {
      const res = await resumeAPI.atsEvaluate({ 
        content: draft, 
        target_role: targetRole || '' 
      });
      toast.success(`Deep ATS Scan Complete! Overall: ${res.data.overall_score}/100`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Deep scan failed');
    } finally {
      setDeepScanning(false);
    }
  };

  const handleAutoFixClick = async () => {
    if (!onAutoFix || allTips.length === 0) return;
    setAutoFixing(true);
    try {
      await onAutoFix(allTips);
    } finally {
      setAutoFixing(false);
    }
  };

  if (!scoreData) return null;

  const { overall, sections } = scoreData;
  const scoreColor = getScoreColor(overall);
  const scoreLabel = getScoreLabel(overall);

  const allTips = Object.values(sections)
    .flatMap(s => s.tips.filter(t => !t.includes('✓')))
    .slice(0, 3);

  return (
    <div className="h-full flex flex-col bg-surface/50 border border-border rounded-2xl overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-border bg-white/[0.02]">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <Zap size={14} className="text-primary" />
          ATS Score
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
        
        {/* Overall Score Gauge */}
        <div className="flex flex-col items-center py-2 relative">
          <div className="relative">
            <CircularProgress value={overall} size={100} strokeWidth={6} color={scoreColor} />
            <AnimatePresence>
              {scoreDelta !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.8 }}
                  className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-0.5 ${
                    scoreDelta > 0 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {scoreDelta > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {scoreDelta > 0 ? '+' : ''}{scoreDelta}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="text-sm font-semibold mt-2" style={{ color: scoreColor }}>{scoreLabel}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">ATS Compatibility</p>
        </div>

        {/* Section Breakdown */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Section Scores</h4>
          {Object.entries(sections).map(([key, data]) => (
            <SectionAccordion key={key} name={key} data={data} />
          ))}
        </div>

        {/* Top Improvements */}
        {allTips.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={10} /> Top Improvements
            </h4>
            <div className="space-y-2">
              {allTips.map((tip, i) => (
                <motion.div
                  key={tip}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/[0.06] border border-amber-500/10"
                >
                  <AlertTriangle size={12} className="text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-300 leading-relaxed">{tip}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleDeepScan}
            disabled={deepScanning || autoFixing}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30
              text-sm font-medium text-primary-lighter hover:from-primary/30 hover:to-purple-500/30 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {deepScanning ? (
              <div className="w-3.5 h-3.5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
            ) : (
              <Zap size={14} />
            )}
            Deep Scan
          </button>
          
          <button
            onClick={handleAutoFixClick}
            disabled={autoFixing || deepScanning || allTips.length === 0}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30
              text-sm font-medium text-emerald-400 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {autoFixing ? (
              <div className="w-3.5 h-3.5 border-2 border-emerald-500/40 border-t-emerald-400 rounded-full animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            Auto-Fix
          </button>
        </div>
      </div>
    </div>
  );
}
