import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

export default function ReplayPlayerPage() {
  const { matchId } = useParams();
  const [replay, setReplay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [currentState, setCurrentState] = useState(null);
  const playbackRef = useRef(null);

  // Fetch replay data
  useEffect(() => {
    setLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
    fetch(`/api/replays/match/${matchId}`)
      .then(res => {
        if (!res.ok) throw new Error('Replay not found');
        return res.json();
      })
      .then(data => {
        setReplay(data);
        setCurrentState(data.initialState);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [matchId]);

  // Playback logic
  useEffect(() => {
    if (!isPlaying || !replay || currentActionIndex >= replay.actions.length) {
      return;
    }

    const nextAction = replay.actions[currentActionIndex];
    const delay = currentActionIndex === 0 
      ? 0 
      : (nextAction.timestamp - replay.actions[currentActionIndex - 1].timestamp) / playbackSpeed;

    playbackRef.current = setTimeout(() => {
      setCurrentState(nextAction.resultState);
      setCurrentActionIndex(prev => prev + 1);
    }, delay);

    return () => clearTimeout(playbackRef.current);
  }, [isPlaying, currentActionIndex, replay, playbackSpeed]);

  // Auto-pause at end
  useEffect(() => {
    if (replay && currentActionIndex >= replay.actions.length) {
      setIsPlaying(false); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [currentActionIndex, replay]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentActionIndex(0);
    setCurrentState(replay?.initialState);
    setIsPlaying(true);
  };

  const handleSeek = (index) => {
    setIsPlaying(false);
    setCurrentActionIndex(index);
    if (index === 0) {
      setCurrentState(replay?.initialState);
    } else {
      setCurrentState(replay?.actions[index - 1]?.resultState);
    }
  };

  const progress = replay ? (currentActionIndex / replay.actions.length) * 100 : 0;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading replay...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-xl mx-auto py-12 px-4 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Replay Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link to="/profile" className="text-pink-500 hover:text-pink-600">
            ← Back to Profile
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              <span className="material-icons text-pink-500 mr-2 align-middle">replay</span>
              Match Replay
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Match ID: {matchId}
            </p>
          </div>
          <Link 
            to="/profile" 
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ← Back
          </Link>
        </div>

        {/* Game Board Area */}
        <div className="bg-gray-800 rounded-xl aspect-video flex items-center justify-center mb-6">
          <div className="text-center text-gray-400">
            <span className="material-icons text-6xl mb-4">videogame_asset</span>
            <p>Game board will render here</p>
            <p className="text-sm">Current action: {currentActionIndex} / {replay?.actions?.length || 0}</p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          {/* Progress Bar */}
          <div 
            className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              const index = Math.floor(percent * (replay?.actions?.length || 0));
              handleSeek(Math.max(0, Math.min(index, (replay?.actions?.length || 1) - 1)));
            }}
          >
            <div 
              className="h-full bg-pink-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleRestart}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors"
              title="Restart"
            >
              <span className="material-icons">replay</span>
            </button>

            <button
              onClick={() => handleSeek(Math.max(0, currentActionIndex - 1))}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors"
              title="Previous action"
            >
              <span className="material-icons">skip_previous</span>
            </button>

            <button
              onClick={handlePlayPause}
              className="w-14 h-14 rounded-full bg-pink-500 text-white flex items-center justify-center hover:bg-pink-600 transition-colors"
            >
              <span className="material-icons text-3xl">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <button
              onClick={() => handleSeek(Math.min((replay?.actions?.length || 1) - 1, currentActionIndex + 1))}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors"
              title="Next action"
            >
              <span className="material-icons">skip_next</span>
            </button>

            {/* Speed Control */}
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="ml-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={4}>4x</option>
            </select>
          </div>
        </div>

        {/* Action Timeline */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 max-h-48 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Action Timeline</h3>
          <div className="space-y-2">
            {replay?.actions?.map((action, index) => (
              <button
                key={index}
                onClick={() => handleSeek(index + 1)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  index < currentActionIndex 
                    ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
                    : index === currentActionIndex
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <span className="font-mono mr-2">{String(index + 1).padStart(3, '0')}</span>
                Action: {action.action?.type || 'Unknown'}
              </button>
            ))}
            {(!replay?.actions || replay.actions.length === 0) && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No actions recorded</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
