import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, LayoutGrid, Users, CheckSquare, Search, Zap, Moon } from 'lucide-react';
import ThemeToggle from '../components/ui/ThemeToggle';

// 1. Global Setup
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const fadeUpSlow = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const words1 = "The standard for".split(" ");
const words2 = "engineering teams.".split(" ");

const HowItWorksAnimation = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4000); 
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { title: 'Create a Workspace', desc: 'Set up your personal or team environment in seconds.' },
    { title: 'Build your Board', desc: 'Define your columns, statuses, and workflow rules.' },
    { title: 'Execute', desc: 'Drag, drop, and conquer your tasks with the team.' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full mt-12 text-left">
      {/* Left side: Steps */}
      <div className="flex flex-col gap-4">
        {steps.map((step, i) => (
          <div 
            key={i} 
            onClick={() => setActiveStep(i)}
            className={`cursor-pointer p-6 rounded-xl border transition-all duration-300 ${activeStep === i ? 'bg-accent-blue/5 border-accent-blue/30' : 'bg-transparent border-transparent hover:bg-elevated/50'}`}
          >
            <div className="flex items-center gap-4 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-[13px] font-bold transition-colors ${activeStep === i ? 'bg-accent-blue text-white' : 'bg-elevated border border-dim text-muted'}`}>
                {i + 1}
              </div>
              <h4 className={`font-display font-bold text-lg ${activeStep === i ? 'text-primary' : 'text-secondary'}`}>{step.title}</h4>
            </div>
            <p className={`font-sans text-sm pl-12 ${activeStep === i ? 'text-secondary' : 'text-muted'}`}>{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Right side: Mock UI Animation */}
      <div className="relative w-full aspect-video bg-surface border border-dim rounded-xl overflow-hidden shadow-2xl flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {activeStep === 0 && (
            <motion.div 
              key="step0"
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={prefersReducedMotion ? false : { opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-72 bg-base border border-dim rounded-lg shadow-xl flex flex-col overflow-hidden"
            >
              <div className="h-10 border-b border-dim flex items-center px-4 font-sans font-medium text-[13px] text-primary">
                Create Workspace
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div>
                  <div className="w-16 h-2 bg-elevated rounded-full mb-2"></div>
                  <motion.div 
                    initial={prefersReducedMotion ? false : { width: 0 }}
                    animate={prefersReducedMotion ? false : { width: "100%" }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                    className="h-8 bg-elevated border border-subtle rounded flex items-center px-2 overflow-hidden whitespace-nowrap"
                  >
                    <span className="font-mono text-xs text-primary">Engineering Team|</span>
                  </motion.div>
                </div>
                <motion.div 
                  initial={prefersReducedMotion ? false : { backgroundColor: "rgba(59, 130, 246, 0.5)" }}
                  animate={prefersReducedMotion ? false : { backgroundColor: "rgba(59, 130, 246, 1)" }}
                  transition={{ delay: 2.0, duration: 0.2 }}
                  className="h-8 rounded bg-accent-blue text-white font-sans text-xs flex items-center justify-center mt-2"
                >
                  Create
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div 
              key="step1"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={prefersReducedMotion ? false : { opacity: 1 }}
              exit={prefersReducedMotion ? false : { opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full flex items-start gap-4 p-4"
            >
              {['To Do', 'In Progress', 'Done'].map((col, idx) => (
                <motion.div 
                  key={col}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.3 + 0.1, duration: 0.4 }}
                  className="flex-1 bg-void/50 border border-dim rounded-lg h-full flex flex-col p-3"
                >
                  <div className="font-sans font-medium text-[12px] text-primary mb-3">{col}</div>
                  <motion.div initial={prefersReducedMotion ? false : { opacity: 0 }} animate={prefersReducedMotion ? false : { opacity: 1 }} transition={{ delay: 1.2 + idx * 0.2 }} className="w-full h-16 bg-base border border-dim rounded-md mb-2"></motion.div>
                  {idx === 0 && <motion.div initial={prefersReducedMotion ? false : { opacity: 0 }} animate={prefersReducedMotion ? false : { opacity: 1 }} transition={{ delay: 1.8 }} className="w-full h-16 bg-base border border-dim rounded-md"></motion.div>}
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div 
              key="step2"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={prefersReducedMotion ? false : { opacity: 1 }}
              exit={prefersReducedMotion ? false : { opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full flex items-start gap-4 p-4 relative"
            >
              <div className="flex-1 bg-void/50 border border-dim rounded-lg h-full flex flex-col p-3">
                <div className="font-sans font-medium text-[12px] text-primary mb-3">To Do</div>
                <div className="w-full h-16 bg-base border border-dim rounded-md mb-2 opacity-50"></div>
              </div>
              <div className="flex-1 bg-void/50 border border-dim rounded-lg h-full flex flex-col p-3">
                <div className="font-sans font-medium text-[12px] text-primary mb-3">In Progress</div>
              </div>
              <div className="flex-1 bg-void/50 border border-dim rounded-lg h-full flex flex-col p-3">
                <div className="font-sans font-medium text-[12px] text-primary mb-3">Done</div>
              </div>
              
              {/* Moving Card */}
              <motion.div 
                initial={prefersReducedMotion ? false : { left: '1.25rem', top: '3.75rem' }}
                animate={prefersReducedMotion ? false : { left: 'calc(33.33% + 0.75rem)', top: '3.75rem' }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeInOut" }}
                className="absolute w-[calc(33.33%-2rem)] h-16 bg-base border border-accent-blue rounded-md shadow-lg flex flex-col justify-center px-3 z-10 mock-card-glow"
              >
                <div className="w-3/4 h-2 bg-elevated rounded-full mb-2"></div>
                <div className="w-1/2 h-2 bg-elevated rounded-full"></div>
                <motion.div 
                  initial={prefersReducedMotion ? false : { opacity: 0, scale: 0 }}
                  animate={prefersReducedMotion ? false : { opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, duration: 0.3 }}
                  className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-accent-amber border border-base"
                ></motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ProductPreviewMock = () => {
  const [movingCardCol, setMovingCardCol] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMovingCardCol(prev => (prev === 0 ? 1 : 0));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 32, scale: 0.98 }}
      animate={prefersReducedMotion ? false : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: prefersReducedMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl mx-auto mt-16 bg-surface border border-dim rounded-xl shadow-2xl overflow-hidden flex flex-col h-[400px] text-left"
    >
      <div className="h-12 border-b border-dim flex items-center px-4 gap-4 bg-base shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-accent-red/80"></div>
          <div className="w-3 h-3 rounded-full bg-accent-amber/80"></div>
          <div className="w-3 h-3 rounded-full bg-accent-emerald/80"></div>
        </div>
        <div className="flex-1"></div>
        <div className="w-48 h-7 bg-elevated rounded-md border border-subtle flex items-center px-2">
           <Search size={12} className="text-muted" />
        </div>
      </div>
      <div className="flex-1 p-6 grid grid-cols-3 gap-6 bg-void/50">
        {/* Column 1 */}
        <div className="flex flex-col gap-3">
          <div className="font-sans font-medium text-[13px] text-primary mb-2 flex items-center justify-between">
            <span>To Do</span>
            <span className="text-muted text-[11px] bg-elevated px-2 py-0.5 rounded-full">{movingCardCol === 0 ? 2 : 1}</span>
          </div>
          <div className="bg-base border-l-2 border-l-accent-blue border border-y-dim border-r-dim p-3 rounded-md shadow-sm mock-card-glow text-[13px] text-primary">
            Implement real-time sync via WebSocket
          </div>
          <AnimatePresence>
            {movingCardCol === 0 && (
              <motion.div layout transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="bg-base border border-dim p-3 rounded-md shadow-sm text-[13px] text-primary">
                Design system components
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Column 2 */}
        <div className="flex flex-col gap-3">
          <div className="font-sans font-medium text-[13px] text-primary mb-2 flex items-center justify-between">
            <span>In Progress</span>
            <span className="text-muted text-[11px] bg-elevated px-2 py-0.5 rounded-full">{movingCardCol === 1 ? 2 : 1}</span>
          </div>
          <div className="bg-base border border-dim p-3 rounded-md shadow-sm text-[13px] text-primary mock-card-glow mock-card-glow-delay">
            Framer Motion entrance animations
          </div>
          <AnimatePresence>
            {movingCardCol === 1 && (
              <motion.div layout transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="bg-base border border-dim p-3 rounded-md shadow-sm text-[13px] text-primary">
                Design system components
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Column 3 */}
        <div className="flex flex-col gap-3">
          <div className="font-sans font-medium text-[13px] text-primary mb-2 flex items-center justify-between">
            <span>Done</span>
            <span className="text-muted text-[11px] bg-elevated px-2 py-0.5 rounded-full">3</span>
          </div>
          <div className="bg-base border border-dim p-3 rounded-md shadow-sm text-[13px] text-primary opacity-60 line-through">
            Setup Spring Boot backend
          </div>
          <div className="bg-base border border-dim p-3 rounded-md shadow-sm text-[13px] text-primary opacity-60 line-through">
            Configure Postgres database
          </div>
          <div className="bg-base border border-dim p-3 rounded-md shadow-sm text-[13px] text-primary opacity-60 line-through">
            JWT Authentication
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#features') {
      const section = document.getElementById('features');
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  const handleViewFeatures = () => {
    const section = document.getElementById('features');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      const heading = section?.querySelector('h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus();
      }
    }, 600);
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -4 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  };

  const navStagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } }
  };

  return (
    <div className="min-h-screen bg-void flex flex-col items-center relative overflow-x-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-blue/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-violet/10 blur-[100px] rounded-full pointer-events-none" />

      {/* 2. Navbar Entrance Animation */}
      <header className="sticky top-0 w-full h-20 px-8 flex items-center justify-between z-50 bg-void/80 backdrop-blur-md border-b border-dim">
        <div className="flex items-center gap-3">
          <motion.img 
            initial={prefersReducedMotion ? false : { scale: 0.6 }}
            animate={prefersReducedMotion ? false : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            src="/favicon.svg" alt="TaskFlow Logo" className="w-8 h-8 rounded-lg object-contain" 
          />
          <motion.span 
            initial={prefersReducedMotion ? false : { opacity: 0, x: 6 }}
            animate={prefersReducedMotion ? false : { opacity: 1, x: 0 }}
            transition={{ delay: 0.06, duration: 0.3 }}
            className="font-display font-semibold text-xl text-primary"
          >
            TaskFlow
          </motion.span>
        </div>
        <motion.div 
          variants={prefersReducedMotion ? {} : navStagger}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-6"
        >
          <motion.div variants={prefersReducedMotion ? {} : navItemVariants}>
            <Link to="/login" className="font-sans font-medium text-[14px] text-secondary hover:text-primary transition-colors">
              Log in
            </Link>
          </motion.div>
          <motion.div variants={prefersReducedMotion ? {} : navItemVariants}>
            <Link to="/register" className="h-9 px-4 bg-elevated border border-subtle hover:border-moderate hover:bg-hover active:scale-[0.98] text-primary font-sans font-medium text-[14px] rounded-lg transition-all flex items-center justify-center">
              Sign up
            </Link>
          </motion.div>
          <motion.div variants={prefersReducedMotion ? {} : navItemVariants} className="w-px h-5 bg-dim mx-1"></motion.div>
          <motion.div variants={prefersReducedMotion ? {} : navItemVariants}>
            <ThemeToggle />
          </motion.div>
        </motion.div>
      </header>

      {/* 3. Hero Section Word-by-Word Reveal */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center mt-20 pb-24">
        {/* Eyebrow Badge */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
          animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue font-mono text-[11px] font-medium mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-accent-blue live-dot"></span>
          TaskFlow v2.0 is Live
        </motion.div>

        {/* Word-by-word Headline */}
        <motion.h1 
          initial="hidden" 
          animate="visible"
          className="font-display font-bold text-5xl md:text-7xl tracking-tight leading-[1.1] mb-6"
        >
          <motion.span variants={prefersReducedMotion ? {} : staggerContainer} className="block text-primary">
            {words1.map((word, i) => (
              <motion.span key={i} variants={prefersReducedMotion ? {} : fadeUp} className="inline-block mr-[0.25em]">
                {word}
              </motion.span>
            ))}
          </motion.span>
          <motion.span
            variants={prefersReducedMotion ? {} : staggerContainer}
            initial="hidden"
            animate="visible"
            transition={{ delayChildren: prefersReducedMotion ? 0 : 0.14 }}
            className="block bg-gradient-to-r from-accent-blue to-accent-violet bg-clip-text text-transparent pb-2"
          >
            {words2.map((word, i) => (
              <motion.span key={i} variants={prefersReducedMotion ? {} : fadeUp} className="inline-block mr-[0.25em]">
                {word}
              </motion.span>
            ))}
          </motion.span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: prefersReducedMotion ? 0 : 0.4 }}
          className="font-sans text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          A beautiful, high-performance task management system built for developers. Keyboard-first, real-time, and precision-engineered.
        </motion.p>

        {/* CTA Row */}
        <motion.div 
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: prefersReducedMotion ? 0 : 0.55 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Link to="/register" className="cta-primary w-full sm:w-auto h-12 px-8 bg-accent-blue text-white font-sans font-semibold text-[15px] rounded-lg flex items-center justify-center gap-2">
            Get Started for Free
            <ArrowRight size={16} className="arrow-icon" />
          </Link>
          <button onClick={handleViewFeatures} className="cta-secondary w-full sm:w-auto h-12 px-8 bg-elevated border border-subtle text-primary font-sans font-semibold text-[15px] rounded-lg flex items-center justify-center">
            View Features
          </button>
        </motion.div>

        {/* Trust Row */}
        <motion.div 
          variants={prefersReducedMotion ? {} : staggerContainer}
          initial="hidden"
          animate="visible"
          transition={{ delayChildren: prefersReducedMotion ? 0 : 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-secondary"
        >
          {['No credit card required', 'Cancel anytime', 'Real-time sync'].map((feature, i) => (
            <motion.div 
              key={i} 
              variants={prefersReducedMotion ? {} : { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.25 } } }}
              className="flex items-center gap-2"
            >
              <CheckCircle2 size={16} className="text-accent-emerald" />
              <span className="font-sans text-[13px] font-medium">{feature}</span>
            </motion.div>
          ))}
        </motion.div>

      </main>

      {/* 5. Features Section & Product Preview */}
      <section id="features" className="w-full max-w-6xl mx-auto px-6 py-24 border-t border-dim">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={prefersReducedMotion ? {} : staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={prefersReducedMotion ? {} : fadeUp} className="font-display font-bold text-3xl md:text-4xl text-primary outline-none">
            Built for velocity.
          </motion.h2>
          <motion.p variants={prefersReducedMotion ? {} : fadeUpSlow} className="mt-4 text-lg text-secondary max-w-2xl mx-auto">
            Everything you need to manage complex projects, beautifully integrated into a single platform.
          </motion.p>
        </motion.div>

        {/* Integrated Product Preview Mock */}
        <div className="mb-24">
           <ProductPreviewMock />
        </div>

        {/* 6-Card Feature Grid */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={prefersReducedMotion ? {} : staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            { icon: LayoutGrid, title: 'Precision Kanban', desc: 'Drag-and-drop columns and cards with zero latency and smooth animations.' },
            { icon: Users, title: 'Team Workspaces', desc: 'Seamlessly switch between personal and team contexts, invite members, and manage roles.' },
            { icon: CheckSquare, title: 'My Tasks Aggregation', desc: 'A centralized view of all tasks assigned to you across all active boards.' },
            { icon: Search, title: 'Keyboard-First', desc: 'Quick search (⌘K) and shortcuts to navigate the entire app without touching your mouse.' },
            { icon: Zap, title: 'Real-time Sync', desc: 'Instant updates across all connected clients via WebSocket technology.' },
            { icon: Moon, title: 'Beautiful Aesthetics', desc: 'Native dark mode, glassmorphism, and meticulously crafted UI components.' }
          ].map((feat, i) => (
            <motion.div key={i} variants={prefersReducedMotion ? {} : fadeUp} className="feature-card bg-surface border border-dim rounded-xl p-6 text-left cursor-default">
              <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center text-accent-blue mb-4 icon-zone">
                <feat.icon size={20} />
              </div>
              <h3 className="font-display font-bold text-lg text-primary mb-2">{feat.title}</h3>
              <p className="font-sans text-sm text-secondary leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 6. How It Works Timeline */}
      <section className="w-full bg-surface border-t border-dim py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={prefersReducedMotion ? {} : staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={prefersReducedMotion ? {} : fadeUp} className="inline-block px-3 py-1 rounded-full bg-accent-violet/10 text-accent-violet font-mono text-[11px] font-medium mb-4">
              Workflow
            </motion.div>
            <motion.h2 variants={prefersReducedMotion ? {} : fadeUpSlow} className="font-display font-bold text-3xl md:text-4xl text-primary">
              How it works
            </motion.h2>
          </motion.div>

          <HowItWorksAnimation />
        </div>
      </section>

      {/* 9. Footer */}
      <motion.footer 
        initial={prefersReducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={prefersReducedMotion ? {} : fadeUpSlow}
        className="w-full bg-base border-t border-dim py-12 px-6"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="TaskFlow" className="w-5 h-5 rounded object-contain grayscale opacity-60" />
            <span className="font-sans font-medium text-sm text-muted">© 2026 TaskFlow Inc.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="font-sans text-sm text-muted hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="font-sans text-sm text-muted hover:text-primary transition-colors">Terms</a>
            <a href="#" className="font-sans text-sm text-muted hover:text-primary transition-colors">Twitter</a>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;
