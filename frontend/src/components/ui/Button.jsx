import React from 'react';
import { motion } from 'motion/react';

const VARIANTS = {
  primary: 'bg-ink text-paper hover:bg-ink-soft active:bg-ink border-transparent shadow-ink-sm',
  secondary: 'bg-paper-surface text-ink hover:bg-paper-warm active:bg-paper-muted border-paper-border shadow-paper-sm',
  outline: 'bg-transparent text-ink hover:bg-paper-warm active:bg-paper-muted border-ink-border',
  ghost: 'bg-transparent text-ink hover:bg-paper-warm active:bg-paper-muted border-transparent',
  sage: 'bg-sage text-paper hover:bg-sage-dark active:bg-sage border-transparent shadow-paper-sm',
  'sage-light': 'bg-sage-light text-sage-dark hover:bg-sage-border/40 border-sage-border',
  terracotta: 'bg-terracotta text-paper hover:bg-terracotta-dark active:bg-terracotta border-transparent shadow-paper-sm',
  'terracotta-light': 'bg-terracotta-light text-terracotta-dark hover:bg-terracotta-border/40 border-terracotta-border',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs tracking-wide',
  md: 'px-4 py-2.5 text-sm tracking-tight',
  lg: 'px-6 py-3.5 text-base font-medium',
  icon: 'p-2 text-sm',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  onClick,
  type = 'button',
  ...props
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.1 }}
      className={`
        inline-flex items-center justify-center gap-2 border font-sans font-medium rounded-sm
        transition-colors duration-150 select-none cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2
        ${variantClass}
        ${sizeClass}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
