import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, Bookmark, TrendingUp, DollarSign, Briefcase, ArrowRight } from 'lucide-react';
import { careerAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { CircularProgress } from '../../components/ui/Progress';
import EmptyState from '../../components/ui/EmptyState';
import toast from '../../utils/toast';
import DynamicLoader from '../../components/ui/DynamicLoader';

export default function CareerRecommendationPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [desiredCompany, setDesiredCompany] = useState('');

  useEffect(() => { fetchRecommendations(); }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await careerAPI.getRecommendations();
      setRecommendations(res.data.recommendations || []);
    } catch {} finally { setLoading(false); }
  };

  const generateRecommendations = async () => {
    setGenerating(true);
    try {
      const res = await careerAPI.recommend({ desired_company: desiredCompany });
      setRecommendations(res.data.recommendations || []);
      toast.success('Career recommendations generated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate recommendations');
    } finally { setGenerating(false); }
  };

  const saveCareer = async (career) => {
    try {
      await careerAPI.save(career);
      toast.success('Career saved!');
    } catch { toast.error('Already saved'); }
  };

  const demandColors = { High: 'green', Medium: 'yellow', Low: 'red', 'Very High': 'green' };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <DynamicLoader texts={["Loading your career profile...", "Fetching recommendations..."]} subtext="" />
      </div>
    );
  }

  if (generating) {
    return (
      <div className="py-20 max-w-2xl mx-auto">
        <DynamicLoader
          texts={[
            "Analyzing your skills and experience...",
            "Scanning current job market trends...",
            "Matching profile with emerging roles...",
            "Curating personalized career paths...",
            "Finalizing AI recommendations..."
          ]}
          subtext="Our AI is crafting personalized career recommendations just for you."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white mb-1">Career Recommendations</h1>
          <p className="text-gray-400 text-sm">AI-generated career paths based on your profile and resume.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            placeholder="Target Company (Optional)"
            className="input !py-2 !px-3 w-full sm:w-48 text-sm"
            value={desiredCompany}
            onChange={(e) => setDesiredCompany(e.target.value)}
          />
          <Button icon={Sparkles} onClick={generateRecommendations} loading={generating}>
            {recommendations.length > 0 ? 'Regenerate' : 'Generate'}
          </Button>
        </div>
      </motion.div>

      {recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((career, i) => (
            <motion.div key={career.career_name || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="card hover:border-primary/30 cursor-pointer group" onClick={() => setSelectedCareer(career)}>
              <div className="flex items-start gap-4">
                <CircularProgress value={career.match_percentage || 0} size={60} strokeWidth={5} color={career.match_percentage >= 80 ? '#22C55E' : career.match_percentage >= 60 ? '#F59E0B' : '#EF4444'} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">{career.career_name}</h3>
                    <Badge color={demandColors[career.future_demand] || 'blue'}>{career.future_demand || 'Growing'}</Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{career.job_description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    {career.average_salary && <span className="flex items-center gap-1"><DollarSign size={12} />{career.average_salary}</span>}
                    {career.industry && <span className="flex items-center gap-1"><Briefcase size={12} />{career.industry}</span>}
                    {career.growth_potential && <span className="flex items-center gap-1"><TrendingUp size={12} />{career.growth_potential} Growth</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); saveCareer(career); }} className="p-2 hover:bg-white/5 rounded-lg" aria-label="Save career">
                    <Bookmark size={18} className="text-gray-400 hover:text-accent" />
                  </button>
                  <ArrowRight size={18} className="text-gray-600 group-hover:text-primary-lighter mt-2 transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Compass} title="No Recommendations Yet" description="Complete your profile and upload your resume to get personalized career recommendations." action="Generate Recommendations" onAction={generateRecommendations} />
      )}

      {}
      <Modal isOpen={!!selectedCareer} onClose={() => setSelectedCareer(null)} title={selectedCareer?.career_name} size="lg">
        {selectedCareer && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <CircularProgress value={selectedCareer.match_percentage} size={80} strokeWidth={6} color="#22C55E" />
              <div>
                <p className="text-2xl font-bold text-white">{selectedCareer.match_percentage}% Match</p>
                <p className="text-sm text-gray-400">{selectedCareer.industry}</p>
              </div>
            </div>

            {selectedCareer.reason_for_match && (
              <div><h4 className="text-sm font-semibold text-white mb-1">Why You Match</h4><p className="text-sm text-gray-400">{selectedCareer.reason_for_match}</p></div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface rounded-xl p-3"><p className="text-xs text-gray-500">Salary Range</p><p className="text-sm font-medium text-white">{selectedCareer.average_salary || 'N/A'}</p></div>
              <div className="bg-surface rounded-xl p-3"><p className="text-xs text-gray-500">Difficulty</p><p className="text-sm font-medium text-white">{selectedCareer.learning_difficulty || 'Moderate'}</p></div>
              <div className="bg-surface rounded-xl p-3"><p className="text-xs text-gray-500">Growth</p><p className="text-sm font-medium text-white">{selectedCareer.growth_potential || 'Good'}</p></div>
              <div className="bg-surface rounded-xl p-3"><p className="text-xs text-gray-500">Demand</p><p className="text-sm font-medium text-white">{selectedCareer.future_demand || 'High'}</p></div>
            </div>

            {selectedCareer.required_skills?.length > 0 && (
              <div><h4 className="text-sm font-semibold text-white mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">{selectedCareer.required_skills.map((s) => <Badge key={s} color="purple">{s}</Badge>)}</div></div>
            )}

            {selectedCareer.recommended_courses?.length > 0 && (
              <div><h4 className="text-sm font-semibold text-white mb-2">Recommended Courses</h4>
                <ul className="space-y-1">{selectedCareer.recommended_courses.map((c, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />{c}</li>
                ))}</ul></div>
            )}

            {selectedCareer.interview_process && (
              <div className="bg-surface/50 rounded-xl p-4 border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-2">Interview & Selection Process</h4>
                <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{selectedCareer.interview_process}</p>
              </div>
            )}

            {selectedCareer.company_specific_plan && (
              <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                <h4 className="text-sm font-semibold text-primary-lighter mb-2">Company Specific Plan</h4>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedCareer.company_specific_plan}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button onClick={() => { saveCareer(selectedCareer); setSelectedCareer(null); }} icon={Bookmark}>Save Career</Button>
              <Button variant="secondary" onClick={() => setSelectedCareer(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
