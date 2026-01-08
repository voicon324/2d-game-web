import { useState, useEffect } from 'react';

export default function Toast({ 
  type = 'error', 
  title, 
  message, 
  show = false, 
  onClose,
  autoClose = true,
  duration = 5000
}) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show); // eslint-disable-line react-hooks/set-state-in-effect
    if (show && autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, duration, onClose]);

  const styles = {
    error: {
      bg: 'bg-red-50 dark:bg-red-900/90',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-500 dark:text-red-400',
      title: 'text-red-800 dark:text-red-100',
      message: 'text-red-600 dark:text-red-200',
      iconName: 'error',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/90',
      border: 'border-green-200 dark:border-green-800',
      icon: 'text-green-500 dark:text-green-400',
      title: 'text-green-800 dark:text-green-100',
      message: 'text-green-600 dark:text-green-200',
      iconName: 'check_circle',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/90',
      border: 'border-amber-200 dark:border-amber-800',
      icon: 'text-amber-500 dark:text-amber-400',
      title: 'text-amber-800 dark:text-amber-100',
      message: 'text-amber-600 dark:text-amber-200',
      iconName: 'warning',
    },
  };

  const style = styles[type] || styles.error;

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 sm:top-24 sm:right-8 z-50 max-w-sm w-full">
      <div
        className={`
          flex items-start gap-3 p-4 rounded-xl shadow-xl 
          ${style.bg} border ${style.border}
          transform transition-all duration-300
          ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
        role="alert"
      >
        <span className={`material-icons-round ${style.icon} text-xl mt-0.5`}>
          {style.iconName}
        </span>
        <div className="flex-1">
          <p className={`text-sm font-bold ${style.title} leading-tight`}>{title}</p>
          <p className={`text-sm font-medium ${style.message} mt-1 leading-snug`}>{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-100 transition-colors rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800/50 flex-shrink-0"
        >
          <span className="material-icons-round text-lg">close</span>
        </button>
      </div>
    </div>
  );
}
