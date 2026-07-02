import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';

const NotFound = () => {
  const token = useAuthStore(state => state.token);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="w-20 h-20 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto">
          <AlertCircle size={40} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold text-primary">404</h1>
          <h2 className="text-xl font-semibold text-primary">Page not found</h2>
          <p className="text-muted text-sm max-w-sm mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto h-10 px-4 rounded-md border border-border text-primary font-medium hover:bg-hover transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Go back
          </button>
          
          <Link 
            to={token ? "/dashboard" : "/"}
            className="w-full sm:w-auto h-10 px-4 rounded-md bg-accent text-white font-medium hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Home size={16} />
            {token ? "Go to Dashboard" : "Go to Home"}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
