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
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
      role="log"
      aria-live="polite"
      aria-label="Voice conversation transcript"
    >
      <div className="mb-4 pb-3 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">Conversation</h2>
        <p className="text-sm text-slate-500 mt-0.5">Live transcript</p>
      </div>

      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <p className="text-base">No messages yet</p>
            <p className="text-sm mt-2">Start speaking to begin</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-3.5 rounded-lg border-l-4 ${
                message.type === 'user'
                  ? 'bg-blue-50 border-blue-400'
                  : message.type === 'system'
                  ? 'bg-emerald-50 border-emerald-400'
                  : 'bg-slate-50 border-slate-300 opacity-70'
              }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    message.type === 'user'
                      ? 'text-blue-600'
                      : message.type === 'system'
                      ? 'text-emerald-600'
                      : 'text-slate-500'
                  }`}
                >
                  {message.type === 'interim' ? 'Listening...' : message.type}
                </span>
                <span className="text-xs text-slate-400">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">{message.text}</p>
            </div>
          ))
        )}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
};

export default VoiceConsole;
