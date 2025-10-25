import { useDialogue } from '../context/DialogueContext';

const VoiceToggleButton = ({ onToggle }) => {
  const { isListening } = useDialogue();

  return (
    <button
      onClick={onToggle}
      aria-label={isListening ? 'Stop listening' : 'Start listening'}
      className={`relative w-24 h-24 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500 ${
        isListening
          ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/50'
          : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/50'
      }`}
    >
      <div className="flex items-center justify-center">
        {isListening ? (
          <div className="relative">
            <svg
              className="w-12 h-12 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></span>
          </div>
        ) : (
          <svg
            className="w-12 h-12 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </div>
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-medium whitespace-nowrap">
        {isListening ? 'Listening...' : 'Click to Start'}
      </div>
    </button>
  );
};

export default VoiceToggleButton;
