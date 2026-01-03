import { Link } from 'react-router-dom';
import Button from './Button';

export default function GameCard({
  id,
  title,
  subtitle,
  description,
  icon,
  iconBgColor = 'bg-pink-100 dark:bg-pink-900',
  iconColor = 'text-pink-500',
  status = 'live', // 'live', 'maintenance', 'coming-soon'
  playerCount,
  thumbnail,
  onPlay,
}) {
  const statusConfig = {
    live: {
      badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      text: 'Live',
    },
    maintenance: {
      badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      text: 'Maintenance',
    },
    'coming-soon': {
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      text: 'Coming Soon',
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.live;
  const isDisabled = status !== 'live';

  return (
    <div 
      className={`
        bg-white dark:bg-slate-800 overflow-hidden rounded-lg shadow 
        border border-gray-200 dark:border-gray-700 
        hover:shadow-lg transition-shadow duration-300 
        ${isDisabled ? 'opacity-75' : ''}
      `}
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gray-900 overflow-hidden flex items-center justify-center">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={title} 
            className="absolute inset-0 w-full h-full object-cover opacity-60 hover:opacity-75 transition-opacity"
          />
        ) : (
          <div className="grid grid-cols-7 gap-1 p-4 transform group-hover:scale-105 transition-transform duration-500">
            {[...Array(14)].map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full ${
                  ['bg-red-500', 'bg-orange-500', 'bg-yellow-400', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500'][i % 7]
                } ${i >= 7 ? 'opacity-50' : ''}`}
              />
            ))}
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatus.badge}`}>
            {currentStatus.text}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${iconBgColor} flex items-center justify-center`}>
              <span className={`material-icons ${iconColor}`}>{icon || 'favorite'}</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="material-icons text-base mr-1">people</span> 
            {playerCount ? `${playerCount} playing` : 'N/A'}
          </div>
          
          {isDisabled ? (
            <Button variant="secondary" size="sm" disabled>
              Unavailable
            </Button>
          ) : (
            <Link to={id ? `/game/${id}` : '/game'}>
              <Button variant="primary" size="sm" onClick={onPlay}>
                Play Now
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
