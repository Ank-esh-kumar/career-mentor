import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Crown, Sparkles, X, Check, Zap, Shield, BarChart3, FileText, Key } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import toast from '../../utils/toast';

const PRO_FEATURES = [
  { icon: FileText, label: 'Ultimate ATS Resume Builder', desc: 'AI-powered resume generation optimized for ATS' },
  { icon: BarChart3, label: 'Real-time ATS Score', desc: 'Live scoring as you edit each section' },
  { icon: Zap, label: 'Deep AI ATS Scan', desc: 'AI-powered comprehensive evaluation' },
  { icon: Shield, label: 'Priority AI Processing', desc: 'Faster responses & advanced models' },
  { icon: Sparkles, label: 'Unlimited AI Chat', desc: 'No daily message limits' },
  { icon: Crown, label: 'Export Reports', desc: 'Download detailed career reports' },
];

export default function PremiumModal({ isOpen, onClose, featureName = 'this feature' }) {
  const { activate } = useSubscription();
  const [activating, setActivating] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [activationKey, setActivationKey] = useState('');

  const handleActivate = async () => {
    if (!showKeyInput) {
      setShowKeyInput(true);
      return;
    }

    if (activationKey !== 'Ankesh') {
      toast.error('Invalid activation key');
      return;
    }

    setActivating(true);
    try {
      await activate();
      toast.success('🎉 Pro subscription activated! Enjoy premium features.');
      setShowKeyInput(false);
      setActivationKey('');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to activate subscription');
    } finally {
      setActivating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
          >
            <div className="relative w-full max-w-lg bg-surface/95 backdrop-blur-xl border border-border rounded-3xl shadow-2xl overflow-hidden">

              {}
              <div className="h-1.5 bg-gradient-to-r from-amber-500 via-primary to-purple-500" />

              {}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10 p-1"
              >
                <X size={20} />
              </button>

              <div className="p-8">
                {}
                <div className="text-center mb-8">
                  {}
                  <motion.div
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: [0, 180, 360] }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center"
                  >
                    <Crown size={28} className="text-amber-400" />
                  </motion.div>

                  <h2 className="text-2xl font-bold text-white mb-2 font-display">
                    Upgrade to{' '}
                    <span className="bg-gradient-to-r from-amber-400 via-primary-lighter to-purple-400 bg-clip-text text-transparent">
                      Pro
                    </span>
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Unlock <span className="text-white font-medium">{featureName}</span> and all premium features
                  </p>
                </div>

                {}
                <div className="space-y-3 mb-8">
                  {PRO_FEATURES.map((feature, i) => (
                    <motion.div
                      key={feature.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/15 to-purple-500/15 flex items-center justify-center shrink-0">
                        <feature.icon size={16} className="text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{feature.label}</p>
                        <p className="text-xs text-gray-500 truncate">{feature.desc}</p>
                      </div>
                      <Check size={16} className="text-emerald-400 shrink-0 ml-auto" />
                    </motion.div>
                  ))}
                </div>

                {}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1 mb-1">
                    <span className="text-4xl font-bold text-white">$19</span>
                    <span className="text-gray-400 text-sm">/month</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-medium">✨ Free trial — activate instantly</p>
                </div>

                <AnimatePresence>
                  {showKeyInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Key size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={activationKey}
                          onChange={(e) => setActivationKey(e.target.value)}
                          placeholder="Enter Activation Key"
                          className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {}
                <div className="space-y-3">
                  <button
                    onClick={handleActivate}
                    disabled={activating}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 text-white font-semibold text-sm
                      hover:from-amber-400 hover:to-purple-500 transition-all duration-200
                      disabled:opacity-60 disabled:cursor-not-allowed
                      shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30
                      flex items-center justify-center gap-2"
                  >
                    {activating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Activating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Activate Pro
                      </>
                    )}
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full py-3 px-6 rounded-xl bg-transparent border border-border text-gray-400 font-medium text-sm
                      hover:text-white hover:border-gray-600 transition-all duration-200"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
