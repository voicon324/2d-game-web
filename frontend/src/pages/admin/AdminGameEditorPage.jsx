import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';

// Monaco Editor wrapper component
const CodeEditor = ({ value, onChange, language = 'javascript' }) => {
  const handleEditorChange = (newValue) => {
    onChange(newValue || '');
  };

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={handleEditorChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: true },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        folding: true,
        bracketPairColorization: { enabled: true },
        suggest: {
          showKeywords: true,
          showSnippets: true
        }
      }}
    />
  );
};

const SAMPLE_GAME_CODE = `// Sample Game extending BaseGame
class Game extends BaseGame {
  load(config) {
    this.state = {
      board: Array(9).fill(null),
      currentPlayer: 'X'
    };
  }

  handleAction(action, playerId) {
    const { index } = action.data;
    if (this.state.board[index] !== null) return false;
    
    const player = this.getCurrentPlayer();
    if (player.id !== playerId) return false;
    
    this.state.board[index] = this.state.currentPlayer;
    this.state.currentPlayer = this.state.currentPlayer === 'X' ? 'O' : 'X';
    this.nextTurn();
    return true;
  }

  isWin() {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    for (const [a, b, c] of lines) {
      if (this.state.board[a] && 
          this.state.board[a] === this.state.board[b] && 
          this.state.board[a] === this.state.board[c]) {
        const winnerIndex = this.state.board[a] === 'X' ? 0 : 1;
        return {
          winner: this.players[winnerIndex]?.id,
          reason: \`Player \${this.state.board[a]} wins!\`
        };
      }
    }
    return null;
  }
}`;

export default function AdminGameEditorPage() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [code, setCode] = useState('');
  const [originalCode, setOriginalCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);

  const hasChanges = code !== originalCode;

  // Fetch game data
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    fetch(`/api/games/${id}/script`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch game');
        return res.json();
      })
      .then(data => {
        setGame(data);
        setCode(data.scriptCode || SAMPLE_GAME_CODE);
        setOriginalCode(data.scriptCode || SAMPLE_GAME_CODE);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleValidate = async () => {
    setValidating(true);
    setValidationResult(null);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/games/${id}/script/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ scriptCode: code })
      });
      
      const result = await res.json();
      setValidationResult(result);
    } catch (err) {
      setValidationResult({ valid: false, error: err.message });
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/games/${id}/script`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ scriptCode: code })
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      setOriginalCode(code);
      setValidationResult({ valid: true, message: 'Saved successfully!' });
    } catch (err) {
      setValidationResult({ valid: false, error: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">{error}</p>
        <Link to="/admin/games" className="text-pink-500 hover:underline mt-4 block">
          ← Back to Games
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin/games" 
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <span className="material-icons">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Edit: {game?.name}
            </h1>
            <p className="text-sm text-gray-500">Game Script Editor</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-sm text-amber-500 flex items-center gap-1">
              <span className="material-icons text-sm">warning</span>
              Unsaved changes
            </span>
          )}
          
          <button
            onClick={handleValidate}
            disabled={validating}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
          >
            <span className="material-icons text-sm">check_circle</span>
            {validating ? 'Validating...' : 'Validate'}
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 flex items-center gap-2"
          >
            <span className="material-icons text-sm">save</span>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Validation Result */}
      {validationResult && (
        <div className={`px-4 py-2 text-sm ${
          validationResult.valid 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        }`}>
          {validationResult.valid ? (
            <span className="flex items-center gap-2">
              <span className="material-icons text-sm">check</span>
              {validationResult.message || 'Script is valid!'}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="material-icons text-sm">error</span>
              {validationResult.error}
            </span>
          )}
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 flex min-h-0">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
            <span className="material-icons text-sm mr-2 align-middle">code</span>
            game-script.js
          </div>
          <div className="flex-1">
            <CodeEditor value={code} onChange={setCode} />
          </div>
        </div>

        {/* API Reference Sidebar */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              <span className="material-icons text-sm mr-2 align-middle">menu_book</span>
              BaseGame API
            </h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <code className="text-pink-500">load(config)</code>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Initialize game state. Called once when game starts.
                </p>
              </div>
              
              <div>
                <code className="text-pink-500">handleAction(action, playerId)</code>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Handle player input. Return true if valid.
                </p>
              </div>
              
              <div>
                <code className="text-pink-500">update(dt)</code>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Update state each tick (real-time games).
                </p>
              </div>
              
              <div>
                <code className="text-pink-500">isWin()</code>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Return {`{ winner, reason }`} or null.
                </p>
              </div>
              
              <div>
                <code className="text-pink-500">getState()</code>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Return state to send to clients.
                </p>
              </div>

              <hr className="border-gray-300 dark:border-gray-600" />

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Available Utilities</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li><code>utils.random(min, max)</code></li>
                  <li><code>utils.randomInt(min, max)</code></li>
                  <li><code>utils.clamp(val, min, max)</code></li>
                  <li><code>utils.distance(x1, y1, x2, y2)</code></li>
                  <li><code>utils.lerp(a, b, t)</code></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
