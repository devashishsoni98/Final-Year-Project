import commandParser from './CommandParser';

class DialogueManager {
  constructor() {
    this.currentFlow = null;
    this.flowState = {};
    this.flowHandlers = new Map();
  }

  registerFlow(flowName, handler) {
    this.flowHandlers.set(flowName, handler);
  }

  startFlow(flowName, initialState = {}) {
    if (!this.flowHandlers.has(flowName)) {
      throw new Error(`Flow "${flowName}" not registered`);
    }

    this.currentFlow = flowName;
    this.flowState = { ...initialState, step: 'init' };
    return this.currentFlow;
  }

  async processInput(userInput, context = {}) {
    if (commandParser.isCancel(userInput)) {
      return this.handleCancel();
    }

    if (commandParser.isHelp(userInput)) {
      return this.handleHelp();
    }

    if (!this.currentFlow) {
      const { intent } = commandParser.parseIntent(userInput);

      if (intent === 'signup') {
        this.startFlow('auth-signup');
      } else if (intent === 'login') {
        this.startFlow('auth-login');
      } else if (intent === 'browse') {
        this.startFlow('browse-books');
      } else {
        return {
          response: 'Please say: sign up, log in, or browse books to continue.',
          nextStep: null,
          requiresInput: false,
        };
      }
    }

    const handler = this.flowHandlers.get(this.currentFlow);
    if (!handler) {
      return this.handleUnknownFlow();
    }

    try {
      const result = await handler(userInput, this.flowState, context);

      if (result.flowState) {
        this.flowState = result.flowState;
      }

      if (result.completed) {
        this.endFlow();
      }

      return result;
    } catch (error) {
      console.error('Flow processing error:', error);
      return {
        response: 'Sorry, something went wrong. Please try again.',
        error: error.message,
        requiresInput: false,
      };
    }
  }

  endFlow() {
    this.currentFlow = null;
    this.flowState = {};
  }

  handleCancel() {
    if (this.currentFlow) {
      const flow = this.currentFlow;
      this.endFlow();
      return {
        response: `${flow} cancelled. Say sign up, log in, or browse books.`,
        completed: true,
        requiresInput: false,
      };
    }
    return {
      response: 'Nothing to cancel. Say sign up, log in, or browse books.',
      requiresInput: false,
    };
  }

  handleHelp() {
    if (this.currentFlow === 'auth-signup') {
      return {
        response: 'You are creating an account. I will ask for your full name, email, and password. Say cancel to stop.',
        requiresInput: false,
      };
    } else if (this.currentFlow === 'auth-login') {
      return {
        response: 'You are logging in. I will ask for your email and password. Say cancel to stop.',
        requiresInput: false,
      };
    } else {
      return {
        response: 'You can say: sign up to create an account, log in to access your account, or browse books to see available books.',
        requiresInput: false,
      };
    }
  }

  handleUnknownFlow() {
    this.endFlow();
    return {
      response: 'Something went wrong. Please say sign up, log in, or browse books.',
      requiresInput: false,
    };
  }

  getCurrentFlow() {
    return this.currentFlow;
  }

  getFlowState() {
    return this.flowState;
  }

  isInFlow() {
    return this.currentFlow !== null;
  }
}

export default new DialogueManager();
