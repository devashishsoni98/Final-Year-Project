import { createContext, useState, useContext } from 'react';

const DialogueContext = createContext();

export const DialogueProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const addMessage = (message) => {
    setMessages((prev) => [
      ...prev,
      {
        ...message,
        timestamp: new Date().toISOString(),
        id: Date.now() + Math.random(),
      },
    ]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const addUserMessage = (text) => {
    addMessage({
      type: 'user',
      text,
    });
  };

  const addSystemMessage = (text) => {
    addMessage({
      type: 'system',
      text,
    });
  };

  const addInterimMessage = (text) => {
    setMessages((prev) => {
      const filtered = prev.filter((m) => m.type !== 'interim');
      return [
        ...filtered,
        {
          type: 'interim',
          text,
          timestamp: new Date().toISOString(),
          id: 'interim',
        },
      ];
    });
  };

  const removeInterimMessage = () => {
    setMessages((prev) => prev.filter((m) => m.type !== 'interim'));
  };

  return (
    <DialogueContext.Provider
      value={{
        messages,
        isListening,
        isSpeaking,
        setIsListening,
        setIsSpeaking,
        addUserMessage,
        addSystemMessage,
        addInterimMessage,
        removeInterimMessage,
        clearMessages,
      }}
    >
      {children}
    </DialogueContext.Provider>
  );
};

export const useDialogue = () => {
  const context = useContext(DialogueContext);
  if (!context) {
    throw new Error('useDialogue must be used within DialogueProvider');
  }
  return context;
};
