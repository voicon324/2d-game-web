import { useState, useEffect, useRef } from 'react';

export default function ChatComponent({ isActive, messages = [], onSendMessage, user }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() && onSendMessage) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  if (!isActive) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-64 max-h-80 overflow-hidden">
      {/* Header - compact */}
      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-icons text-sm text-pink-500">chat</span>
          Chat
          {messages.length > 0 && (
            <span className="text-xs text-slate-400">({messages.length})</span>
          )}
        </h3>
      </div>
      
      {/* Messages area - scrollable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-slate-400 italic py-4">No messages yet</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.sender === user?.username ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-2 py-1.5 text-xs break-words ${
                msg.sender === user?.username 
                  ? 'bg-pink-500 text-white rounded-br-none' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5">{msg.sender}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area - compact */}
      <form onSubmit={handleSubmit} className="px-2 py-2 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="flex gap-1.5">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type..."
            maxLength={200}
            className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-pink-500 outline-none"
            data-testid="chat-input"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim()}
            className="px-2 py-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <span className="material-icons text-sm">send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
