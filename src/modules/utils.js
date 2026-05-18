/**
 * Shared utility functions
 */

export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function sanitizeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function truncateText(text, maxChars = 100000) {
  if (text.length <= maxChars) return { text, truncated: false };
  const lang = localStorage.getItem("claude-word-lang") || "en";
  const truncationNotice = lang === "it"
    ? "[... testo troncato per limiti di contesto ...]"
    : "[... text truncated due to context limits ...]";
  return {
    text: text.slice(0, maxChars) + `\n\n${truncationNotice}`,
    truncated: true,
  };
}

export function formatError(error) {
  const lang = localStorage.getItem("claude-word-lang") || "en";
  const labels = {
    it: {
      invalidApiKey: "API key non valida. Controlla le impostazioni.",
      rateLimit: "Limite di richieste raggiunto. Riprova tra qualche secondo.",
      overloaded: "Claude e' momentaneamente sovraccarico. Riprova tra poco.",
      network: "Errore di rete. Controlla la connessione internet.",
      contextTooLarge: "Il documento e' troppo lungo. Prova a selezionare solo una parte del testo.",
      unknown: "Errore sconosciuto. Riprova.",
    },
    en: {
      invalidApiKey: "Invalid API key. Check your settings.",
      rateLimit: "Rate limit reached. Please try again in a few seconds.",
      overloaded: "Claude is temporarily overloaded. Please try again shortly.",
      network: "Network error. Check your internet connection.",
      contextTooLarge: "The document is too long. Try selecting only part of the text.",
      unknown: "Unknown error. Please try again.",
    },
  };
  const i18n = labels[lang] || labels.en;

  if (error.type === "authentication") {
    return i18n.invalidApiKey;
  }
  if (error.type === "rate_limit") {
    return i18n.rateLimit;
  }
  if (error.type === "overloaded") {
    return i18n.overloaded;
  }
  if (error.type === "network") {
    return i18n.network;
  }
  if (error.type === "context_too_large") {
    return i18n.contextTooLarge;
  }
  return error.message || i18n.unknown;
}

export function countWords(text) {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

export function getModelDisplayName(modelId, customModels = []) {
  const names = {
    "claude-sonnet-4-6": "Sonnet 4.6",
    "claude-opus-4-6": "Opus 4.6",
    "claude-haiku-4-5-20251001": "Haiku 4.5",
  };
  if (names[modelId]) return names[modelId];

  // Check custom models
  const custom = customModels.find((m) => m.id === modelId);
  if (custom) return custom.name;

  return modelId;
}
