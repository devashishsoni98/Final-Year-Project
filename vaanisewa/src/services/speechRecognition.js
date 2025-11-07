class SpeechRecognitionService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      this.recognition = null;
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    this.isListening = false;
    this.shouldRestart = false;
    this.isPausedForTTS = false;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    if (!this.recognition) return;

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (this.onResultCallback) {
        this.onResultCallback({
          transcript: finalTranscript.trim() || interimTranscript.trim(),
          isFinal: finalTranscript.length > 0,
          interim: interimTranscript.trim(),
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);

      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        if (this.shouldRestart) {
          setTimeout(() => {
            if (this.shouldRestart) {
              this.recognition.start();
            }
          }, 1000);
        }
      }

      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;

      if (this.shouldRestart) {
        setTimeout(() => {
          if (this.shouldRestart) {
            try {
              this.recognition.start();
              this.isListening = true;
            } catch (error) {
              console.error('Failed to restart recognition:', error);
            }
          }
        }, 300);
      }

      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };

    this.recognition.onstart = () => {
      this.isListening = true;
    };
  }

  start(callbacks = {}) {
    if (!this.recognition) {
      return Promise.reject(new Error('Speech recognition not supported'));
    }

    this.onResultCallback = callbacks.onResult || null;
    this.onErrorCallback = callbacks.onError || null;
    this.onEndCallback = callbacks.onEnd || null;

    this.shouldRestart = true;

    try {
      this.recognition.start();
      return Promise.resolve();
    } catch (error) {
      if (error.message.includes('already started')) {
        return Promise.resolve();
      }
      return Promise.reject(error);
    }
  }

  stop() {
    if (!this.recognition) return;

    this.shouldRestart = false;

    if (this.isListening) {
      this.recognition.stop();
    }
  }

  isSupported() {
    return this.recognition !== null;
  }

  getIsListening() {
    return this.isListening;
  }

  pause() {
    if (!this.recognition || !this.isListening) return;

    this.isPausedForTTS = true;
    this.shouldRestart = false;

    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Failed to pause recognition:', error);
    }
  }

  resume() {
    if (!this.recognition || !this.isPausedForTTS) return;

    this.isPausedForTTS = false;
    this.shouldRestart = true;

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      if (!error.message.includes('already started')) {
        console.error('Failed to resume recognition:', error);
      }
    }
  }
}

export default new SpeechRecognitionService();
