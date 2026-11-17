import React from 'react';

const VARIANTS = {
  default: 'bg-paper-surface text-ink border-paper-border shadow-paper-sm',
  warm: 'bg-paper-warm text-ink border-paper-border/80 shadow-paper-sm',
  ink: 'bg-ink text-paper border-ink-border shadow-ink-sm',
  elevated: 'bg-paper-surface text-ink border-paper-border shadow-paper-md',
};

export function Card({
  children,
  variant = 'default',
  className = '',
  as: Component = 'div',
  ...props
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.default;

  return (
    <Component
      className={`
        border rounded-sm p-5 md:p-6 transition-all duration-150
        ${variantClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
}
