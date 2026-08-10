import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Lock, Trash2, Eye, EyeOff } from 'lucide-react';
import { settingsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const [tab, setTab] = useState('notifications');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try { const res = await settingsAPI.get(); setSettings(res.data); } catch {} finally { setLoading(false); }
  };

  const updateSetting = async (key, value) => {
    try {
      const updated = { ...settings, [key]: value };
      await settingsAPI.update(updated);
      setSettings(updated);
      toast.success('Setting updated');
    } catch { toast.error('Update failed'); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { toast.error('Fill in both fields'); return; }
    if (newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    setSaving(true);
    try {
      await settingsAPI.changePassword({ current_password: currentPassword, new_password: newPassword });
      toast.success('Password changed!');
      setCurrentPassword(''); setNewPassword('');
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) return;
    try {
      await settingsAPI.deleteAccount();
      logout();
      navigate('/');
      toast.success('Account deleted');
    } catch { toast.error('Failed to delete account'); }
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ];

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-white mb-1">Settings</h1>
        <p className="text-gray-400 text-sm">Manage your account preferences.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
              ${tab === t.id ? 'bg-primary/10 text-primary-lighter border border-primary/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
            <t.icon size={16} />{t.label}
          </button>
        ))}
      </div>

      {/* Notifications */}
      {tab === 'notifications' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive important updates via email' },
            { key: 'career_updates', label: 'Career Updates', desc: 'Get notified about new career recommendations' },
            { key: 'weekly_digest', label: 'Weekly Digest', desc: 'Receive a weekly summary of your progress' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div><p className="text-sm font-medium text-white">{item.label}</p><p className="text-xs text-gray-500">{item.desc}</p></div>
              <button onClick={() => updateSetting('notifications', { ...settings?.notifications, [item.key]: !settings?.notifications?.[item.key] })}
                className={`w-11 h-6 rounded-full transition-colors ${settings?.notifications?.[item.key] ? 'bg-primary' : 'bg-gray-700'} relative`}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${settings?.notifications?.[item.key] ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {/* Security */}
      {tab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card space-y-4">
          <h3 className="text-lg font-semibold text-white">Change Password</h3>
          {user?.auth_provider === 'google' ? (
            <p className="text-sm text-gray-400">Password management is not available for Google sign-in accounts.</p>
          ) : (
            <>
              <div className="relative">
                <Input label="Current Password" type={showCurrentPw ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-[38px] text-gray-500">
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="relative">
                <Input label="New Password" type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-[38px] text-gray-500">
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Button onClick={handleChangePassword} loading={saving} icon={Lock}>Change Password</Button>
            </>
          )}
        </motion.div>
      )}

      {/* Privacy */}
      {tab === 'privacy' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card space-y-4">
          {[
            { key: 'profile_visible', label: 'Public Profile', desc: 'Allow others to see your profile' },
            { key: 'show_email', label: 'Show Email', desc: 'Display your email on your public profile' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div><p className="text-sm font-medium text-white">{item.label}</p><p className="text-xs text-gray-500">{item.desc}</p></div>
              <button onClick={() => updateSetting('privacy', { ...settings?.privacy, [item.key]: !settings?.privacy?.[item.key] })}
                className={`w-11 h-6 rounded-full transition-colors ${settings?.privacy?.[item.key] ? 'bg-primary' : 'bg-gray-700'} relative`}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${settings?.privacy?.[item.key] ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {/* Danger */}
      {tab === 'danger' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card border-red-500/20 space-y-4">
          <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
          <p className="text-sm text-gray-400">Once you delete your account, there is no going back. All your data will be permanently removed.</p>
          <Button variant="danger" icon={Trash2} onClick={handleDeleteAccount}>Delete My Account</Button>
        </motion.div>
      )}
    </div>
  );
}
