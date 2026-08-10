import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from '../../utils/toast';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      console.error('LOGIN ERROR:', err);
      if (err.response) {
        console.error('LOGIN ERROR RESPONSE:', err.response.data);
      }
      toast.error(err.response?.data?.detail || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      toast.success('Welcome!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Google login failed');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex relative">
      <Link to="/" className="absolute top-6 left-6 z-50 p-2 bg-surface-card/50 hover:bg-surface-card border border-border rounded-full text-gray-400 hover:text-white transition-all backdrop-blur-md">
        <ArrowLeft size={20} />
      </Link>
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-surface to-surface" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-center px-12"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(var(--color-primary),0.3)] border border-white/10">
            <Sparkles size={36} className="text-white" />
          </div>
          <h1 className="text-5xl font-extrabold font-display bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4 tracking-tight">
            Career Mentor
          </h1>
          <p className="text-lg text-gray-400 max-w-md mx-auto">Your AI-powered career mentor. Discover your perfect career path with personalized guidance.</p>
        </motion.div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-center gap-3 mb-10 lg:hidden">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_rgba(var(--color-primary),0.3)]">
              <Sparkles size={24} className="text-white" />
            </div>
            <span className="text-3xl font-extrabold font-display bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-tight">Career Mentor</span>
          </div>
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold font-display text-white mb-2">Welcome back</h2>
            <p className="text-gray-400">Log in to continue your career journey</p>
          </div>
          {/* Google — uses credential (ID token) flow */}
          {import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your-google-client-id.apps.googleusercontent.com' && (
            <>
              <div className="flex justify-center mb-6 w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google login failed')}
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  text="continue_with"
                />
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-gray-500 uppercase">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
              })}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-300"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary-lighter hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Log In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary-lighter hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
