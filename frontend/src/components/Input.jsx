import { useState } from 'react';

export default function Input({
  label,
  icon,
  type = 'text',
  placeholder,
  className = '',
  error,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500 group-focus-within:text-pink-500 transition-colors">
            <span className="material-icons-round text-xl">{icon}</span>
          </span>
        )}
        <input
          type={inputType}
          placeholder={placeholder}
          className={`
            block w-full py-3 
            ${icon ? 'pl-11' : 'pl-4'} 
            ${isPassword ? 'pr-11' : 'pr-4'}
            border border-slate-200 dark:border-slate-600 rounded-xl 
            bg-slate-50 dark:bg-slate-800/50 
            text-slate-900 dark:text-white 
            placeholder-slate-400 
            focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent 
            transition-all sm:text-sm font-medium
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors focus:outline-none"
          >
            <span className="material-icons-round text-xl">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 ml-1">{error}</p>
      )}
    </div>
  );
}
