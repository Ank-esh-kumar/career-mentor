import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileText, Trash2, Brain, CheckCircle, AlertCircle, X, Wand2, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resumeAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Progress from '../../components/ui/Progress';
import { CircularProgress } from '../../components/ui/Progress';
import EmptyState from '../../components/ui/EmptyState';
import toast from '../../utils/toast';
import { useSubscription } from '../../context/SubscriptionContext';
import PremiumModal from '../../components/ui/PremiumModal';

export default function ResumePage() {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const res = await resumeAPI.get();
      setResume(res.data);
      if (res.data.analysis) setAnalysis(res.data.analysis);
    } catch {} finally { setLoading(false); }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setUploading(true); setUploadProgress(0);
    try {
      const res = await resumeAPI.upload(file, (p) => setUploadProgress(p));
      setResume(res.data);
      toast.success('Resume uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed');
    } finally { setUploading(false); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'application/msword': ['.doc'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await resumeAPI.analyze();
      setAnalysis(res.data);
      toast.success('Resume analyzed!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed');
    } finally { setAnalyzing(false); }
  };

  const handleDelete = async () => {
    try {
      await resumeAPI.delete();
      setResume(null); setAnalysis(null);
      toast.success('Resume deleted');
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-white mb-1">Resume</h1>
        <p className="text-gray-400 text-sm">Upload your resume for AI-powered analysis and career matching.</p>
      </motion.div>

      {}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div {...getRootProps()} className={`card cursor-pointer border-2 border-dashed text-center py-12 transition-all duration-200
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
          <input {...getInputProps()} />
          {uploading ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Upload size={28} className="text-primary-lighter animate-bounce" />
              </div>
              <Progress value={uploadProgress} label="Uploading..." color="blue" />
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Upload size={28} className="text-primary-lighter" />
              </div>
              <p className="text-white font-medium mb-1">{isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}</p>
              <p className="text-sm text-gray-500">PDF, DOCX, or DOC — Max 10MB</p>
              {resume && <p className="text-xs text-gray-600 mt-2">Drop a new file to replace the current resume</p>}
            </>
          )}
        </div>
      </motion.div>

      {}
      {resume && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <FileText size={22} className="text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-white">{resume.filename}</p>
                <p className="text-xs text-gray-500">{(resume.file_size / 1024).toFixed(1)} KB • Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={Brain} onClick={handleAnalyze} loading={analyzing}>
                {analysis ? 'Re-Analyze' : 'Analyze with AI'}
              </Button>
              <Button variant="ghost" icon={Trash2} onClick={handleDelete} className="!text-red-400 hover:!text-red-300" />
            </div>
          </div>

          {}
          {resume.parsed_data?.skills?.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Detected Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {resume.parsed_data.skills.map((skill) => (
                  <Badge key={skill} color="blue">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {}
      {analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Brain size={20} className="text-accent" /> AI Analysis</h2>
            <Button
              onClick={() => isPremium ? navigate('/resume/builder') : setShowPremiumModal(true)}
              className={!isPremium ? "bg-gradient-to-r from-amber-500 to-purple-600 border-0 hover:opacity-90" : ""}
            >
              {!isPremium ? (
                <>
                  <Crown size={16} className="text-amber-400 mr-2" />
                  <span className="text-white">Unlock ATS Builder</span>
                </>
              ) : (
                <>
                  <Wand2 size={16} className="mr-2" />
                  Build Ultimate ATS Resume
                </>
              )}
            </Button>
          </div>

          {}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Career Readiness', value: analysis.career_readiness_score || 0, color: '#2563EB' },
              { label: 'ATS Score', value: analysis.ats_score || 0, color: '#22C55E' },
              { label: 'Skills Match', value: Math.min((analysis.top_skills?.length || 0) * 10, 100), color: '#A855F7' },
              { label: 'Overall', value: analysis.career_readiness_score || 0, color: '#F59E0B' },
            ].map((s) => (
              <div key={s.label} className="card !p-4 flex flex-col items-center">
                <CircularProgress value={s.value} size={60} strokeWidth={5} color={s.color} />
                <p className="text-xs text-gray-400 mt-2">{s.label}</p>
              </div>
            ))}
          </div>

          {}
          {analysis.professional_summary && (
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-2">Professional Summary</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{analysis.professional_summary}</p>
            </div>
          )}

          {}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.strengths?.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><CheckCircle size={16} className="text-emerald-400" /> Strengths</h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.improvement_suggestions?.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><AlertCircle size={16} className="text-amber-400" /> Improvements</h3>
                <ul className="space-y-2">
                  {analysis.improvement_suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {!resume && !loading && (
        <EmptyState icon={FileText} title="No Resume Uploaded" description="Upload your resume to get AI-powered analysis, career recommendations, and skill gap insights." />
      )}

      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} featureName="Ultimate Resume Builder" />
    </div>
  );
}
