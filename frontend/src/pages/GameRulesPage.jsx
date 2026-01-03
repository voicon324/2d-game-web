import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const GAME_INFO = {
  chess: {
    name: 'Grandmaster Chess',
    icon: 'shield',
    description: 'The classic game of strategy, tactics, and foresight.',
    players: '2 Players',
    duration: '10-60 Mins',
    complexity: 'High',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        icon: 'info',
        content: 'Chess is a two-player strategy board game played on a checkered board with 64 squares arranged in an 8×8 grid. Each player begins with 16 pieces: one king, one queen, two rooks, two knights, two bishops, and eight pawns. The objective is to checkmate the opponent\'s king.',
      },
      {
        id: 'setup',
        title: 'Game Setup',
        icon: 'grid_view',
        content: 'The board is placed so that a white square is in each player\'s near-right corner. Pieces are set up on the two ranks closest to each player. Pawns occupy the second rank. Rooks in corners, knights next to rooks, bishops next to knights, queen on her color, king on remaining square.',
        tip: 'Remember: "White on right" for the corner square, and "Queen on her color" for initial placement.',
      },
      {
        id: 'movement',
        title: 'Piece Movement',
        icon: 'open_with',
        pieces: [
          { symbol: '♔', name: 'King', desc: 'Moves one square in any direction. The most important piece.' },
          { symbol: '♕', name: 'Queen', desc: 'Moves any number of squares diagonally, horizontally, or vertically.' },
          { symbol: '♖', name: 'Rook', desc: 'Moves any number of squares horizontally or vertically.' },
          { symbol: '♗', name: 'Bishop', desc: 'Moves any number of squares diagonally.' },
          { symbol: '♘', name: 'Knight', desc: 'Moves in an "L" shape. The only piece that can jump over others.' },
          { symbol: '♙', name: 'Pawn', desc: 'Moves forward one square. Captures diagonally. First move can be two squares.' },
        ],
      },
      {
        id: 'special-moves',
        title: 'Special Moves',
        icon: 'stars',
        moves: [
          { name: 'Castling', desc: 'A defensive move where the King moves two squares towards a Rook, and the Rook hops over the King. Conditions apply.' },
          { name: 'En Passant', desc: 'A special pawn capture that occurs when a pawn moves two squares and passes an enemy pawn that could have captured it.' },
          { name: 'Promotion', desc: 'When a pawn reaches the eighth rank, it must be exchanged for a queen, rook, bishop, or knight.' },
        ],
      },
      {
        id: 'winning',
        title: 'Winning Conditions',
        icon: 'emoji_events',
        conditions: [
          { name: 'Checkmate', desc: 'The opponent\'s king is under threat and has no legal move to escape.', emoji: '🏆', color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
          { name: 'Draw / Stalemate', desc: 'The game ends in a tie if no legal moves and not in check, or by agreement, 3-fold repetition, or 50-move rule.', emoji: '🤝', color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' },
        ],
      },
    ],
  },
};

export default function GameRulesPage() {
  const { game = 'chess' } = useParams();
  const [activeSection, setActiveSection] = useState('overview');
  const gameData = GAME_INFO[game] || GAME_INFO.chess;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="material-icons text-pink-500 text-3xl mr-2">grid_on</span>
                <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">PixelHeart Games</span>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8 items-center">
                <Link to="/" className="border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200 px-1 pt-1 text-sm font-medium">Lobby</Link>
                <span className="border-b-2 border-pink-500 text-gray-900 dark:text-white px-1 pt-1 text-sm font-medium">Game Rules</span>
                <Link to="/leaderboard" className="border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200 px-1 pt-1 text-sm font-medium">Leaderboard</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link to="/game" className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors">
                <span className="material-icons text-sm mr-2">arrow_back</span>
                Back to Game
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Contents</h3>
              <nav className="space-y-1">
                {gameData.sections.map(section => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={() => setActiveSection(section.id)}
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'text-pink-500 bg-pink-500/10'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Still have questions?</p>
                <Link
                  to="/help"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-pink-500 bg-pink-500/10 hover:bg-pink-500/20 transition-colors"
                >
                  <span className="material-icons text-sm mr-2">forum</span>
                  Ask in Forum
                </Link>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="relative h-48 sm:h-64 bg-gray-800 flex items-center justify-center overflow-hidden">
                <span className="material-icons text-9xl text-white opacity-5 absolute -bottom-10 -right-10 transform -rotate-12">{gameData.icon}</span>
                <div className="relative z-10 text-center px-4">
                  <div className="mx-auto h-16 w-16 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4 shadow-lg">
                    <span className="material-icons text-3xl text-indigo-600 dark:text-indigo-300">{gameData.icon}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">{gameData.name}</h1>
                  <p className="text-lg text-gray-200 max-w-2xl mx-auto">{gameData.description}</p>
                </div>
              </div>
            </div>

            {/* Rules Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-10 space-y-12">
              {/* Game Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
                  <span className="material-icons text-gray-400 mb-2">people</span>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Players</div>
                  <div className="text-xs text-gray-500">{gameData.players}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
                  <span className="material-icons text-gray-400 mb-2">timer</span>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Duration</div>
                  <div className="text-xs text-gray-500">{gameData.duration}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
                  <span className="material-icons text-gray-400 mb-2">psychology</span>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Complexity</div>
                  <div className="text-xs text-gray-500">{gameData.complexity}</div>
                </div>
              </div>

              {/* Sections */}
              {gameData.sections.map((section, idx) => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  {idx > 0 && <hr className="border-gray-200 dark:border-gray-700 my-8" />}
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="material-icons text-pink-500 mr-2">{section.icon}</span>
                    {section.title}
                  </h2>

                  {section.content && (
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{section.content}</p>
                  )}

                  {section.tip && (
                    <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500 p-4 rounded-r-md">
                      <div className="flex">
                        <span className="material-icons text-indigo-500 mr-3">lightbulb</span>
                        <p className="text-sm text-indigo-700 dark:text-indigo-200">{section.tip}</p>
                      </div>
                    </div>
                  )}

                  {section.pieces && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {section.pieces.map(piece => (
                        <div key={piece.name} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all">
                          <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center shadow-sm text-2xl">
                            {piece.symbol}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">{piece.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{piece.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.moves && (
                    <div className="space-y-4 mt-6">
                      {section.moves.map(move => (
                        <div key={move.name} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-5 shadow-sm">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{move.name}</h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">{move.desc}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.conditions && (
                    <div className="flex flex-col md:flex-row gap-6 mt-6">
                      {section.conditions.map(cond => (
                        <div key={cond.name} className={`flex-1 ${cond.color} rounded-lg p-6 border`}>
                          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">{cond.name}</h3>
                          <p className="text-gray-700 dark:text-gray-300 mb-4">{cond.desc}</p>
                          <div className="text-4xl text-center">{cond.emoji}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
