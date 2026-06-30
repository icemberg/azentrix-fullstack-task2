import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../components/ui/ThemeToggle';
import { ArrowRight, Mail, Lock, User, Loader2 } from 'lucide-react';
import { register as registerApi } from '../api/auth.api';
import { useToastStore } from '../store/toast.store';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', role: 'USER', password: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const addToast = useToastStore((state) => state.addToast);

  const mutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      // Auto-login or redirect to login. Let's redirect to login for now if no token returned, 
      // or if token returned, set it. The current API returns just a message usually, but let's check.
      addToast({ type: 'success', message: 'Account created successfully!' });
      const from = location.state?.from?.pathname;
      navigate('/login', from ? { state: { from: { pathname: from } } } : {});
    },
    onError: (error) => {
      addToast({
        type: 'error',
        message: error.response?.data?.message || 'Registration failed'
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const googleLoginMutation = useMutation({
    mutationFn: async (credential) => {
      const response = await api.post('/v1/auth/google', { idToken: credential });
      return response.data;
    },
    onSuccess: (data) => {
      // For registration with Google, the backend currently handles it identically to login
      // If the user doesn't exist, it creates them. 
      // If we had a separate store logic, we'd use setAuth here. Let's just import and use setAuth.
      useAuthStore.getState().setAuth(data.token, { username: data.username, email: data.email, role: data.role, avatar: data.avatar });
      addToast({ type: 'success', message: 'Signed up with Google successfully!' });
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    },
    onError: (error) => {
      addToast({ type: 'error', message: error.response?.data?.message || 'Google signup failed' });
    }
  });

  const staggerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.4, ease: 'easeOut' }
    })
  };

  return (
    <div className="min-h-screen bg-void flex relative">
      {/* Top right absolute controls */}
      <div className="absolute top-8 right-8 z-20">
        <ThemeToggle />
      </div>

      {/* Left Branded Panel (40%) */}
      <div className="hidden lg:flex w-[40%] bg-surface flex-col justify-between p-12 border-r border-dim">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="TaskFlow" className="w-10 h-10 rounded-xl shadow-glow-blue object-contain bg-white p-1" />
          <span className="font-display font-semibold text-2xl text-primary tracking-tight">TaskFlow</span>
        </div>

        <div className="flex-1 flex flex-col justify-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none"
          >
            {/* Isometric abstract grid or card stack representation */}
            <div className="w-64 h-64 border border-border-focus rounded-2xl rotate-12 skew-x-12 relative">
              <div className="absolute inset-4 border border-subtle rounded-xl bg-elevated/50 backdrop-blur-sm -translate-y-6 translate-x-6" />
              <div className="absolute inset-8 border border-subtle rounded-lg bg-accent-blue/10 backdrop-blur-md -translate-y-12 translate-x-12" />
            </div>
          </motion.div>
          <div className="relative z-10 mt-32">
            <h2 className="font-display font-semibold text-3xl text-primary leading-tight mb-4">
              Where planning <br />meets execution.
            </h2>
            <p className="font-sans text-[15px] text-secondary max-w-sm leading-relaxed">
              Join thousands of teams who have already transformed the way they work with TaskFlow's precision-engineered board system.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-secondary">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-elevated border-2 border-surface flex items-center justify-center">
                <User size={14} className="text-muted" />
              </div>
            ))}
          </div>
          <span className="font-sans text-[13px]">Trusted by 10,000+ teams</span>
        </div>
      </div>

      {/* Right Form Panel (60%) */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-24">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-2 mb-12">
          <img src="/favicon.svg" alt="TaskFlow" className="w-8 h-8 rounded-lg object-contain bg-white p-1" />
          <span className="font-display font-semibold text-xl text-primary">TaskFlow</span>
        </div>

        <div className="w-full max-w-md mx-auto">
          <motion.div custom={0} initial="hidden" animate="visible" variants={staggerVariants} className="mb-8">
            <h1 className="font-display font-semibold text-[32px] text-primary mb-2">Join TaskFlow</h1>
            <p className="font-sans text-base text-secondary">Start organizing your work in seconds.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div custom={1} initial="hidden" animate="visible" variants={staggerVariants}>
              <label className="block font-sans font-medium text-[13px] text-secondary mb-1.5">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full h-11 bg-elevated border border-subtle rounded-lg pl-10 pr-4 font-sans text-[14px] text-primary placeholder:text-muted focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue focus-pulse transition-all"
                  placeholder="e.g. alex.dev"
                />
              </div>
            </motion.div>

            <motion.div custom={1.5} initial="hidden" animate="visible" variants={staggerVariants}>
              <label className="block font-sans font-medium text-[13px] text-secondary mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-11 bg-elevated border border-subtle rounded-lg pl-10 pr-4 font-sans text-[14px] text-primary placeholder:text-muted focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue focus-pulse transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </motion.div>

            <motion.div custom={2} initial="hidden" animate="visible" variants={staggerVariants}>
              <label className="block font-sans font-medium text-[13px] text-secondary mb-1.5">Role</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full h-11 bg-elevated border border-subtle rounded-lg pl-10 pr-4 font-sans text-[14px] text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue focus-pulse transition-all appearance-none"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="#8892A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div custom={3} initial="hidden" animate="visible" variants={staggerVariants}>
              <label className="block font-sans font-medium text-[13px] text-secondary mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-11 bg-elevated border border-subtle rounded-lg pl-10 pr-4 font-sans text-[14px] text-primary placeholder:text-muted focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue focus-pulse transition-all"
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            <motion.div custom={4} initial="hidden" animate="visible" variants={staggerVariants} className="pt-4">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full h-11 bg-accent-blue hover:bg-[#3d7ae6] active:scale-[0.98] text-white font-sans font-semibold text-[14px] rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_0_12px_rgba(79,142,247,0.4)] hover:-translate-y-[1px]"
              >
                {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
                {!mutation.isPending && <ArrowRight size={16} />}
              </button>
            </motion.div>
          </form>

          <motion.div custom={4.5} initial="hidden" animate="visible" variants={staggerVariants} className="mt-6 flex flex-col items-center">
            <div className="relative w-full mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-subtle"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-base px-2 text-muted font-medium uppercase tracking-wider">or sign up with</span>
              </div>
            </div>
            <GoogleLogin 
              onSuccess={(res) => googleLoginMutation.mutate(res.credential)}
              onError={() => addToast({ type: 'error', message: 'Google login failed' })}
              shape="rectangular"
              theme="filled_blue"
              text="signup_with"
              size="large"
              width="100%"
            />
          </motion.div>

          <motion.div custom={5} initial="hidden" animate="visible" variants={staggerVariants} className="mt-8 text-center">
            <p className="font-sans text-[14px] text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-blue font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue rounded px-1 -mx-1">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
