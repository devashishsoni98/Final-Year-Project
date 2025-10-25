import { useEffect, useState } from 'react';
import { useDialogue } from '../context/DialogueContext';
import VoiceToggleButton from '../components/VoiceToggleButton';
import VoiceConsole from '../components/VoiceConsole';
import tts from '../services/tts';
import speechRecognition from '../services/speechRecognition';

const VoiceDashboard = () => {
  const {
    isListening,
    setIsListening,
    setIsSpeaking,
    addUserMessage,
    addSystemMessage,
    addInterimMessage,
    removeInterimMessage,
  } = useDialogue();

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      const welcomeMessage = 'Welcome to Vaani Sewa. Say start to begin listening';
      addSystemMessage(welcomeMessage);

      tts.speak(welcomeMessage).catch((error) => {
        console.error('TTS error:', error);
      });

      setIsInitialized(true);
    }
  }, [isInitialized, addSystemMessage]);

  const handleCommand = async (command) => {
    const lowerCommand = command.toLowerCase().trim();

    let response = '';

    if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
      response = 'Hello! How can I assist you today?';
    } else if (lowerCommand.includes('start')) {
      response = 'Voice recognition is now active. I am listening to your commands.';
    } else if (lowerCommand.includes('help')) {
      response = 'You can say hello, start, or help. More commands will be added soon.';
    } else if (lowerCommand.includes('stop') || lowerCommand.includes('quit')) {
      response = 'Stopping voice recognition. Goodbye!';
      stopListening();
    } else if (command.length > 0) {
      response = 'I heard you say: ' + command;
    }

    if (response) {
      addSystemMessage(response);
      setIsSpeaking(true);
      try {
        await tts.speak(response);
      } catch (error) {
        console.error('TTS error:', error);
      } finally {
        setIsSpeaking(false);
      }
    }
  };

  const startListening = () => {
    if (!speechRecognition.isSupported()) {
      const errorMsg = 'Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.';
      addSystemMessage(errorMsg);
      tts.speak(errorMsg);
      return;
    }

    speechRecognition.start({
      onResult: (result) => {
        if (result.isFinal) {
          removeInterimMessage();
          if (result.transcript) {
            addUserMessage(result.transcript);
            handleCommand(result.transcript);
          }
        } else if (result.interim) {
          addInterimMessage(result.interim);
        }
      },
      onError: (error) => {
        console.error('Speech recognition error:', error);
        if (error === 'not-allowed' || error === 'service-not-allowed') {
          const errorMsg = 'Microphone access denied. Please allow microphone access in your browser settings.';
          addSystemMessage(errorMsg);
          tts.speak(errorMsg);
          setIsListening(false);
        }
      },
      onEnd: () => {
        if (!speechRecognition.getIsListening()) {
          setIsListening(false);
        }
      },
    });

    setIsListening(true);
  };

  const stopListening = () => {
    speechRecognition.stop();
    removeInterimMessage();
    setIsListening(false);
  };

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-blue-400 mb-3">
          {import.meta.env.VITE_APP_NAME}
        </h1>
        <p className="text-xl text-slate-300">Voice-Enabled Book Service Interface</p>
        <p className="text-sm text-slate-400 mt-2">
          Powered by Web Speech API
        </p>
      </header>

      <main className="flex flex-col items-center gap-12 w-full">
        <div className="flex flex-col items-center gap-4">
          <VoiceToggleButton onToggle={handleToggle} />
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div
              className={`w-3 h-3 rounded-full ${
                isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-600'
              }`}
              aria-hidden="true"
            ></div>
            <span>
              {isListening ? 'Voice recognition active' : 'Voice recognition inactive'}
            </span>
          </div>
        </div>

        <VoiceConsole />

        <div className="bg-slate-800 rounded-lg p-6 max-w-2xl border border-slate-700">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">Available Commands</h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>"Hello"</strong> - Greet the system</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>"Start"</strong> - Confirm voice recognition is active</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>"Help"</strong> - Get information about available commands</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>"Stop"</strong> - End voice recognition session</span>
            </li>
          </ul>
        </div>
      </main>

      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>Press the microphone button to start or stop voice recognition</p>
        <p className="mt-1">Ensure your browser has microphone permissions enabled</p>
      </footer>
    </div>
  );
};

export default VoiceDashboard;
