/**
 * Claude for Word - Document-First Mode
 * Claude writes directly into the Word document
 */

/* global Office */

import { store } from "../modules/state.js";
import { AnthropicClient, ApiError } from "../modules/api-client.js";
import { wordBridge } from "../modules/word-bridge.js";
import { ChatUI } from "../modules/chat.js";
import { Settings } from "../modules/settings.js";
import { legalTools } from "../modules/legal.js";
import { RAW_OUTPUT_SYSTEM, executeDocumentAction } from "../modules/document-logic.js";
import { stripMarkdown } from "../modules/markdown.js";
import { truncateText, formatError } from "../modules/utils.js";
import { setLanguage, getLanguage, t } from "../modules/i18n.js";
import "../taskpane/taskpane.css";

let chatUI;
let settings;
let isProcessing = false;

// Logic moved to document-logic.js

// Quick action definitions
const QUICK_ACTIONS = {
  rewrite: {
    prompt: t("quickRewritePrompt"),
    label: t("quickLabelRewriting"),
    mode: "replace",
  },
  summarize: {
    prompt: t("quickSummarizePrompt"),
    label: t("quickLabelSummary"),
    mode: "after",
  },
  translate: {
    prompt: t("quickTranslatePrompt"),
    label: t("quickLabelTranslationEn"),
    mode: "replace",
  },
  formal: {
    prompt: t("quickFormalPrompt"),
    label: t("quickLabelFormalTone"),
    mode: "replace",
  },
  contract: {
    prompt: legalTools.getUserPrefix("contract-review"),
    label: t("quickLabelContractReview"),
    mode: "after",
    systemPrompt: legalTools.getSystemPrompt("contract-review"),
  },
  normative: {
    prompt: legalTools.getUserPrefix("normative"),
    label: t("quickLabelLegalReferences"),
    mode: "after",
    systemPrompt: legalTools.getSystemPrompt("normative"),
  },
};

// ============ Initialization ============

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    initializeApp();
  }
});

function initializeApp() {
  // Chat UI for fallback "chat only" mode
  chatUI = new ChatUI(
    document.getElementById("chat-messages"),
    document.getElementById("empty-state")
  );
  settings = new Settings();
  chatUI.setActionHandler(handleMessageAction);

  // Load saved language (default: English)
  const savedLang = localStorage.getItem("claude-word-lang") || "en";
  setLanguage(savedLang);
  updateLanguageUI();

  setupEventListeners();
  syncUiFromStore();
  updateSendButton();
  store.on("apiKey", updateSendButton);
  store.on("isStreaming", updateSendButton);
}

// ============ i18n ============

function updateLanguageUI() {
  const lang = getLanguage();

  // Update lang toggle label
  const langLabel = document.querySelector(".lang-label");
  if (langLabel) langLabel.textContent = lang.toUpperCase();

  // Update all data-i18n elements
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });

  // Update placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.placeholder = t(key);
  });

  // Update title attributes
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    el.title = t(key);
  });

  // Update select options
  const actionMode = document.getElementById("action-mode");
  if (actionMode) {
    actionMode.options[0].textContent = t("replaceSelection");
    actionMode.options[1].textContent = t("insertAfter");
    actionMode.options[2].textContent = t("insertEnd");
    actionMode.options[3].textContent = t("chatOnly");
  }
}

function toggleLanguage() {
  const newLang = getLanguage() === "it" ? "en" : "it";
  setLanguage(newLang);
  localStorage.setItem("claude-word-lang", newLang);
  updateLanguageUI();
}

// ============ Chat History Panel ============

function toggleHistoryPanel() {
  const panel = document.getElementById("history-panel");
  const btn = document.getElementById("history-toggle-btn");
  const isVisible = panel.style.display !== "none";

  if (isVisible) {
    panel.style.display = "none";
    if (btn) btn.classList.remove("active");
  } else {
    renderHistoryList();
    panel.style.display = "";
    if (btn) btn.classList.add("active");
  }
}

/**
 * Safely render persisted messages into the history panel.
 * Sanitises all text via escapeHtml to prevent XSS.
 */
function renderHistoryList() {
  const container = document.getElementById("history-list");
  const messages = store.get("messages");

  if (!messages || messages.length === 0) {
    container.innerHTML = `<div class="history-empty">No messages yet</div>`;
    return;
  }

  const html = messages
    .slice()                       // shallow copy so we don't mutate store
    .reverse()                     // newest first
    .map((m) => {
      const roleClass = m.role === "user" ? "history-item__role--user" : "history-item__role--assistant";
      const roleLabel = m.role === "user" ? "You" : "Claude";
      const timeStr = m.timestamp ? formatTimestamp(m.timestamp) : "";
      const text = escapeHtml(m.content || "");

      return `
        <div class="history-item">
          <div class="history-item__header">
            <span class="history-item__role ${roleClass}">${roleLabel}</span>
            ${timeStr ? `<span class="history-item__time">${timeStr}</span>` : ""}
          </div>
          <div class="history-item__text">${text}</div>
        </div>`;
    })
    .join("");

  container.innerHTML = html;
}

/**
 * Format a timestamp (Date or ISO string) into a short readable string.
 */
function formatTimestamp(ts) {
  try {
    const d = ts instanceof Date ? ts : new Date(ts);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " +
           d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/**
 * Escape special Markdown characters in plain text so that
 * the exported Markdown stays readable and safe.
 */
function escapeForMarkdown(text) {
  // Escape characters that Markdown treats as formatting
  return (text || "")
    .replace(/\\/g, "\\\\")
    .replace(/\*/g, "\\*")
    .replace(/_/g, "\\_")
    .replace(/`/g, "\\`")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Escape plain text for TXT export (minimal – just angle brackets).
 */
function escapeForTxt(text) {
  return (text || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Serialise messages to Markdown format.
 * Each message becomes a section with a role header and timestamp.
 */
function serialiseToMarkdown(messages) {
  const lines = ["# Claude for Word — Chat History", ""];
  messages.forEach((m) => {
    const role = m.role === "user" ? "You" : "Claude";
    const ts = m.timestamp ? formatTimestamp(m.timestamp) : "";
    const header = `## ${role}${ts ? " · " + ts : ""}`;
    lines.push(header, "");
    // Split content into paragraphs so it reads naturally
    const escaped = escapeForMarkdown(m.content || "");
    lines.push(escaped, "");
  });
  return lines.join("\n");
}

/**
 * Serialise messages to plain-text format.
 * Simple role-prefixed lines, easy to read in any editor.
 */
function serialiseToTxt(messages) {
  const lines = ["Claude for Word - Chat History", "=".repeat(34), ""];
  messages.forEach((m) => {
    const role = m.role === "user" ? "You" : "Claude";
    const ts = m.timestamp ? formatTimestamp(m.timestamp) : "";
    lines.push(`[${role}]${ts ? " " + ts : ""}`);
    lines.push(escapeForTxt(m.content || ""));
    lines.push("");
  });
  return lines.join("\n");
}

/**
 * Serialise messages to pretty-printed JSON (array).
 * Suitable for programmatic backup / re-import.
 */
function serialiseToJson(messages) {
  const exportData = {
    exportedAt: new Date().toISOString(),
    source: "Claude for Word",
    messageCount: messages.length,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content || "",
      timestamp: m.timestamp || null,
    })),
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * Trigger a client-side file download using a Blob + temporary anchor.
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  // Clean up after a short delay to allow the download to start
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 150);
}

/**
 * Export the persisted chat history in the user-chosen format.
 * Reads store.get('messages'), serialises, and triggers a download.
 */
function exportHistory() {
  const messages = store.get("messages");

  if (!messages || messages.length === 0) {
    showStatus("info", "No messages to export");
    return;
  }

  const formatSelect = document.getElementById("export-format");
  const format = formatSelect ? formatSelect.value : "markdown";

  let content, extension, mimeType;
  switch (format) {
    case "json":
      content = serialiseToJson(messages);
      extension = "json";
      mimeType = "application/json";
      break;
    case "txt":
      content = serialiseToTxt(messages);
      extension = "txt";
      mimeType = "text/plain";
      break;
    case "markdown":
    default:
      content = serialiseToMarkdown(messages);
      extension = "md";
      mimeType = "text/markdown";
      break;
  }

  // Timestamp for filename: YYYY-MM-DD_HHmmss
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const ts =
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  const filename = `chat-history_${ts}.${extension}`;
  downloadFile(content, filename, mimeType);

  showStatus("success", `Exported ${messages.length} messages`);
}

function syncUiFromStore() {
  const contextMode = store.get("contextMode");
  const selectedRadio = document.querySelector(`input[name="context-mode"][value="${contextMode}"]`);
  if (selectedRadio) {
    selectedRadio.checked = true;
  }
}

// ============ Event Listeners ============

function setupEventListeners() {
  // Delegated click handler
  document.getElementById("app").addEventListener("click", (e) => {
    const action = e.target.closest("[data-action]")?.dataset?.action;
    if (!action) return;

    switch (action) {
      case "show-settings":
        showView("settings");
        break;
      case "show-chat":
        showView("chat");
        break;
      case "show-readability":
        runReadabilityAnalysis();
        break;
      case "save-settings":
        settings.save();
        break;
      case "test-connection":
        settings.testConnection();
        break;
      case "toggle-key-visibility":
        settings.toggleKeyVisibility();
        break;
      case "toggle-language":
        toggleLanguage();
        break;
      case "change-model":
        showView("settings");
        setTimeout(() => {
          const modelSelect = document.getElementById("model-select");
          if (modelSelect) modelSelect.focus();
        }, 50);
        break;
      case "toggle-history":
        toggleHistoryPanel();
        break;
      case "export-history":
        exportHistory();
        break;
      case "send-message":
        handleSend();
        break;
    }
  });

  // Quick action chips
  document.querySelectorAll("[data-quick]").forEach((chip) => {
    chip.addEventListener("click", () => {
      if (isProcessing) return;
      const action = QUICK_ACTIONS[chip.dataset.quick];
      if (action) executeDocumentActionInUI(action.prompt, action.mode || "replace", action.systemPrompt || null);
    });
  });

  // Chat input - Enter to send
  const chatInput = document.getElementById("chat-input");
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Auto-grow textarea
  chatInput.addEventListener("input", () => {
    chatInput.style.height = "auto";
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
  });

  // Context mode
  document.querySelectorAll('input[name="context-mode"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      store.set("contextMode", e.target.value);
    });
  });

  // Track changes
  document.getElementById("track-changes-toggle").addEventListener("change", (e) => {
    store.set("trackChanges", e.target.checked);
  });
}

// ============ View Management ============

function showView(viewName) {
  const views = { chat: "chat-view", settings: "settings-view", readability: "readability-view" };
  const inputArea = document.getElementById("input-area");

  Object.entries(views).forEach(([name, id]) => {
    const el = document.getElementById(id);
    if (el) el.style.display = name === viewName ? "" : "none";
  });

  inputArea.style.display = viewName === "chat" ? "" : "none";
  store.set("currentView", viewName);
}

// ============ Readability Analysis ============

async function runReadabilityAnalysis() {
  let text = "";
  try {
    const contextMode = store.get("contextMode");
    if (contextMode === "full") {
      text = await wordBridge.getFullDocumentText();
    } else {
      text = await wordBridge.getSelectedText();
    }
  } catch (e) {
    // continue
  }

  const container = document.getElementById("readability-content");

  if (!text || !text.trim()) {
    container.innerHTML = `<div class="readability-empty">${t("noTextSelected")}</div>`;
    showView("readability");
    return;
  }

  const analysis = analyzeText(text);
  if (!analysis) {
    container.innerHTML = `<div class="readability-empty">${t("noTextSelected")}</div>`;
    showView("readability");
    return;
  }

  container.innerHTML = renderReadabilityReport(analysis);
  showView("readability");
}

function renderReadabilityReport(a) {
  const readingTimeStr = a.readingTimeMin > 0
    ? `${a.readingTimeMin} ${t("minutes")} ${a.readingTimeSec} ${t("seconds")}`
    : `${a.readingTimeSec} ${t("seconds")}`;

  // Score colors
  const gulpColor = getScoreColor(a.gulpease.score);
  const fleschColor = getScoreColor(a.fleschKincaid.score);

  // Sentence length chart (max 40 bars)
  const maxSentLen = Math.max(...a.sentenceLens, 1);
  const displayLens = a.sentenceLens.length > 40
    ? a.sentenceLens.slice(0, 40)
    : a.sentenceLens;
  const barsHtml = displayLens
    .map((len) => {
      const pct = Math.round((len / maxSentLen) * 100);
      const barColor = len <= 15 ? "#2E7D32" : len <= 25 ? "#E6A817" : "#C62828";
      return `<div class="sentence-bar" style="height:${Math.max(4, pct)}%;background:${barColor}" title="${len} ${t("words")}"></div>`;
    })
    .join("");

  // Comprehensibility comments
  const commentsHtml = a.comments
    .map((c) => {
      const icon = c.type === "good" ? "&#10003;" : c.type === "ok" ? "&#9679;" : "&#9888;";
      return `
        <div class="comment-item">
          <span class="comment-icon comment-icon--${c.type}">${icon}</span>
          <span>${c.text}</span>
        </div>`;
    })
    .join("");

  return `
    <!-- Metrics Grid -->
    <div class="readability-section">
      <div class="readability-section__title">${t("textMetrics")}</div>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-card__value">${a.wordCount.toLocaleString()}</div>
          <div class="metric-card__label">${t("words")}</div>
        </div>
        <div class="metric-card">
          <div class="metric-card__value">${a.sentenceCount.toLocaleString()}</div>
          <div class="metric-card__label">${t("sentences")}</div>
        </div>
        <div class="metric-card">
          <div class="metric-card__value">${a.paragraphCount.toLocaleString()}</div>
          <div class="metric-card__label">${t("paragraphs")}</div>
        </div>
        <div class="metric-card">
          <div class="metric-card__value">${a.charCount.toLocaleString()}</div>
          <div class="metric-card__label">${t("characters")}</div>
        </div>
        <div class="metric-card">
          <div class="metric-card__value">${a.avgSentenceLen}</div>
          <div class="metric-card__label">${t("avgSentenceLen")}</div>
        </div>
        <div class="metric-card">
          <div class="metric-card__value">${a.avgWordLen}</div>
          <div class="metric-card__label">${t("avgWordLen")}</div>
        </div>
      </div>
    </div>

    <!-- Reading Time -->
    <div class="reading-time">
      <span class="reading-time__icon">&#128337;</span>
      <span class="reading-time__text">${t("readingTime")}: ${readingTimeStr}</span>
    </div>

    <!-- Gulpease Index (Italian) -->
    <div class="readability-section">
      <div class="readability-section__title">${t("readabilityIndex")}</div>
      <div class="score-card">
        <div class="score-card__header">
          <span class="score-card__name">${t("gulpease")}</span>
          <span class="score-card__value" style="color:${gulpColor}">${a.gulpease.score}</span>
        </div>
        <div class="score-bar">
          <div class="score-bar__fill" style="width:${getBarWidth(a.gulpease.score)}%;background:${gulpColor}"></div>
        </div>
        <div class="score-card__verdict">${a.gulpease.level}</div>
        <div class="score-card__desc">${t("gulpeaseDesc")}</div>
      </div>

      <!-- Flesch-Kincaid Index (English) -->
      <div class="score-card">
        <div class="score-card__header">
          <span class="score-card__name">${t("fleschKincaid")}</span>
          <span class="score-card__value" style="color:${fleschColor}">${a.fleschKincaid.score}</span>
        </div>
        <div class="score-bar">
          <div class="score-bar__fill" style="width:${getBarWidth(a.fleschKincaid.score)}%;background:${fleschColor}"></div>
        </div>
        <div class="score-card__verdict">${a.fleschKincaid.level}</div>
        <div class="score-card__desc">${t("fleschKincaidDesc")}</div>
      </div>
    </div>

    <!-- Sentence Length Distribution -->
    <div class="readability-section">
      <div class="readability-section__title">${t("chartSentenceLen")}</div>
      <div class="score-card">
        <div class="sentence-bars">${barsHtml}</div>
        <div class="sentence-chart__legend">
          <span>1</span>
          <span>${displayLens.length} ${t("sentences").toLowerCase()}</span>
        </div>
      </div>
    </div>

    <!-- Comprehensibility -->
    <div class="readability-section">
      <div class="readability-section__title">${t("comprehensibility")}</div>
      <div class="score-card">
        ${commentsHtml}
      </div>
    </div>
  `;
}

// ============ Main Send Handler ============

async function handleSend() {
  const input = document.getElementById("chat-input");
  const userText = input.value.trim();
  if (!userText || isProcessing) return;

  const apiKey = store.get("apiKey");
  if (!apiKey) {
    showStatus("error", t("configureApiKey"));
    showView("settings");
    return;
  }

  input.value = "";
  input.style.height = "auto";

  const actionMode = document.getElementById("action-mode").value;

  if (actionMode === "chat") {
    // Fallback: chat mode (shows in sidebar)
    await sendChatMessage(userText);
  } else {
    // Document mode: write directly into Word, always use RAW system prompt
    await executeDocumentActionInUI(userText, actionMode, RAW_OUTPUT_SYSTEM);
  }
}

// ============ Document-First Actions ============

async function executeDocumentActionInUI(userPrompt, insertMode, systemPrompt = null) {
  if (isProcessing) return;

  isProcessing = true;
  setChipsDisabled(true);
  showStatus("working", t("processing"));

  try {
    const { fullResponse, plainText, isMeta } = await executeDocumentAction({
      userPrompt,
      insertMode,
      systemPrompt,
      onStatusUpdate: (len) => showStatus("working", `${t("writing")} (${len} chars)`)
    });

    if (isMeta) {
      const cleanResponse = fullResponse.replace(/^\[CHAT\]\s*/i, "");
      showStatus("info", t("chatRedirect"));
      store.addMessage("assistant", cleanResponse);
      chatUI.startStreamingMessage();
      chatUI.appendStreamChunk(cleanResponse);
      chatUI.finishStreamingMessage();
      showView("chat");
    } else {
      const useTrackChanges = store.get("trackChanges");
      if (insertMode === "replace") {
        await wordBridge.insertWithTrackChanges(plainText, "replace");
      } else if (insertMode === "after") {
        await wordBridge.insertParagraphAfterSelection(plainText);
      } else {
        await wordBridge.insertAtCursor(plainText);
      }
      showStatus("success", t("insertedOk"));
    }
  } catch (error) {
    showStatus("error", error.message);
  } finally {
    isProcessing = false;
    setChipsDisabled(false);
    store.set("isStreaming", false);
  }
}

// function executeQuickAction removed

// ============ Chat Mode (fallback) ============

async function sendChatMessage(userText) {
  const apiKey = store.get("apiKey");
  if (!apiKey) return;

  store.set("isStreaming", true);

  // Get document context
  let documentContext = "";
  try {
    const contextMode = store.get("contextMode");
    if (contextMode === "full") {
      documentContext = await wordBridge.getFullDocumentText();
    } else {
      documentContext = await wordBridge.getSelectedText();
    }
  } catch (e) { /* continue */ }

  let messageContent = userText;
  if (documentContext) {
    const { text: truncatedContext } = truncateText(documentContext);
    messageContent = `[${t("contextDocumentLabel")}]\n${truncatedContext}\n\n[${t("requestLabel")}]\n${userText}`;
  }

  // Show in chat UI
  chatUI.renderUserMessage(userText);
  store.addMessage("user", userText);

  const messages = store.get("messages").map((m) => ({
    role: m.role,
    content: m.role === "user" && m === store.get("messages")[store.get("messages").length - 1]
      ? messageContent
      : m.content,
  }));

  const systemPrompt = store.get("systemPrompt") || null;

  chatUI.startStreamingMessage();
  const client = new AnthropicClient(apiKey, store.get("model"), store.get("baseUrl"));
  let fullResponse = "";

  try {
    for await (const chunk of client.streamMessage(messages, systemPrompt)) {
      fullResponse += chunk;
      chatUI.appendStreamChunk(chunk);
    }
    chatUI.finishStreamingMessage();
    store.addMessage("assistant", fullResponse);
  } catch (error) {
    chatUI.finishStreamingMessage();
    const errorMsg = error instanceof ApiError
      ? formatError(error)
      : formatError({ message: error.message });
    chatUI.renderErrorMessage(errorMsg);
  } finally {
    store.set("isStreaming", false);
  }
}

// ============ Message Actions (chat mode) ============

async function handleMessageAction(action, rawText) {
  const plainText = stripMarkdown(rawText);
  const useTrackChanges = store.get("trackChanges");

  try {
    switch (action) {
      case "insert-cursor":
        if (useTrackChanges) {
          await wordBridge.insertWithTrackChanges(plainText, "end");
        } else {
          await wordBridge.insertAtCursor(plainText);
        }
        break;
      case "replace-selection":
        if (useTrackChanges) {
          await wordBridge.insertWithTrackChanges(plainText, "replace");
        } else {
          await wordBridge.replaceSelection(plainText);
        }
        break;
      case "copy":
        try {
          await navigator.clipboard.writeText(plainText);
        } catch {
          const textarea = document.createElement("textarea");
          textarea.value = plainText;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
        break;
    }
  } catch (error) {
    showStatus("error", `${t("errorPrefix")} ${error.message}`);
  }
}

// ============ UI Helpers ============

function showStatus(type, message) {
  const area = document.getElementById("status-area");
  const emptyState = document.getElementById("empty-state");

  if (emptyState) emptyState.style.display = "none";

  if (type === "working") {
    area.innerHTML = `
      <div class="status-msg status-msg--working">
        <div class="status-spinner"></div>
        <span>${escapeHtml(message)}</span>
      </div>`;
  } else if (type === "success") {
    area.innerHTML = `
      <div class="status-msg status-msg--success">
        <span class="status-check">&#10003;</span>
        <span>${escapeHtml(message)}</span>
      </div>`;
    // Reset to empty state after 3 seconds
    setTimeout(() => {
      if (!isProcessing) {
        const statusMsg = area.querySelector(".status-msg");
        if (statusMsg) statusMsg.remove();
        const es = document.getElementById("empty-state");
        if (es) es.style.display = "";
      }
    }, 3000);
  } else if (type === "error" || type === "info") {
    area.innerHTML = `
      <div class="status-msg status-msg--${type === "info" ? "working" : "error"}">
        <span>${type === "info" ? "&#8505;" : "&#10007;"}</span>
        <span>${escapeHtml(message)}</span>
      </div>`;
  }
}

function addLogEntry(type, text) {
  const log = document.getElementById("activity-log");
  const icon = type === "success" ? "&#10003;" : type === "info" ? "&#8505;" : "&#10007;";
  const entry = document.createElement("div");
  entry.className = "log-entry fade-in";
  entry.innerHTML = `
    <span class="log-entry__icon">${icon}</span>
    <span class="log-entry__text">${escapeHtml(text)}</span>`;
  log.insertBefore(entry, log.firstChild);

  // Keep only last 5 entries
  while (log.children.length > 5) {
    log.removeChild(log.lastChild);
  }
}

function setChipsDisabled(disabled) {
  document.querySelectorAll(".action-chip").forEach((chip) => {
    chip.disabled = disabled;
  });
}

function updateSendButton() {
  const btn = document.getElementById("send-btn");
  const hasKey = !!store.get("apiKey");
  btn.disabled = !hasKey || isProcessing;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
