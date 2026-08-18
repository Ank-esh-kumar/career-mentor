import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Save, Plus, X, User } from 'lucide-react';
import { profileAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Progress from '../../components/ui/Progress';
import toast from '../../utils/toast';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const { register, handleSubmit, setValue, watch } = useForm();
  const skills = watch('skills') || [];
  const interests = watch('interests') || [];

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await profileAPI.get();
        setProfile(res.data);
        const p = res.data;
        ['full_name', 'phone', 'location', 'bio', 'linkedin_url', 'github_url', 'portfolio_url'].forEach(
          (f) => setValue(f, p[f] || '')
        );
        setValue('skills', p.skills || []);
        setValue('interests', p.interests || []);
        setValue('languages', (p.languages || []).join(', '));
        setValue('career_preferences', (p.career_preferences || []).join(', '));
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, [setValue]);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setValue('skills', [...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => setValue('skills', skills.filter((s) => s !== skill));

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setValue('interests', [...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest) => setValue('interests', interests.filter((i) => i !== interest));

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        languages: data.languages ? data.languages.split(',').map((l) => l.trim()).filter(Boolean) : [],
        career_preferences: data.career_preferences ? data.career_preferences.split(',').map((c) => c.trim()).filter(Boolean) : [],
      };
      const res = await profileAPI.update(payload);
      setProfile(res.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-white mb-1">Profile</h1>
        <p className="text-gray-400 text-sm">Complete your profile for better AI recommendations.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Progress value={profile?.profile_completion || 0} label="Profile Completion" color="blue" />
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><User size={18} /> Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" {...register('full_name')} placeholder="John Doe" />
            <Input label="Phone" {...register('phone')} placeholder="+1 234 567 8900" />
            <Input label="Location" {...register('location')} placeholder="San Francisco, CA" />
            <Input label="Languages" {...register('languages')} placeholder="English, Spanish" />
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea {...register('bio')} rows={3} className="input-field resize-none" placeholder="Tell us about yourself..." />
          </div>
        </motion.div>

        {}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card space-y-4">
          <h2 className="text-lg font-semibold text-white">Skills</h2>
          <div className="flex gap-2">
            <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="input-field flex-1" placeholder="Add a skill..." />
            <Button type="button" variant="secondary" onClick={addSkill} icon={Plus}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary-lighter rounded-lg text-sm">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)} className="hover:text-white"><X size={14} /></button>
              </span>
            ))}
          </div>
        </motion.div>

        {}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card space-y-4">
          <h2 className="text-lg font-semibold text-white">Interests & Career Preferences</h2>
          <div className="flex gap-2">
            <input value={newInterest} onChange={(e) => setNewInterest(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              className="input-field flex-1" placeholder="Add an interest..." />
            <Button type="button" variant="secondary" onClick={addInterest} icon={Plus}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span key={interest} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-sm">
                {interest}
                <button type="button" onClick={() => removeInterest(interest)} className="hover:text-white"><X size={14} /></button>
              </span>
            ))}
          </div>
          <Input label="Career Preferences" {...register('career_preferences')} placeholder="e.g., Remote, Tech, Startup" />
        </motion.div>

        {}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card space-y-4">
          <h2 className="text-lg font-semibold text-white">Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="LinkedIn" {...register('linkedin_url')} placeholder="https://linkedin.com/in/..." />
            <Input label="GitHub" {...register('github_url')} placeholder="https://github.com/..." />
            <Input label="Portfolio" {...register('portfolio_url')} placeholder="https://..." />
          </div>
        </motion.div>

        <Button type="submit" icon={Save} loading={saving} className="w-full md:w-auto">Save Profile</Button>
      </form>
    </div>
  );
}
