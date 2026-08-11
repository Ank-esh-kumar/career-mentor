import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Wand2, Download, CheckCircle, Save, ArrowLeft, RefreshCw, Briefcase, Award, ZoomIn, ZoomOut, Plus, Trash2, Crown, Sparkles } from 'lucide-react';
import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';
import { useNavigate } from 'react-router-dom';
import { resumeAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from '../../utils/toast';
import { useSubscription } from '../../context/SubscriptionContext';
import PremiumModal from '../../components/ui/PremiumModal';
import evaluateResume from './atsScorer';
import ATSScorePanel from './ATSScorePanel';

export default function ResumeBuilderPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasBaseResume, setHasBaseResume] = useState(false);
  const [zoom, setZoom] = useState(0.8);
  
  // Premium System
  const { isPremium, loading: subLoading } = useSubscription();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
  // ATS Scoring
  const [scoreData, setScoreData] = useState(null);
  
  // Preferences
  const [prefs, setPrefs] = useState({
    target_role: '',
    experience_level: 'Mid-Level',
    key_achievements: '',
    tone: 'Professional'
  });

  // Draft Data
  const [draft, setDraft] = useState(null);
  
  // Print Reference
  const printRef = useRef();
  
  const handlePrint = () => {
    const element = printRef.current;
    if (!element) return;
    
    const opt = {
      margin: 0,
      filename: 'ATS_Resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  useEffect(() => {
    // Only check base resume if premium, otherwise the page is locked anyway
    if (!subLoading && isPremium) {
      checkBaseResume();
    } else if (!subLoading && !isPremium) {
      setLoading(false);
    }
  }, [subLoading, isPremium]);

  useEffect(() => {
    if (!draft || !isPremium) return;
    const timeout = setTimeout(() => {
      const result = evaluateResume(draft, prefs.target_role);
      setScoreData(result);
    }, 300);
    return () => clearTimeout(timeout);
  }, [draft, prefs.target_role, isPremium]);

  const checkBaseResume = async () => {
    try {
      await resumeAPI.get();
      setHasBaseResume(true);
      
      // Try to load existing draft
      try {
        const draftRes = await resumeAPI.getDraft();
        if (draftRes.data) {
          setDraft(draftRes.data.content);
          setPrefs({
            target_role: draftRes.data.target_role || '',
            experience_level: 'Mid-Level',
            key_achievements: '',
            tone: 'Professional'
          });
          setStep(3); // Go straight to editor if draft exists
        }
      } catch (e) {
        // No draft exists yet
      }
    } catch {
      setHasBaseResume(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prefs.target_role) {
      toast.error("Please enter a Target Role");
      return;
    }
    
    setGenerating(true);
    setStep(2); // Loading step
    
    try {
      const res = await resumeAPI.generateDraft(prefs);
      setDraft(res.data);
      setStep(3); // Editor step
      toast.success("ATS Resume generated successfully!");
      
      // Auto-save the draft
      await resumeAPI.saveDraft({
        target_role: prefs.target_role,
        content: res.data
      });
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      const errMsg = typeof detail === 'string' ? detail : `Failed to generate resume: ${err.message || 'Unknown error'}`;
      toast.error(errMsg);
      setStep(1);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!prefs.target_role) {
      toast.error("Please enter a Target Role in the Preferences section first");
      return;
    }
    
    setGeneratingSummary(true);
    try {
      // Extract ATS insights to help the AI craft a better summary
      const atsEvaluation = evaluateResume(draft, prefs.target_role);
      const atsInsights = {
        overall_score: atsEvaluation.overall,
        weak_sections: Object.entries(atsEvaluation.sections)
          .filter(([_, data]) => data.score < 80)
          .map(([key, data]) => ({ section: key, tips: data.tips }))
      };

      const res = await resumeAPI.generateSummary({
        target_role: prefs.target_role,
        current_resume: JSON.stringify(draft),
        ats_insights: JSON.stringify(atsInsights)
      });
      
      setDraft((prev) => ({
        ...prev,
        summary: res.data.summary
      }));
      toast.success("Professional Summary updated!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to generate summary");
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleAutoFix = async (improvements) => {
    try {
      const res = await resumeAPI.autoFix({
        content: draft,
        improvements: improvements
      });
      setDraft(res.data);
      toast.success("Resume updated automatically based on ATS suggestions!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Auto-fix failed");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await resumeAPI.saveDraft({
        target_role: prefs.target_role || draft.target_role || 'Untitled',
        content: draft
      });
      toast.success("Draft saved successfully!");
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errMsg = typeof detail === 'string' ? detail : "Failed to save draft";
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleManualEdit = (section, index, field, value) => {
    setDraft(prev => {
      const updated = { ...prev };
      
      if (index !== null) {
        // It's an array like experience or education
        updated[section] = [...updated[section]];
        updated[section][index] = { ...updated[section][index], [field]: value };
      } else if (field !== null) {
        // It's an object like personal_info
        updated[section] = { ...updated[section], [field]: value };
      } else {
        // It's a simple string like summary
        updated[section] = value;
      }
      
      return updated;
    });
  };

  const handleArrayEdit = (section, index, field, arrayIndex, value) => {
    setDraft(prev => {
      const updated = { ...prev };
      updated[section] = [...updated[section]];
      updated[section][index] = { ...updated[section][index] };
      updated[section][index][field] = [...updated[section][index][field]];
      updated[section][index][field][arrayIndex] = value;
      return updated;
    });
  };

  const handleSkillEdit = (category, index, value) => {
    setDraft(prev => {
      const updated = { ...prev };
      updated.skills = { ...updated.skills };
      updated.skills[category] = [...updated.skills[category]];
      updated.skills[category][index] = value;
      return updated;
    });
  };

  const handleAddSectionItem = (section, emptyTemplate) => {
    setDraft(prev => {
      const updated = { ...prev };
      if (!updated[section]) updated[section] = [];
      updated[section] = [...updated[section], emptyTemplate];
      return updated;
    });
  };

  const handleRemoveSectionItem = (section, index) => {
    setDraft(prev => {
      const updated = { ...prev };
      updated[section] = updated[section].filter((_, i) => i !== index);
      return updated;
    });
  };

  const handleAddBullet = (section, index, field) => {
    setDraft(prev => {
      const updated = { ...prev };
      updated[section] = [...updated[section]];
      updated[section][index] = { ...updated[section][index] };
      if (!updated[section][index][field]) updated[section][index][field] = [];
      updated[section][index][field] = [...updated[section][index][field], ""];
      return updated;
    });
  };

  const handleRemoveBullet = (section, index, field, bulletIndex) => {
    setDraft(prev => {
      const updated = { ...prev };
      updated[section] = [...updated[section]];
      updated[section][index] = { ...updated[section][index] };
      updated[section][index][field] = updated[section][index][field].filter((_, i) => i !== bulletIndex);
      return updated;
    });
  };

  const handleAddCustomSection = () => {
    setDraft(prev => {
      const updated = { ...prev };
      if (!updated.custom_sections) updated.custom_sections = [];
      updated.custom_sections = [...updated.custom_sections, { title: "New Section", items: [""] }];
      return updated;
    });
  };

  const handleRemoveCustomSection = (index) => {
    setDraft(prev => {
      const updated = { ...prev };
      updated.custom_sections = updated.custom_sections.filter((_, i) => i !== index);
      return updated;
    });
  };

  const handleCustomSectionEdit = (index, field, value, itemIndex = null) => {
    setDraft(prev => {
      const updated = { ...prev };
      updated.custom_sections = [...updated.custom_sections];
      updated.custom_sections[index] = { ...updated.custom_sections[index] };
      
      if (itemIndex !== null) {
        updated.custom_sections[index].items = [...updated.custom_sections[index].items];
        updated.custom_sections[index].items[itemIndex] = value;
      } else {
        updated.custom_sections[index][field] = value;
      }
      return updated;
    });
  };

  const handleAddCustomItem = (index) => {
    setDraft(prev => {
      const updated = { ...prev };
      updated.custom_sections = [...updated.custom_sections];
      updated.custom_sections[index] = { ...updated.custom_sections[index] };
      if (!updated.custom_sections[index].items) updated.custom_sections[index].items = [];
      updated.custom_sections[index].items = [...updated.custom_sections[index].items, ""];
      return updated;
    });
  };

  const handleRemoveCustomItem = (sectionIndex, itemIndex) => {
    setDraft(prev => {
      const updated = { ...prev };
      updated.custom_sections = [...updated.custom_sections];
      updated.custom_sections[sectionIndex] = { ...updated.custom_sections[sectionIndex] };
      updated.custom_sections[sectionIndex].items = updated.custom_sections[sectionIndex].items.filter((_, i) => i !== itemIndex);
      return updated;
    });
  };

  if (loading || subLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!isPremium) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-20 relative">
        <div className="flex items-center justify-between mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <button onClick={() => navigate('/resume')} className="text-sm text-gray-400 hover:text-white flex items-center gap-1 mb-2 transition-colors">
              <ArrowLeft size={16} /> Back to Resume
            </button>
            <h1 className="text-2xl font-bold font-display text-white mb-1 flex items-center gap-2">
              <Wand2 size={24} className="text-primary" /> ATS Resume Builder
            </h1>
            <p className="text-gray-400 text-sm">Curate a highly optimized resume tailored to your target role.</p>
          </motion.div>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-border bg-surface">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md z-10 flex flex-col items-center justify-center p-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring" }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center mb-6 border border-amber-500/30"
            >
              <Crown size={32} className="text-amber-400" />
            </motion.div>
            <h2 className="text-3xl font-display font-bold text-white mb-3 text-center">Unlock the Ultimate ATS Builder</h2>
            <p className="text-gray-400 text-center max-w-md mb-8">
              Get access to AI-powered resume generation, real-time ATS scoring, and deep AI scans to land your dream job faster.
            </p>
            <Button size="lg" icon={Sparkles} onClick={() => setShowPremiumModal(true)} className="bg-gradient-to-r from-amber-500 to-purple-600 text-white border-0 hover:from-amber-400 hover:to-purple-500 shadow-lg shadow-purple-500/20">
              Upgrade to Pro
            </Button>
          </div>
           
          <div className="grid grid-cols-3 gap-6 p-6 opacity-30 select-none pointer-events-none filter blur-[2px]">
            <div className="col-span-1 space-y-4">
              <div className="h-40 bg-white/5 rounded-xl border border-white/10"></div>
              <div className="h-64 bg-white/5 rounded-xl border border-white/10"></div>
            </div>
            <div className="col-span-1 space-y-4">
              <div className="h-32 bg-white/5 rounded-xl border border-white/10"></div>
              <div className="h-32 bg-white/5 rounded-xl border border-white/10"></div>
            </div>
            <div className="col-span-1 bg-white/10 rounded-xl min-h-[600px] border border-white/20"></div>
          </div>
        </div>

        <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} featureName="Ultimate Resume Builder" />
      </div>
    );
  }

  if (!hasBaseResume) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <FileText size={28} className="text-primary-lighter" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Base Resume Found</h2>
        <p className="text-gray-400 mb-6">You need to upload and analyze your existing resume first before building a customized one.</p>
        <Button onClick={() => navigate('/resume')}>Go to Upload</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={() => navigate('/resume')} className="text-sm text-gray-400 hover:text-white flex items-center gap-1 mb-2 transition-colors">
            <ArrowLeft size={16} /> Back to Resume
          </button>
          <h1 className="text-2xl font-bold font-display text-white mb-1 flex items-center gap-2">
            <Wand2 size={24} className="text-primary" /> ATS Resume Builder
          </h1>
          <p className="text-gray-400 text-sm">Curate a highly optimized resume tailored to your target role.</p>
        </motion.div>
        
        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-wrap gap-2 md:gap-3">
            <Button variant="secondary" icon={RefreshCw} onClick={() => setStep(1)} className="text-sm">Re-generate</Button>
            <Button variant="secondary" icon={Save} onClick={handleSave} loading={saving} className="text-sm">Save Draft</Button>
            <Button icon={Download} onClick={handlePrint} className="text-sm">PDF</Button>
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
            <div className="card space-y-6">
              <h2 className="text-lg font-bold text-white border-b border-border pb-4">Resume Preferences</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Target Role</label>
                <Input value={prefs.target_role} onChange={(e) => setPrefs({...prefs, target_role: e.target.value})} placeholder="e.g. Senior Machine Learning Engineer" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Experience Level</label>
                  <select 
                    value={prefs.experience_level} 
                    onChange={(e) => setPrefs({...prefs, experience_level: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-gray-100 focus:outline-none focus:border-primary/50"
                  >
                    <option>Entry Level</option>
                    <option>Mid-Level</option>
                    <option>Senior Level</option>
                    <option>Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Tone</label>
                  <select 
                    value={prefs.tone} 
                    onChange={(e) => setPrefs({...prefs, tone: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-gray-100 focus:outline-none focus:border-primary/50"
                  >
                    <option>Professional</option>
                    <option>Technical & Analytical</option>
                    <option>Leadership Focused</option>
                    <option>Creative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Key Achievements to Highlight (Optional)</label>
                <textarea 
                  value={prefs.key_achievements} 
                  onChange={(e) => setPrefs({...prefs, key_achievements: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary/50 resize-none h-24"
                  placeholder="e.g. Increased revenue by 20%, Built scalable microservices..."
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button icon={Wand2} onClick={handleGenerate} disabled={!prefs.target_role}>Generate ATS Resume</Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Wand2 size={24} className="text-primary animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Crafting your perfect resume...</h3>
              <p className="text-gray-400 text-sm">Analyzing skills, restructuring experience, and optimizing for ATS.</p>
            </div>
          </motion.div>
        )}

        {step === 3 && draft && (
          <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Top Row: Editor & Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Editor Pane */}
              <div className="space-y-6 h-auto lg:h-[calc(100vh-220px)] lg:overflow-y-auto pr-0 lg:pr-2 custom-scrollbar">
              
              {/* Summary */}
              <div className="card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2 uppercase tracking-wider"><FileText size={16}/> Professional Summary</h3>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    icon={Sparkles} 
                    onClick={handleGenerateSummary} 
                    loading={generatingSummary}
                    className="h-8 text-xs py-1 px-3 border-primary/30 text-primary-lighter hover:bg-primary/10"
                  >
                    AI Generate
                  </Button>
                </div>
                <textarea 
                  value={draft.summary} 
                  onChange={(e) => handleManualEdit('summary', null, null, e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-gray-100 focus:outline-none focus:border-primary/50 resize-none h-32"
                  disabled={generatingSummary}
                />
              </div>

              {/* Experience */}
              <div className="space-y-4">
                {draft.experience?.map((exp, i) => (
                  <div key={i} className="card space-y-4 relative">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2 uppercase tracking-wider"><Briefcase size={16}/> Experience {i + 1}</h3>
                      <button onClick={() => handleRemoveSectionItem('experience', i)} className="text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input value={exp.title} onChange={(e) => handleManualEdit('experience', i, 'title', e.target.value)} placeholder="Job Title" />
                      <Input value={exp.company} onChange={(e) => handleManualEdit('experience', i, 'company', e.target.value)} placeholder="Company" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input value={exp.date} onChange={(e) => handleManualEdit('experience', i, 'date', e.target.value)} placeholder="Dates" />
                      <Input value={exp.location} onChange={(e) => handleManualEdit('experience', i, 'location', e.target.value)} placeholder="Location" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500 font-medium uppercase">Bullet Points</label>
                      {exp.bullets?.map((bullet, j) => (
                        <div key={j} className="flex gap-2">
                          <textarea 
                            value={bullet} 
                            onChange={(e) => handleArrayEdit('experience', i, 'bullets', j, e.target.value)}
                            className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-gray-100 focus:outline-none focus:border-primary/50 resize-none h-16"
                          />
                          <button onClick={() => handleRemoveBullet('experience', i, 'bullets', j)} className="text-gray-500 hover:text-red-400 transition-colors p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" icon={Plus} className="!text-xs mt-1" onClick={() => handleAddBullet('experience', i, 'bullets')}>
                        Add Bullet Point
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="secondary" icon={Plus} className="w-full border-dashed" onClick={() => handleAddSectionItem('experience', { title: '', company: '', location: '', date: '', bullets: [''] })}>
                  Add Experience
                </Button>
              </div>

              {/* Education */}
              {/* Education */}
              <div className="space-y-4">
                {draft.education?.map((edu, i) => (
                  <div key={i} className="card space-y-4 relative">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2 uppercase tracking-wider"><Award size={16}/> Education {i + 1}</h3>
                      <button onClick={() => handleRemoveSectionItem('education', i)} className="text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input value={edu.degree} onChange={(e) => handleManualEdit('education', i, 'degree', e.target.value)} placeholder="Degree" />
                      <Input value={edu.institution} onChange={(e) => handleManualEdit('education', i, 'institution', e.target.value)} placeholder="Institution" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input value={edu.date} onChange={(e) => handleManualEdit('education', i, 'date', e.target.value)} placeholder="Dates" />
                      <Input value={edu.details} onChange={(e) => handleManualEdit('education', i, 'details', e.target.value)} placeholder="Details (e.g. GPA: 3.8)" />
                    </div>
                  </div>
                ))}
                <Button variant="secondary" icon={Plus} className="w-full border-dashed" onClick={() => handleAddSectionItem('education', { degree: '', institution: '', date: '', details: '' })}>
                  Add Education
                </Button>
              </div>

              {/* Projects */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2 uppercase tracking-wider"><FileText size={16}/> Projects</h3>
                {draft.projects?.map((proj, i) => (
                  <div key={i} className="card space-y-4 relative">
                    <div className="flex items-center justify-end absolute top-4 right-4">
                      <button onClick={() => handleRemoveSectionItem('projects', i)} className="text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input value={proj.name} onChange={(e) => handleManualEdit('projects', i, 'name', e.target.value)} placeholder="Project Name" />
                      <Input value={proj.url} onChange={(e) => handleManualEdit('projects', i, 'url', e.target.value)} placeholder="URL (Optional)" />
                    </div>
                    <textarea 
                      value={proj.description} 
                      onChange={(e) => handleManualEdit('projects', i, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-gray-100 focus:outline-none focus:border-primary/50 resize-none h-16"
                    />
                  </div>
                ))}
                <Button variant="secondary" icon={Plus} className="w-full border-dashed" onClick={() => handleAddSectionItem('projects', { name: '', description: '', url: '', technologies: [] })}>
                  Add Project
                </Button>
              </div>

              {/* Custom Sections */}
              {draft.custom_sections?.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2 uppercase tracking-wider">Custom Sections</h3>
                  {draft.custom_sections.map((section, i) => (
                    <div key={i} className="card space-y-4 relative border-primary/20 border">
                      <div className="flex items-center justify-between">
                        <Input value={section.title} onChange={(e) => handleCustomSectionEdit(i, 'title', e.target.value)} placeholder="Section Title (e.g. Certifications)" className="max-w-[200px]" />
                        <button onClick={() => handleRemoveCustomSection(i)} className="text-gray-500 hover:text-red-400 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {section.items?.map((item, j) => (
                          <div key={j} className="flex gap-2">
                            <Input 
                              value={item} 
                              onChange={(e) => handleCustomSectionEdit(i, null, e.target.value, j)}
                              placeholder="Item description..."
                            />
                            <button onClick={() => handleRemoveCustomItem(i, j)} className="text-gray-500 hover:text-red-400 transition-colors p-2">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" icon={Plus} className="!text-xs mt-1" onClick={() => handleAddCustomItem(i)}>
                          Add Item
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <Button variant="secondary" icon={Plus} className="w-full border-dashed mt-4 border-primary/30 text-primary hover:bg-primary/10" onClick={handleAddCustomSection}>
                Add Custom Section
              </Button>

            </div>

            {/* Live Preview / PDF Export Pane */}
            <div className="bg-gray-200 rounded-2xl flex flex-col h-[500px] lg:h-[calc(100vh-220px)] shadow-inner relative overflow-hidden">
              
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md text-gray-800">
                <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors">
                  <ZoomOut size={18} />
                </button>
                <span className="text-xs font-semibold w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(2.0, z + 0.1))} className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors">
                  <ZoomIn size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-auto custom-scrollbar p-4 lg:p-8 flex justify-start lg:justify-center items-start">
                {/* The printable component wrapper */}
                <div 
                  className="origin-top transition-transform duration-200 w-[210mm]"
                  style={{ transform: `scale(${zoom})` }}
                >
                  <div 
                    ref={printRef} 
                    className="bg-white shadow-xl" 
                    style={{ 
                      width: '210mm', 
                      minHeight: '297mm', 
                      padding: '20mm', 
                      color: '#000',
                      fontFamily: 'Times New Roman, serif'
                    }}
                  >
                    {/* Personal Info */}
                    <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
                    <h1 className="text-3xl font-bold uppercase tracking-wider mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                      {draft.personal_info?.name || 'YOUR NAME'}
                    </h1>
                    <div className="text-sm flex flex-wrap justify-center gap-x-4 gap-y-1">
                      <span>{draft.personal_info?.email}</span>
                      <span>•</span>
                      <span>{draft.personal_info?.phone}</span>
                      <span>•</span>
                      <span>{draft.personal_info?.location}</span>
                      {draft.personal_info?.linkedin && (
                        <><span>•</span><span>{draft.personal_info?.linkedin}</span></>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  {draft.summary && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>Professional Summary</h2>
                      <p className="text-sm leading-relaxed">{draft.summary}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {draft.skills && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>Skills</h2>
                      <div className="text-sm space-y-1">
                        {draft.skills.technical?.length > 0 && (
                          <p><strong>Technical:</strong> {draft.skills.technical.join(', ')}</p>
                        )}
                        {draft.skills.soft?.length > 0 && (
                          <p><strong>Soft Skills:</strong> {draft.skills.soft.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {draft.experience?.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>Experience</h2>
                      <div className="space-y-4">
                        {draft.experience.map((exp, i) => (
                          <div key={i}>
                            <div className="flex justify-between items-end mb-1">
                              <h3 className="font-bold text-md">{exp.title}</h3>
                              <span className="text-sm italic">{exp.date}</span>
                            </div>
                            <div className="flex justify-between items-end mb-2">
                              <span className="italic text-sm">{exp.company}</span>
                              <span className="text-sm">{exp.location}</span>
                            </div>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              {exp.bullets?.map((bullet, j) => (
                                <li key={j} className="pl-1 leading-snug">{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {draft.education?.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>Education</h2>
                      <div className="space-y-3">
                        {draft.education.map((edu, i) => (
                          <div key={i}>
                            <div className="flex justify-between items-end mb-1">
                              <h3 className="font-bold text-md">{edu.degree}</h3>
                              <span className="text-sm italic">{edu.date}</span>
                            </div>
                            <div className="flex justify-between items-end">
                              <span className="italic text-sm">{edu.institution}</span>
                              <span className="text-sm">{edu.details}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {draft.projects?.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>Projects</h2>
                      <div className="space-y-3">
                        {draft.projects.map((proj, i) => (
                          <div key={i}>
                            <div className="flex justify-between items-end mb-1">
                              <h3 className="font-bold text-md">{proj.name}</h3>
                              {proj.url && <span className="text-sm italic">{proj.url}</span>}
                            </div>
                            <p className="text-sm mb-1">{proj.description}</p>
                            {proj.technologies?.length > 0 && (
                              <p className="text-sm italic text-gray-600">Technologies: {proj.technologies.join(', ')}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Sections */}
                  {draft.custom_sections?.length > 0 && draft.custom_sections.map((section, i) => (
                    <div key={i} className="mb-6">
                      <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
                        {section.title || "Custom Section"}
                      </h2>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {section.items?.map((item, j) => item.trim() && (
                          <li key={j} className="pl-1 leading-snug">{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  
                </div>
              </div>
            </div>
            </div> {/* End of Live Preview Pane */}
            </div> {/* End of Top Row Grid */}

            {/* Bottom Row: ATS Score Panel */}
            <div className="w-full max-w-4xl mx-auto h-[600px] lg:h-[500px]">
               <ATSScorePanel scoreData={scoreData} draft={draft} targetRole={prefs.target_role} onAutoFix={handleAutoFix} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
