import React from 'react';
import { User, UserRound, UserCircle, Square, Circle, Hexagon } from 'lucide-react';
import { Gender } from '../types';

interface GenderIconProps {
  gender?: Gender | 'other';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const GenderIcon: React.FC<GenderIconProps> = ({ gender, className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  const currentSizeClass = sizeClasses[size];
  const currentIconSizeClass = iconSizeClasses[size];

  switch (gender) {
    case 'female':
      return (
        <div className={`relative group/icon ${currentSizeClass}`}>
          <Circle className={`${currentSizeClass} text-accent-rose/30 fill-accent-rose/10 group-hover/icon:scale-110 transition-transform`} />
          <UserRound className={`${className} ${currentIconSizeClass} absolute inset-0 m-auto text-accent-rose`} />
        </div>
      );
    case 'male':
      return (
        <div className={`relative group/icon ${currentSizeClass}`}>
          <Square className={`${currentSizeClass} text-accent-sky/30 fill-accent-sky/10 rounded-lg group-hover/icon:scale-110 transition-transform`} />
          <User className={`${className} ${currentIconSizeClass} absolute inset-0 m-auto text-accent-sky`} />
        </div>
      );
    case 'non-binary':
    case 'other':
    default:
      return (
        <div className={`relative group/icon ${currentSizeClass}`}>
          <Hexagon className={`${currentSizeClass} text-accent-amber/30 fill-accent-amber/10 group-hover/icon:scale-110 transition-transform`} />
          <UserCircle className={`${className} ${currentIconSizeClass} absolute inset-0 m-auto text-accent-amber`} />
        </div>
      );
  }
};
