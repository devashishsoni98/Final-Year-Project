import { useEffect, useRef } from 'react';
import { useDialogue } from '../context/DialogueContext';

const VoiceConsole = () => {
  const { messages } = useDialogue();
  const consoleEndRef = useRef(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      className="w-full max-w-4xl bg-slate-800 rounded-lg shadow-2xl p-6 border-2 border-slate-700"
      role="log"
      aria-live="polite"
      aria-label="Voice conversation transcript"
    >
      <div className="mb-4 pb-3 border-b border-slate-600">
        <h2 className="text-2xl font-bold text-blue-400">Voice Console</h2>
        <p className="text-sm text-slate-400 mt-1">Real-time conversation transcript</p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <p className="text-lg">No messages yet</p>
            <p className="text-sm mt-2">Start speaking to see your conversation here</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg border-l-4 ${
                message.type === 'user'
                  ? 'bg-blue-900/30 border-blue-500'
                  : message.type === 'system'
                  ? 'bg-green-900/30 border-green-500'
                  : 'bg-slate-700/50 border-slate-500 opacity-70'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    message.type === 'user'
                      ? 'text-blue-400'
                      : message.type === 'system'
                      ? 'text-green-400'
                      : 'text-slate-400'
                  }`}
                >
                  {message.type === 'interim' ? 'Listening...' : message.type}
                </span>
                <span className="text-xs text-slate-400">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              <p className="text-slate-100 text-lg leading-relaxed">{message.text}</p>
            </div>
          ))
        )}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
};

export default VoiceConsole;
