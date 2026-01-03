const variants = {
  primary: 
    'bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-500/30 dark:shadow-pink-500/20',
  secondary: 
    'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700',
  outline: 
    'border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-pink-500 dark:hover:border-pink-500',
  ghost:
    'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3.5 text-base',
};

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon,
  iconPosition = 'left',
  disabled = false,
  ...props 
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 
        font-semibold rounded-xl 
        transition-all transform hover:-translate-y-0.5 active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="material-icons-round text-lg">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="material-icons-round text-lg">{icon}</span>
      )}
    </button>
  );
}
