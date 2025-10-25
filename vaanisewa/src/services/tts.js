class TextToSpeechService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.currentUtterance = null;

    if (this.synth) {
      this.synth.addEventListener('voiceschanged', () => {
        this.voices = this.synth.getVoices();
      });
      this.voices = this.synth.getVoices();
    }
  }

  speak(text, options = {}) {
    if (!this.synth) {
      console.error('Speech synthesis not supported');
      return Promise.reject(new Error('Speech synthesis not supported'));
    }

    this.stop();

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;
      utterance.lang = options.lang || 'en-US';

      if (options.voiceIndex !== undefined && this.voices[options.voiceIndex]) {
        utterance.voice = this.voices[options.voiceIndex];
      } else {
        const defaultVoice = this.voices.find(voice => voice.lang === 'en-US' && voice.default);
        if (defaultVoice) utterance.voice = defaultVoice;
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        reject(event);
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  getVoices() {
    return this.voices;
  }

  isSpeaking() {
    return this.synth && this.synth.speaking;
  }
}

export default new TextToSpeechService();
