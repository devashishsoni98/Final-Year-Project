import {
  normalizeText,
  extractEmail,
  cleanName,
  cleanEmail,
} from "../utils/validators";

class CommandParser {
  constructor() {
    this.intents = {
      signup: [
        "sign up",
        "signup",
        "create account",
        "register",
        "new account",
      ],
      login: ["log in", "login", "sign in", "signin"],
      browse: ["browse", "show books", "list books", "see books", "view books"],
      search: ["search", "find", "look for", "search for"],
      category: ["show category", "filter by", "category"],
      details: ["details", "tell me about", "read details", "more info"],
      addToCart: ["add to cart", "buy this", "purchase", "add this"],
      checkout: [
        "checkout",
        "check out",
        "pay",
        "proceed to payment",
        "pay now",
      ],
      viewCart: [
        "view cart",
        "show cart",
        "cart",
        "my cart",
        "view card",
        "show card",
        "my card",
        "check cart",
        "check card",
        "shopping cart",
        "shopping card",
        "open cart",
        "open card",
        "see cart",
        "see card",
        "basket",
        "my basket",
        "shopping basket",
      ],
      viewOrders: [
        "view orders",
        "show orders",
        "my orders",
        "order history",
        "orders",
        "see orders",
        "check orders",
      ],
      help: ["help", "what can you do", "commands", "options"],
      cancel: ["cancel", "stop", "quit", "exit", "nevermind", "never mind"],
    };

    this.confirmations = {
      positive: [
        "yes",
        "correct",
        "right",
        "confirm",
        "ok",
        "okay",
        "yep",
        "yeah",
        "yup",
      ],
      negative: ["no", "wrong", "incorrect", "repeat", "again", "redo"],
    };
  }

  parseCommand(transcript) {
    const normalized = normalizeText(transcript);
    const intentResult = this.parseIntent(transcript);
    const entities = this.extractEntities(transcript, intentResult.intent);

    return {
      intent: intentResult.intent,
      entities,
      confidence: intentResult.confidence,
      originalText: transcript,
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
      intent: "unknown",
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

  extractEntities(text, intent) {
    const entities = {};
    const normalized = normalizeText(text);

    const emailPattern =
      /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})|([a-z0-9]+\s+at\s+[a-z0-9.]+\s+dot\s+[a-z]{2,})/i;
    const emailMatch = text.match(emailPattern);
    if (emailMatch) {
      entities.email = extractEmail(text);
    }

    const namePatterns = [
      /(?:my\s+name\s+is|call\s+me|i'?m|im)\s+(.+)/i,
      /(?:^|\s)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?:\s|$)/,
    ];

    for (const pattern of namePatterns) {
      const nameMatch = text.match(pattern);
      if (nameMatch && nameMatch[1]) {
        entities.fullname = cleanName(nameMatch[1].trim());
        break;
      }
    }

    return entities;
  }

  extractEntityValue(text, entityType) {
    const cleaned = text.trim();

    switch (entityType) {
      case "email":
        return cleanEmail(extractEmail(cleaned));
      case "fullname":
        return cleanName(cleaned);
      case "password":
        return cleaned;
      default:
        return cleaned;
    }
  }

  extractEmail(text) {
    return extractEmail(text);
  }

  extractName(text) {
    const namePatterns = [
      /(?:my\s+name\s+is|call\s+me|i'?m|im)\s+(.+)/i,
      /(?:^|\s)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?:\s|$)/,
    ];

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return cleanName(match[1].trim());
      }
    }

    return cleanName(text.trim());
  }

  calculateConfidence(text, pattern) {
    if (text === pattern) return 1.0;
    if (text.startsWith(pattern) || text.endsWith(pattern)) return 0.9;
    if (text.includes(pattern)) return 0.8;
    return 0.5;
  }

  isCancel(text) {
    const { intent } = this.parseIntent(text);
    return intent === "cancel";
  }

  isHelp(text) {
    const { intent } = this.parseIntent(text);
    return intent === "help";
  }

  mapSynonyms(text) {
    const synonymMap = {
      wanna: "want to",
      gonna: "going to",
      gimme: "give me",
      lemme: "let me",
      gotta: "got to",
      coulda: "could have",
      shoulda: "should have",
      woulda: "would have",
      kinda: "kind of",
      sorta: "sort of",
      dunno: "do not know",
      yeah: "yes",
      yep: "yes",
      nope: "no",
      nah: "no",
    };

    let normalized = text.toLowerCase();

    for (const [synonym, replacement] of Object.entries(synonymMap)) {
      const regex = new RegExp(`\\b${synonym}\\b`, "gi");
      normalized = normalized.replace(regex, replacement);
    }

    return normalized;
  }

  matchIntent(text) {
    const normalized = this.mapSynonyms(normalizeText(text));

    if (
      /(?:sign\s*up|signup|create\s+account|register|new\s+account)/i.test(
        normalized
      )
    ) {
      return "signup";
    }
    if (/(?:log\s*in|login|sign\s*in|signin)/i.test(normalized)) {
      return "login";
    }
    if (
      /(?:search|find|look\s+for|search\s+for)\s+(?:books?)?/i.test(normalized)
    ) {
      return "search";
    }
    if (/(?:show|list|display)\s+\w+\s+(?:books?|category)/i.test(normalized)) {
      return "category";
    }
    if (
      /(?:item|book|number)\s+\d+/i.test(normalized) ||
      /(?:details|tell me about|read)/i.test(normalized)
    ) {
      return "details";
    }
    if (/(?:add\s+to\s+cart|buy|purchase)/i.test(normalized)) {
      return "addToCart";
    }
    if (
      /(?:checkout|check\s*out|pay|proceed\s+to\s+payment)/i.test(normalized)
    ) {
      return "checkout";
    }
    if (
      /(?:view|show|check|see|open)\s+(?:cart|card|basket)|(?:my|shopping)\s+(?:cart|card|basket)|\b(?:cart|card|basket)\b/i.test(
        normalized
      )
    ) {
      return "viewCart";
    }
    if (
      /(?:view|show|check|see)\s+(?:my\s+)?orders?|(?:order\s+history)|\borders?\b/i.test(
        normalized
      )
    ) {
      return "viewOrders";
    }
    if (
      /(?:browse|show\s+books|list\s+books|see\s+books|view\s+books)/i.test(
        normalized
      )
    ) {
      return "browse";
    }
    if (/(?:next|more|continue|previous|back)/i.test(normalized)) {
      return "pagination";
    }
    if (/(?:help|what\s+can\s+you\s+do|commands|options)/i.test(normalized)) {
      return "help";
    }
    if (/(?:cancel|stop|quit|exit|nevermind|never\s+mind)/i.test(normalized)) {
      return "cancel";
    }

    return "unknown";
  }
}

const commandParserInstance = new CommandParser();
export default commandParserInstance;
export { CommandParser };
