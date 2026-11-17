import React from 'react';

const VARIANTS = {
  neutral: 'bg-paper-warm text-ink-soft border-paper-border',
  sage: 'bg-sage-light text-sage-dark border-sage-border font-medium',
  terracotta: 'bg-terracotta-light text-terracotta-dark border-terracotta-border font-medium',
  ink: 'bg-ink text-paper border-ink-soft',
  gold: 'bg-gold-light text-gold border-gold-border font-medium',
};

export function Badge({ children, variant = 'neutral', className = '', ...props }) {
  const variantClass = VARIANTS[variant] || VARIANTS.neutral;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm text-xs font-mono tracking-tight border
        ${variantClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}
