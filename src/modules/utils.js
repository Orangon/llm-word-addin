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
  return {
    text: text.slice(0, maxChars) + "\n\n[... testo troncato per limiti di contesto ...]",
    truncated: true,
  };
}

export function formatError(error) {
  if (error.type === "authentication") {
    return "API key non valida. Controlla le impostazioni.";
  }
  if (error.type === "rate_limit") {
    return "Limite di richieste raggiunto. Riprova tra qualche secondo.";
  }
  if (error.type === "overloaded") {
    return "Claude e' momentaneamente sovraccarico. Riprova tra poco.";
  }
  if (error.type === "network") {
    return "Errore di rete. Controlla la connessione internet.";
  }
  if (error.type === "context_too_large") {
    return "Il documento e' troppo lungo. Prova a selezionare solo una parte del testo.";
  }
  return error.message || "Errore sconosciuto. Riprova.";
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
