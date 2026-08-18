import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Trash2, ChevronDown, ChevronUp, Briefcase, TrendingUp, Building2, ExternalLink, Target, CheckCircle2, Circle } from 'lucide-react';
import { careerAPI, resumeAPI } from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';
import { CircularProgress } from '../../components/ui/Progress';
import toast from '../../utils/toast';

export default function SavedCareersPage() {
  const [careers, setCareers] = useState([]);
  const [resumeSkills, setResumeSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [careersRes, resumeRes] = await Promise.all([
        careerAPI.getSaved(),
        resumeAPI.get().catch(() => ({ data: null }))
      ]);
      setCareers(careersRes.data);
      if (resumeRes?.data?.parsed_data?.skills) {
        setResumeSkills(resumeRes.data.parsed_data.skills);
      }
    } catch {} finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await careerAPI.deleteSaved(id);
      setCareers((prev) => prev.filter((c) => c.id !== id));
      toast.success('Career removed');
    } catch { toast.error('Failed to remove'); }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-white mb-1">Saved Careers</h1>
        <p className="text-gray-400 text-sm">{careers.length} career{careers.length !== 1 ? 's' : ''} saved</p>
      </motion.div>

      {careers.length > 0 ? (
        <div className="space-y-4">
          {careers.map((career, i) => {
            const isExpanded = expandedId === career.id;
            const details = career.details || career; // Handle legacy saves

            return (
              <motion.div key={career.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card overflow-hidden">
                {/* Header Section (Always Visible) */}
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => toggleExpand(career.id)}>
                  <div className="flex items-center gap-4 flex-1">
                    <CircularProgress value={career.match_percentage || details.match_percentage || 0} size={56} strokeWidth={4} color="#22C55E" />
                    <div>
                      <h3 className="text-lg font-bold text-white">{career.career_name || details.career_name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-lighter border border-primary/20">
                          {career.industry || details.industry}
                        </span>
                        <span className="text-xs text-gray-400">💰 {career.average_salary || details.average_salary}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(career.id); }} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors" aria-label="Remove saved career">
                      <Trash2 size={18} />
                    </button>
                    <button className="p-2 bg-surface rounded-lg text-gray-400 hover:text-white transition-colors">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-white/5 space-y-6">

                        {}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                          <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                              <TrendingUp size={16} className="text-emerald-400" /> Market Insights
                            </h4>
                            <div className="bg-surface/50 p-4 rounded-xl border border-white/5 space-y-3">
                              <p className="text-sm text-gray-400 leading-relaxed">
                                {details.real_world_situation || details.job_description || "No market data available for this legacy save."}
                              </p>
                              <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
                                {details.average_salary && (
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <span className="text-gray-500">Avg Salary:</span>
                                    <span className="text-emerald-400 font-semibold">{details.average_salary}</span>
                                  </div>
                                )}
                                {details.match_percentage && (
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <span className="text-gray-500">Skill Readiness:</span>
                                    <span className="text-primary-lighter font-semibold">{details.match_percentage}%</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                              <Target size={16} className="text-primary-lighter" /> Path & Roadmap
                            </h4>
                            <div className="bg-surface/50 p-4 rounded-xl border border-white/5 space-y-2">
                              <p className="text-sm text-gray-300 font-medium mb-3">{details.roadmap_summary || "No roadmap summary available."}</p>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400">Demand: <strong className="text-white">{details.future_demand}</strong></span>
                                <span className="text-gray-400">Growth: <strong className="text-white">{details.growth_potential}</strong></span>
                                <span className="text-gray-400">Difficulty: <strong className="text-white">{details.learning_difficulty}</strong></span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {}
                        <div className="space-y-3 pt-2">
                          <h4 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                            <Briefcase size={16} className="text-amber-400" /> Skills Analysis
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                              {(() => {
                                const userSkillNames = resumeSkills.map(s => s.toLowerCase().trim());
                                const trueMatchingSkills = (details.required_skills || []).filter(rs => {
                                  return userSkillNames.some(us => us.includes(rs.toLowerCase().trim()) || rs.toLowerCase().trim().includes(us));
                                });

                                const enrichedMatchingSkills = trueMatchingSkills.map(skillName => {
                                  let desc = null;
                                  if (details.matching_skills) {
                                    const match = details.matching_skills.find(ms => {
                                      const msName = (typeof ms === 'object' && ms !== null ? ms.skill_name : ms).toLowerCase().trim();
                                      return msName.includes(skillName.toLowerCase().trim()) || skillName.toLowerCase().trim().includes(msName);
                                    });
                                    if (match && typeof match === 'object') desc = match.description;
                                  }
                                  return { skillName, desc };
                                });

                                return (
                                  <>
                                    <div className="flex items-center justify-between mb-3">
                                      <p className="text-xs text-emerald-400 font-semibold uppercase">Matching Skills (From Resume)</p>
                                      <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                                        {enrichedMatchingSkills.length}
                                      </span>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                      {enrichedMatchingSkills.length > 0 ? (
                                        enrichedMatchingSkills.map((s, idx) => (
                                          <div key={idx} className="bg-emerald-500/10 rounded-lg p-2.5">
                                            <div className="flex items-center gap-1.5 mb-1 text-emerald-300">
                                              <CheckCircle2 size={14} className="shrink-0" />
                                              <span className="text-sm font-semibold">{s.skillName}</span>
                                            </div>
                                            {s.desc && <p className="text-xs text-emerald-400/80 leading-relaxed pl-5">{s.desc}</p>}
                                          </div>
                                        ))
                                      ) : (
                                        <span className="text-sm text-gray-500">No specific matching skills found in resume.</span>
                                      )}
                                    </div>
                                  </>
                                );
                              })()}
                            </div>

                            <div className="bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">
                              {(() => {

                                const userSkillNames = resumeSkills.map(s => s.toLowerCase().trim());

                                const skillsToLearn = (details.required_skills || []).filter(rs => {
                                  return !userSkillNames.some(us => us.includes(rs.toLowerCase().trim()) || rs.toLowerCase().trim().includes(us));
                                });

                                return (
                                  <>
                                    <div className="flex items-center justify-between mb-3">
                                      <p className="text-xs text-rose-400 font-semibold uppercase">Skills to Learn</p>
                                      <span className="text-xs font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full">
                                        {skillsToLearn.length}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {skillsToLearn.length > 0 ? (
                                        skillsToLearn.map((s, idx) => (
                                          <span key={idx} className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-rose-500/10 text-rose-300 rounded-lg border border-rose-500/20">
                                            <Circle size={12} /> {s}
                                          </span>
                                        ))
                                      ) : (
                                        <span className="text-sm text-gray-500">You have all the required skills!</span>
                                      )}
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>

                        {}
                        {details.hiring_companies && details.hiring_companies.length > 0 && (
                          <div className="space-y-3 pt-2">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                              <Building2 size={16} className="text-blue-400" /> Actively Hiring
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {details.hiring_companies.map((company, idx) => (
                                <a
                                  key={idx}
                                  href={company.placement_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-3 bg-surface/50 hover:bg-surface border border-white/5 hover:border-white/10 rounded-xl transition-all group"
                                >
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-200 group-hover:text-white">{company.company_name}</span>
                                    {company.estimated_salary && (
                                      <span className="text-xs text-emerald-400 mt-0.5">{company.estimated_salary}</span>
                                    )}
                                  </div>
                                  <ExternalLink size={14} className="text-gray-500 group-hover:text-primary-lighter transition-colors" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {}
                        {(details.interview_process || details.company_specific_plan) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            {details.interview_process && (
                              <div className="bg-surface/50 rounded-xl p-4 border border-white/5">
                                <h4 className="text-sm font-semibold text-white mb-2">Interview & Selection Process</h4>
                                <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{details.interview_process}</p>
                              </div>
                            )}

                            {details.company_specific_plan && (
                              <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                                <h4 className="text-sm font-semibold text-primary-lighter mb-2">Company Specific Plan</h4>
                                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{details.company_specific_plan}</p>
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Bookmark} title="No Saved Careers" description="Save careers from your recommendations to compare and track them here." />
      )}
    </div>
  );
}
