import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from '../../utils/toast';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const passwordValue = watch('password', '');

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength(passwordValue);

  const getStrengthColor = (score) => {
    if (score === 0) return 'bg-gray-700';
    if (score <= 2) return 'bg-red-500';
    if (score <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const getStrengthText = (score) => {
    if (score === 0) return '';
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Fair';
    return 'Strong';
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signup(data.full_name, data.email, data.password);
      toast.success('Account created! Welcome to Career Mentor.');
      navigate('/dashboard');
    } catch (err) {
      console.error('SIGNUP ERROR:', err);
      if (err.response) {
        console.error('SIGNUP ERROR RESPONSE:', err.response.data);
      }
      toast.error(err.response?.data?.detail || err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      toast.success('Welcome to Career Mentor!');
      navigate('/dashboard');
    } catch {
      toast.error('Google signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex relative">
      <Link to="/" className="absolute top-6 left-6 z-50 p-2 bg-surface-card/50 hover:bg-surface-card border border-border rounded-full text-gray-400 hover:text-white transition-all backdrop-blur-md">
        <ArrowLeft size={20} />
      </Link>
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-surface to-surface" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative z-10 text-center px-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-8">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold font-display text-white mb-4">Start Your Journey</h1>
          <p className="text-lg text-gray-400 max-w-md">Join thousands of professionals who found their dream career with AI-powered guidance.</p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold font-display text-white">Career Mentor</span>
          </div>
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold font-display text-white mb-2">Create account</h2>
            <p className="text-gray-400">Begin your AI-powered career journey</p>
          </div>

          {/* Google — uses credential (ID token) flow */}
          {import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your-google-client-id.apps.googleusercontent.com' && (
            <>
              <div className="flex justify-center mb-6 w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google signup failed')}
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  text="continue_with"
                />
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-border" /><span className="text-xs text-gray-500 uppercase">or</span><div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input label="Full Name" icon={User} placeholder="John Doe" error={errors.full_name?.message}
              {...register('full_name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} />
            <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" error={errors.email?.message}
              {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
            <div className="relative">
              <Input label="Password" type={showPassword ? 'text' : 'password'} icon={Lock} placeholder="Min 8 characters"
                error={errors.password?.message}
                {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-300" aria-label="Toggle password">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

              {passwordValue && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <div
                        key={index}
                        className={`flex-1 rounded-full transition-colors duration-300 ${
                          index <= strengthScore ? getStrengthColor(strengthScore) : 'bg-surface-card border border-border'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-medium ${strengthScore <= 2 ? 'text-red-400' : strengthScore <= 4 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {getStrengthText(strengthScore)} Password
                    </span>
                  </div>
                  
                  {strengthScore < 5 && (
                    <div className="text-xs text-gray-500 mt-1 bg-surface-card p-3 rounded-lg border border-border">
                      <p className="text-gray-300 mb-2 font-medium">To make it stronger, add:</p>
                      <ul className="space-y-1">
                        {passwordValue.length <= 8 && <li>• More than 8 characters</li>}
                        {!/[A-Z]/.test(passwordValue) && <li>• Uppercase letters</li>}
                        {!/[a-z]/.test(passwordValue) && <li>• Lowercase letters</li>}
                        {!/[0-9]/.test(passwordValue) && <li>• Numbers</li>}
                        {!/[^A-Za-z0-9]/.test(passwordValue) && <li>• Special characters (!@#$%)</li>}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" loading={loading}>Create Account</Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-lighter hover:underline font-medium">Log in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
