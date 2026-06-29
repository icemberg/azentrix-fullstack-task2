import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent-blue/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-violet/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="absolute top-0 w-full h-20 px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center">
            <span className="font-display font-bold text-sm text-white">T</span>
          </div>
          <span className="font-display font-semibold text-xl text-primary">TaskFlow</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="font-sans font-medium text-[14px] text-secondary hover:text-primary transition-colors">
            Log in
          </Link>
          <Link to="/register" className="h-9 px-4 bg-elevated border border-subtle hover:border-moderate hover:bg-hover active:scale-[0.98] text-primary font-sans font-medium text-[14px] rounded-lg transition-all flex items-center justify-center">
            Sign up
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue font-mono text-[11px] font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-blue"></span>
            </span>
            TaskFlow v2.0 is Live
          </div>
          <h1 className="font-display font-bold text-5xl md:text-7xl text-primary tracking-tight leading-[1.1] mb-6">
            The standard for <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-violet">engineering teams.</span>
          </h1>
          <p className="font-sans text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            A beautiful, high-performance task management system built for developers. Keyboard-first, real-time, and precision-engineered.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto h-12 px-8 bg-accent-blue hover:bg-[#3d7ae6] active:scale-[0.98] text-white font-sans font-semibold text-[15px] rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_0_16px_rgba(79,142,247,0.4)] hover:-translate-y-[1px]">
              Get Started for Free
              <ArrowRight size={16} />
            </Link>
            <a href="#features" className="w-full sm:w-auto h-12 px-8 bg-elevated border border-subtle hover:border-moderate hover:bg-hover active:scale-[0.98] text-primary font-sans font-semibold text-[15px] rounded-lg transition-all flex items-center justify-center">
              View Features
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-secondary">
            {['No credit card required', 'Cancel anytime', 'Real-time sync'].map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-accent-emerald" />
                <span className="font-sans text-[13px] font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default LandingPage;
