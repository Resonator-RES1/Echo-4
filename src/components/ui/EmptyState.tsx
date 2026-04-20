import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center p-4 h-full"
    >
      <div className="w-24 h-24 rounded-xl bg-surface-container-low/40 border border-white/10 flex items-center justify-center mb-8 relative group shadow-2xl backdrop-blur-md">
        <div className="absolute inset-0 rounded-xl bg-primary/5 scale-0 group-hover:scale-110 transition-transform duration-700 opacity-0 group-hover:opacity-100" />
        <Icon className="w-12 h-12 text-on-surface-variant/20 group-hover:text-primary/40 transition-colors duration-500 relative z-10" />
      </div>
      <h3 className="font-headline text-3xl font-bold mb-3 text-on-surface tracking-tight text-glow">{title}</h3>
      <p className="text-on-surface-variant/60 max-w-sm mx-auto text-sm leading-relaxed italic font-serif">
        {description}
      </p>
      {action && (
        <div className="mt-10">
          {action}
        </div>
      )}
    </motion.div>
  );
};
