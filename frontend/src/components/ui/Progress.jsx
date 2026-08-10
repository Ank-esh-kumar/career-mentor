import { motion } from 'framer-motion';

export default function Progress({ value = 0, max = 100, label, showValue = true, size = 'md', color = 'blue' }) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const colors = {
    blue: 'from-primary to-accent',
    green: 'from-emerald-500 to-emerald-400',
    red: 'from-red-500 to-red-400',
    purple: 'from-purple-500 to-purple-400',
    yellow: 'from-amber-500 to-amber-400',
  };

  return (
    <div className="space-y-1.5">
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-sm text-gray-400">{label}</span>}
          {showValue && <span className="text-sm font-medium text-gray-300">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-surface ${heights[size]} rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`${heights[size]} bg-gradient-to-r ${colors[color]} rounded-full`}
        />
      </div>
    </div>
  );
}

export function CircularProgress({ value = 0, size = 80, strokeWidth = 6, label, color = '#2563EB' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold text-white">{value}%</span>
        {label && <span className="text-[10px] text-gray-500">{label}</span>}
      </div>
    </div>
  );
}
