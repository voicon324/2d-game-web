const DOT_COLORS = {
  0: 'bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600',
  1: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]',
  2: 'bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]',
  3: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]',
  4: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]',
  5: 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]',
  6: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
  7: 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]',
  8: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse ring-4 ring-offset-2 ring-pink-500 ring-offset-slate-100 dark:ring-offset-slate-800',
};

// Heart pattern for 13x13 grid
const HEART_PATTERN = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,1,0,0,0,1,1,1,0,0],
  [0,1,7,7,7,1,0,1,7,7,7,1,0],
  [0,1,2,2,2,2,1,2,2,2,2,1,0],
  [0,1,4,4,4,3,3,3,4,4,4,1,0],
  [0,0,1,5,5,5,5,5,5,5,1,0,0],
  [0,0,0,1,5,5,5,5,5,1,0,0,0],
  [0,0,0,0,1,6,5,6,1,0,0,0,0],
  [0,0,0,0,0,1,6,1,0,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,8],
];

export default function DotGrid({ 
  pattern = HEART_PATTERN, 
  size = 13, 
  interactive = true,
  className = '' 
}) {
  return (
    <div 
      className={`grid gap-1 sm:gap-2 board-bg ${className}`}
      style={{ 
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`
      }}
    >
      {pattern.flat().map((colorType, index) => (
        <button
          key={index}
          tabIndex={interactive ? 0 : -1}
          className={`
            w-full aspect-square rounded-full dot-shadow game-dot
            ${DOT_COLORS[colorType] || DOT_COLORS[0]}
            focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 
            dark:focus:ring-offset-slate-800
            ${!interactive ? 'cursor-default' : ''}
          `}
          aria-label={`Game cell ${index}`}
          disabled={!interactive}
        />
      ))}
    </div>
  );
}

// Mini dot grid for logo/branding
export function MiniDotGrid({ className = '' }) {
  return (
    <div className={`grid grid-cols-3 gap-1.5 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl ${className}`}>
      <div className="w-2.5 h-2.5 rounded-full bg-pink-500"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-indigo-400"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-purple-400"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-teal-400"></div>
    </div>
  );
}
