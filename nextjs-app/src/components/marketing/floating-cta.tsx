'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFloatingCTA } from './floating-cta-context';

type FloatingCTAProps = {
  onGetStarted: () => void;
};

export function FloatingCTA({ onGetStarted }: FloatingCTAProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { isVisible, setIsVisible, setIsExpanded: setGlobalExpanded } = useFloatingCTA();

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setIsVisible]);

  useEffect(() => {
    // Sync local state with global context
    setGlobalExpanded(isExpanded);
  }, [isExpanded, setGlobalExpanded]);

  // Auto-minimize on mobile to save space
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 640) {
        setIsExpanded(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClick = () => {
    onGetStarted();
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 15 }}
          className="fixed bottom-6 right-6 z-40"
        >
          {isExpanded ? (
            <motion.div
              layout
              className="relative group"
            >
              {/* Glowing effect */}
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all" />

              <Button
                size="lg"
                onClick={handleClick}
                className="relative h-12 sm:h-14 px-3 sm:px-6 gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold shadow-2xl hover:shadow-primary/50 transition-all group"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.div>
                <span className="whitespace-nowrap text-xs sm:text-sm">Начать</span>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Minimize button */}
              <button
                onClick={handleMinimize}
                className="absolute -top-2 -right-2 h-6 w-6 bg-background border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-lg"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              layout
              onClick={() => setIsExpanded(true)}
              className="relative h-12 w-12 sm:h-14 sm:w-14 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center shadow-2xl group"
            >
              {/* Glowing effect */}
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all" />

              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="relative"
              >
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </motion.div>

              {/* Ping animation */}
              <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
