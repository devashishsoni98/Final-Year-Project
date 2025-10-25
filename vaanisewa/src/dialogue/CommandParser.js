import { normalizeText, extractEmail } from '../utils/validators';

class CommandParser {
  constructor() {
    this.intents = {
      signup: ['sign up', 'signup', 'create account', 'register', 'new account'],
      login: ['log in', 'login', 'sign in', 'signin'],
      browse: ['browse', 'show books', 'list books', 'see books', 'view books'],
      help: ['help', 'what can you do', 'commands', 'options'],
      cancel: ['cancel', 'stop', 'quit', 'exit', 'nevermind', 'never mind'],
    };

    this.confirmations = {
      positive: ['yes', 'correct', 'right', 'confirm', 'ok', 'okay', 'yep', 'yeah', 'yup'],
      negative: ['no', 'wrong', 'incorrect', 'repeat', 'again', 'redo'],
    };
  }

  parseIntent(text) {
    const normalized = normalizeText(text);

    for (const [intent, patterns] of Object.entries(this.intents)) {
      for (const pattern of patterns) {
        if (normalized.includes(pattern)) {
          return {
            intent,
            confidence: this.calculateConfidence(normalized, pattern),
            originalText: text,
          };
        }
      }
    }

    return {
      intent: 'unknown',
      confidence: 0,
      originalText: text,
    };
  }

  parseConfirmation(text) {
    const normalized = normalizeText(text);

    for (const confirm of this.confirmations.positive) {
      if (normalized === confirm || normalized.includes(confirm)) {
        return { confirmed: true, confidence: 0.9 };
      }
    }

    for (const deny of this.confirmations.negative) {
      if (normalized === deny || normalized.includes(deny)) {
        return { confirmed: false, confidence: 0.9 };
      }
    }

    return { confirmed: null, confidence: 0 };
  }

  extractEntityValue(text, entityType) {
    const cleaned = text.trim();

    switch (entityType) {
      case 'email':
        return extractEmail(cleaned);
      case 'fullname':
        return cleaned;
      case 'password':
        return cleaned;
      default:
        return cleaned;
    }
  }

  calculateConfidence(text, pattern) {
    if (text === pattern) return 1.0;
    if (text.startsWith(pattern) || text.endsWith(pattern)) return 0.9;
    if (text.includes(pattern)) return 0.8;
    return 0.5;
  }

  isCancel(text) {
    const { intent } = this.parseIntent(text);
    return intent === 'cancel';
  }

  isHelp(text) {
    const { intent } = this.parseIntent(text);
    return intent === 'help';
  }
}

export default new CommandParser();
