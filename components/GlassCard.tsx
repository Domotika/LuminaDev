
import React, { forwardRef } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  active?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className = '', onClick, active = false, style, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        onClick={onClick}
        style={style}
        className={`
          relative overflow-hidden rounded-2xl border transition-colors duration-300 ease-out
          ${active 
            ? 'bg-white/20 border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
            : 'bg-black/30 border-white/10 hover:bg-white/10 hover:border-white/30'
          }
          backdrop-blur-xl
          ${className}
          ${onClick ? 'cursor-pointer' : ''}
        `}
        {...props}
      >
        <div className="relative z-10 h-full w-full">
          {children}
        </div>
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
