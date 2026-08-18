import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  outline: 'px-6 py-3 border border-primary/50 text-primary-light hover:bg-primary/10 font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
};

const sizes = {
  sm: '!px-4 !py-2 text-sm',
  md: '',
  lg: '!px-8 !py-4 text-lg',
};

const Button = forwardRef(({
  children, variant = 'primary', size = 'md', disabled, loading, className = '',
  icon: Icon, iconRight, ...props
}, ref) => {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${variants[variant]} ${sizes[size]} inline-flex items-center justify-center gap-2
        ${disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon && !iconRight ? (
        <Icon size={18} />
      ) : null}
      {children}
      {Icon && iconRight && !loading ? <Icon size={18} /> : null}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
