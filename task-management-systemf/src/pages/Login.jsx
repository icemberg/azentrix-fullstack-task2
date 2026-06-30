import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../components/ui/ThemeToggle';
import { ArrowRight, User, Lock, Loader2, LayoutGrid } from 'lucide-react';
import { login as loginApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { useToastStore } from '../store/toast.store';
import { useMutation } from '@tanstack/react-query';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const addToast = useToastStore((state) => state.addToast);

  const from = location.state?.from?.pathname || '/dashboard';

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setAuth(data.token, { username: data.username, email: data.email, role: data.role, avatar: data.avatar });
      addToast({ type: 'success', message: 'Welcome back!' });
      navigate(from, { replace: true });
    },
    onError: (error) => {
      addToast({ 
        type: 'error', 
        message: error.response?.data?.message || 'Login failed' 
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const staggerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (custom) => ({
      opacity: 1, 
      y: 0, 
      transition: { delay: custom * 0.1, duration: 0.4, ease: 'easeOut' }
    })
  };

  return (
    <div className="flex min-h-screen bg-base relative">
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
            <div className="w-64 h-64 border border-border-focus rounded-2xl rotate-12 skew-x-12 relative flex items-center justify-center">
               <div className="absolute inset-4 border border-subtle rounded-xl bg-elevated/50 backdrop-blur-sm -translate-y-4 translate-x-4" />
               <LayoutGrid size={48} className="text-accent-blue relative z-10 -translate-y-8 translate-x-8" />
            </div>
          </motion.div>
          <div className="relative z-10 mt-32">
            <h2 className="font-display font-semibold text-3xl text-primary leading-tight mb-4">
              Pick up right <br />where you left off.
            </h2>
            <p className="font-sans text-[15px] text-secondary max-w-sm leading-relaxed">
              Your tasks, boards, and team are waiting for you. Dive back into focus mode.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-secondary">
          <div className="flex -space-x-3">
            {[1,2,3].map((i) => (
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
            <h1 className="font-display font-semibold text-[32px] text-primary mb-2">Welcome Back</h1>
            <p className="font-sans text-base text-secondary">Log in to your account to continue.</p>
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

            <motion.div custom={2} initial="hidden" animate="visible" variants={staggerVariants}>
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

            <motion.div custom={3} initial="hidden" animate="visible" variants={staggerVariants} className="pt-4">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full h-11 bg-accent-blue hover:bg-[#3d7ae6] active:scale-[0.98] text-white font-sans font-semibold text-[14px] rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_0_12px_rgba(79,142,247,0.4)] hover:-translate-y-[1px]"
              >
                {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Log In'}
                {!mutation.isPending && <ArrowRight size={16} />}
              </button>
            </motion.div>
          </form>

          <motion.div custom={4} initial="hidden" animate="visible" variants={staggerVariants} className="mt-8 text-center flex flex-col gap-2">
            <p className="font-sans text-[14px] text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent-blue font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue rounded px-1 -mx-1">
                Create one
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
