'use client';

import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

type NotFoundPageProps = {
  onNavigate: (page: string) => void;
};

export function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.h1
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="text-9xl font-bold bg-gradient-to-br from-primary to-primary/50 bg-clip-text text-transparent mb-4"
          >
            404
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold mb-4"
          >
            Page not found
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground text-lg max-w-md mx-auto"
          >
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Go back
          </Button>
          <Button
            onClick={() => onNavigate('landing')}
            size="lg"
            className="gap-2"
          >
            <Home className="h-5 w-5" />
            Go home
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 pt-8 border-t"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Looking for something specific?
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => onNavigate('courses')}
              className="text-sm hover:text-primary transition-colors"
            >
              Browse Courses
            </button>
            <span className="text-muted-foreground">•</span>
            <button
              onClick={() => onNavigate('pricing')}
              className="text-sm hover:text-primary transition-colors"
            >
              View Pricing
            </button>
            <span className="text-muted-foreground">•</span>
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-sm hover:text-primary transition-colors"
            >
              Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function ServerErrorPage({ onNavigate }: NotFoundPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.h1
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="text-9xl font-bold bg-gradient-to-br from-destructive to-destructive/50 bg-clip-text text-transparent mb-4"
          >
            500
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold mb-4"
          >
            Server error
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground text-lg max-w-md mx-auto"
          >
            Oops! Something went wrong on our end. We're working to fix it. Please try again later.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            Try again
          </Button>
          <Button
            onClick={() => onNavigate('landing')}
            size="lg"
            className="gap-2"
          >
            <Home className="h-5 w-5" />
            Go home
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
