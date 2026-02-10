import commandParser from "./CommandParser";

class DialogueManager {
  constructor() {
    this.currentFlow = null;
    this.flowState = {};
    this.flowHandlers = new Map();
    this.conversationHistory = [];
    this.confirmationPending = null;
    this.maxAttempts = 3;
    this.turnTimeout = 30000;
  }

  registerFlow(flowName, handler) {
    this.flowHandlers.set(flowName, handler);
  }

  startFlow(flowName, initialState = {}) {
    if (!this.flowHandlers.has(flowName)) {
      throw new Error(`Flow "${flowName}" not registered`);
    }

    this.currentFlow = flowName;
    this.flowState = { ...initialState, step: "init" };
    return this.currentFlow;
  }

  async processInput(userInput, context = {}) {
    this.addToHistory("user", userInput);

    if (commandParser.isCancel(userInput)) {
      const result = this.handleCancel();
      this.addToHistory("system", result.response);
      return result;
    }

    if (commandParser.isHelp(userInput)) {
      const result = this.handleHelp();
      this.addToHistory("system", result.response);
      return result;
    }

    if (!this.currentFlow) {
      const { intent } = commandParser.parseIntent(userInput);

      if (intent === "signup") {
        this.startFlow("auth-signup");
      } else if (intent === "login") {
        this.startFlow("auth-login");
      } else if (intent === "browse") {
        this.startFlow("browse-books");
      } else {
        const isLoggedIn = context?.user;

        const message = isLoggedIn
          ? "Say browse books, view cart, or view orders."
          : "Please say: sign up, log in, or browse books to continue.";

        const result = {
          response: message,
          nextStep: null,
          requiresInput: false,
        };

        this.addToHistory("system", result.response);
        return result;
      }
    }

    const handler = this.flowHandlers.get(this.currentFlow);
    if (!handler) {
      const result = this.handleUnknownFlow();
      this.addToHistory("system", result.response);
      return result;
    }

    try {
      const result = await handler(userInput, this.flowState, context);

      if (result.flowState) {
        this.flowState = result.flowState;
      }

      if (result.response) {
        this.addToHistory("system", result.response);
      }

      if (result.completed) {
        this.endFlow();
      }

      return result;
    } catch (error) {
      console.error("Flow processing error:", error);
      const result = {
        response: "Sorry, something went wrong. Please try again.",
        error: error.message,
        requiresInput: false,
      };
      this.addToHistory("system", result.response);
      return result;
    }
  }

  endFlow(success = false) {
    if (success) {
      this.conversationHistory.push({
        type: "flow_completion",
        flow: this.currentFlow,
        timestamp: new Date().toISOString(),
        success: true,
      });
    }

    this.currentFlow = null;
    this.flowState = {};
    this.confirmationPending = null;
  }

  handleCancel() {
    if (this.currentFlow) {
      const flow = this.currentFlow;
      this.endFlow();
      const isLoggedIn = context?.user;
      return {
        response: isLoggedIn
          ? `${flow} cancelled. Say browse books, view cart, or view orders.`
          : `${flow} cancelled. Say sign up, log in, or browse books.`,

        completed: true,
        requiresInput: false,
      };
    }
    return {
      response: "Nothing to cancel. Say sign up, log in, or browse books.",
      requiresInput: false,
    };
  }

  handleHelp() {
    if (this.currentFlow === "auth-signup") {
      return {
        response:
          "You are creating an account. I will ask for your full name, email, and password. Say cancel to stop.",
        requiresInput: false,
      };
    } else if (this.currentFlow === "auth-login") {
      return {
        response:
          "You are logging in. I will ask for your email and password. Say cancel to stop.",
        requiresInput: false,
      };
    } else if (this.currentFlow === "checkout") {
      return {
        response:
          "You are checking out. I will confirm your order, collect delivery address, and process payment. Say cancel to stop.",
        requiresInput: false,
      };
    } else if (this.currentFlow === "cart") {
      return {
        response:
          "You are managing your cart. Say view cart, checkout, continue shopping, or remove item. Say cancel to stop.",
        requiresInput: false,
      };
    } else {
      return {
        response:
          "You can say: sign up to create an account, log in to access your account, or browse books to see available books.",
        requiresInput: false,
      };
    }
  }

  handleUnknownFlow() {
    this.endFlow();
    return {
      response:
        "Something went wrong. Please say sign up, log in, or browse books.",
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

  handleConfirmation(userResponse) {
    const confirmation = commandParser.parseConfirmation(userResponse);

    if (confirmation.confirmed === true) {
      return { action: "proceed", confidence: confirmation.confidence };
    } else if (confirmation.confirmed === false) {
      return { action: "retry", confidence: confirmation.confidence };
    } else {
      return { action: "unclear", confidence: 0 };
    }
  }

  getNextPrompt() {
    const { step } = this.flowState;

    if (!step) {
      return "Say sign up to create an account, log in to access your account, or browse books to see available books.";
    }

    return null;
  }

  rollback() {
    if (this.flowState.previousStep) {
      this.flowState.step = this.flowState.previousStep;
      this.flowState.attempts = (this.flowState.attempts || 0) - 1;
      return true;
    }
    return false;
  }

  addToHistory(type, content) {
    this.conversationHistory.push({
      type,
      content,
      timestamp: new Date().toISOString(),
      flow: this.currentFlow,
      step: this.flowState.step,
    });

    if (this.conversationHistory.length > 100) {
      this.conversationHistory = this.conversationHistory.slice(-50);
    }
  }

  getHistory(limit = 10) {
    return this.conversationHistory.slice(-limit);
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  incrementAttempts() {
    this.flowState.attempts = (this.flowState.attempts || 0) + 1;
    return this.flowState.attempts;
  }

  hasExceededMaxAttempts() {
    return (this.flowState.attempts || 0) >= this.maxAttempts;
  }

  resetAttempts() {
    this.flowState.attempts = 0;
  }

  startCheckout(cartItems, total, userId) {
    console.debug("DialogueManager.startCheckout called with:", {
      cartItems,
      total,
      userId,
    });
    if (!cartItems || cartItems.length === 0) {
      return {
        success: false,
        error: "Cart is empty",
      };
    }

    if (!userId) {
      return {
        success: false,
        error: "User not logged in",
      };
    }

    this.startFlow("checkout", {
      cartItems,
      total,
      userId,
    });

    return {
      success: true,
      error: null,
    };
  }

  processCheckoutStep(userInput, context = {}) {
    if (this.currentFlow !== "checkout") {
      return {
        success: false,
        error: "Not in checkout flow",
      };
    }

    return this.processInput(userInput, context);
  }

  handlePaymentResponse(status, paymentData = {}) {
    if (this.currentFlow !== "checkout") {
      return {
        success: false,
        error: "Not in checkout flow",
      };
    }

    if (status === "success") {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
        paymentData;
      this.flowState = {
        ...this.flowState,
        step: "verify-payment",
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      };
    } else if (status === "cancelled") {
      this.flowState = {
        ...this.flowState,
        step: "error",
        error: "Payment cancelled by user",
      };
    }

    return {
      success: true,
      error: null,
    };
  }

  rollbackCheckout() {
    if (this.currentFlow !== "checkout") {
      return {
        success: false,
        error: "Not in checkout flow",
      };
    }

    const previousStep = this.flowState.step;

    if (previousStep === "verify-payment") {
      this.flowState.step = "await-payment";
    } else if (previousStep === "await-payment") {
      this.flowState.step = "confirm-total";
    } else if (previousStep === "confirm-total") {
      this.flowState.step = "review-order";
    } else {
      this.endFlow();
      return {
        success: false,
        error: "Cannot rollback further",
      };
    }

    return {
      success: true,
      rolledBackTo: this.flowState.step,
    };
  }
}

const dialogueManagerInstance = new DialogueManager();
export default dialogueManagerInstance;
export { DialogueManager };
