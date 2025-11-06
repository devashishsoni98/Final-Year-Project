import { useState, useEffect, useCallback, useRef } from 'react';

const useContinuousListening = (options = {}) => {
  const {
    onResult,
    onError,
    autoRestart = true,
    silenceTimeout = 3000,
    maxRestarts = 10,
    wakeWord = null,
  } = options;

  const [isActive, setIsActive] = useState(false);
  const [isAwaitingWakeWord, setIsAwaitingWakeWord] = useState(false);
  const restartCountRef = useRef(0);
  const silenceTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    lastActivityRef.current = Date.now();

    if (silenceTimeout && isActive) {
      silenceTimerRef.current = setTimeout(() => {
        if (Date.now() - lastActivityRef.current >= silenceTimeout) {
          if (onError) {
            onError('silence-timeout');
          }
        }
      }, silenceTimeout);
    }
  }, [silenceTimeout, isActive, onError]);

  const handleResult = useCallback((result) => {
    resetSilenceTimer();

    if (wakeWord && isAwaitingWakeWord) {
      const transcript = result.transcript.toLowerCase();
      if (transcript.includes(wakeWord.toLowerCase())) {
        setIsAwaitingWakeWord(false);
        if (onResult) {
          onResult({
            ...result,
            wakeWordDetected: true,
          });
        }
        return;
      }
    } else {
      if (onResult) {
        onResult(result);
      }
    }
  }, [wakeWord, isAwaitingWakeWord, resetSilenceTimer, onResult]);

  const handleError = useCallback((error) => {
    if (autoRestart && restartCountRef.current < maxRestarts) {
      restartCountRef.current += 1;
      setTimeout(() => {
        if (isActive) {
          resetSilenceTimer();
        }
      }, 1000);
    } else {
      setIsActive(false);
    }

    if (onError) {
      onError(error);
    }
  }, [autoRestart, maxRestarts, isActive, resetSilenceTimer, onError]);

  const start = useCallback(() => {
    setIsActive(true);
    restartCountRef.current = 0;
    if (wakeWord) {
      setIsAwaitingWakeWord(true);
    }
    resetSilenceTimer();
  }, [wakeWord, resetSilenceTimer]);

  const stop = useCallback(() => {
    setIsActive(false);
    setIsAwaitingWakeWord(false);
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    restartCountRef.current = 0;
    resetSilenceTimer();
  }, [resetSilenceTimer]);

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  return {
    isActive,
    isAwaitingWakeWord,
    start,
    stop,
    reset,
    handleResult,
    handleError,
  };
};

export default useContinuousListening;
