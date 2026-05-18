/**
 * Lightweight reactive store with pub/sub
 */

const STORAGE_PREFIX = "claude-word-";
const LEGACY_SESSION_STORAGE_PREFIX = "session-";
export const DEFAULT_BASE_URL = "https://api.anthropic.com/v1/messages";
const PERSISTED_KEYS = ["apiKey", "model", "systemPrompt", "baseUrl"];
const JSON_PERSISTED_KEYS = ["customModels"];

export class Store {
  constructor() {
    this._state = {
      apiKey: null,
      model: "claude-sonnet-4-6",
      systemPrompt: "",
      baseUrl: DEFAULT_BASE_URL,
      messages: [],
      isStreaming: false,
      currentView: "chat",
      trackChanges: false,
      contextMode: "full",
      customModels: [],
    };
    this._listeners = new Map();
    this._hydrate();
  }

  get(key) {
    return this._state[key];
  }

  set(key, value) {
    const old = this._state[key];
    if (old === value) return;
    this._state[key] = value;

    if (PERSISTED_KEYS.includes(key)) {
      this._persist(key, value);
    } else if (JSON_PERSISTED_KEYS.includes(key)) {
      this._persistJson(key, value);
    }

    const listeners = this._listeners.get(key);
    if (listeners) {
      listeners.forEach((fn) => fn(value, old));
    }
  }

  on(key, callback) {
    if (!this._listeners.has(key)) {
      this._listeners.set(key, new Set());
    }
    this._listeners.get(key).add(callback);
    return () => this._listeners.get(key).delete(callback);
  }

  addMessage(role, content) {
    const messages = [...this._state.messages, { id: Date.now(), role, content, timestamp: new Date() }];
    this.set("messages", messages);
    return messages[messages.length - 1];
  }

  updateLastMessage(content) {
    const messages = [...this._state.messages];
    if (messages.length > 0) {
      messages[messages.length - 1] = { ...messages[messages.length - 1], content };
      this._state.messages = messages;
      const listeners = this._listeners.get("messages");
      if (listeners) listeners.forEach((fn) => fn(messages));
    }
  }

  clearMessages() {
    this.set("messages", []);
  }

  _hydrate() {
    for (const key of PERSISTED_KEYS) {
      try {
        const val = localStorage.getItem(STORAGE_PREFIX + key);
        if (val !== null) {
          this._state[key] = val;
          continue;
        }

        if (key === "apiKey") {
          const legacyVal = sessionStorage.getItem(LEGACY_SESSION_STORAGE_PREFIX + key);
          if (legacyVal !== null) {
            this._state[key] = legacyVal;
            localStorage.setItem(STORAGE_PREFIX + key, legacyVal);
            sessionStorage.removeItem(LEGACY_SESSION_STORAGE_PREFIX + key);
          }
        }
      } catch (e) {
        // Storage may not be available
      }
    }

    // Hydrate JSON-persisted keys (e.g. customModels array)
    for (const key of JSON_PERSISTED_KEYS) {
      try {
        const raw = localStorage.getItem(STORAGE_PREFIX + key);
        if (raw !== null) {
          this._state[key] = JSON.parse(raw);
        }
      } catch (e) {
        // Storage may not be available or JSON is invalid
      }
    }
  }

  _persist(key, value) {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(STORAGE_PREFIX + key);
      } else {
        localStorage.setItem(STORAGE_PREFIX + key, value);
      }
    } catch (e) {
      // Storage may not be available
    }
  }

  _persistJson(key, value) {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(STORAGE_PREFIX + key);
      } else {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      }
    } catch (e) {
      // Storage may not be available
    }
  }
}

export const store = new Store();
