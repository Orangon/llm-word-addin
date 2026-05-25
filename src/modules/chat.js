/**
 * Chat UI module - message rendering, streaming display, action buttons
 */

import { markdownToHtml } from "./markdown.js";
import { generateId } from "./utils.js";
import { t } from "./i18n.js";

export class ChatUI {
  constructor(containerEl, emptyStateEl) {
    this.container = containerEl;
    this.emptyState = emptyStateEl;
    this._currentStreamEl = null;
    this._currentStreamText = "";
    this._onAction = null;
    this._isUserAtBottom = true;
    this._setupScrollTracking();
  }

  setActionHandler(handler) {
    this._onAction = handler;
  }

  renderUserMessage(text) {
    this._hideEmptyState();
    this._isUserAtBottom = true;
    const el = this._createMessageEl("user", text);
    this.container.appendChild(el);
    this._scrollToBottom();
    return el;
  }

  startStreamingMessage() {
    this._hideEmptyState();
    this._currentStreamText = "";
    const el = this._createMessageEl("assistant", "");
    const textEl = el.querySelector(".message__text");
    textEl.classList.add("streaming-cursor");
    this.container.appendChild(el);
    this._currentStreamEl = el;
    this._scrollToBottom();
    return el;
  }

  appendStreamChunk(text) {
    if (!this._currentStreamEl) return;
    this._currentStreamText += text;
    const textEl = this._currentStreamEl.querySelector(".message__text");
    textEl.innerHTML = markdownToHtml(this._currentStreamText);
    textEl.classList.add("streaming-cursor");
    this._scrollToBottom();
  }

  finishStreamingMessage() {
    if (!this._currentStreamEl) return;
    const textEl = this._currentStreamEl.querySelector(".message__text");
    textEl.classList.remove("streaming-cursor");
    textEl.innerHTML = markdownToHtml(this._currentStreamText);

    // Add action buttons
    const actionsEl = document.createElement("div");
    actionsEl.className = "message__actions";

    const rawText = this._currentStreamText;

    actionsEl.innerHTML = `
      <button class="message__action-btn" data-msg-action="insert-cursor" data-i18n="insertAtCursor">${t("insertAtCursor")}</button>
      <button class="message__action-btn" data-msg-action="replace-selection" data-i18n="replaceSelectionAction">${t("replaceSelectionAction")}</button>
      <button class="message__action-btn" data-msg-action="copy" data-i18n="copy">${t("copy")}</button>
    `;

    actionsEl.querySelectorAll("[data-msg-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (this._onAction) {
          this._onAction(btn.dataset.msgAction, rawText);
        }
      });
    });

    this._currentStreamEl.querySelector(".message__content").appendChild(actionsEl);
    this._currentStreamEl = null;
    this._currentStreamText = "";
    this._scrollToBottom();
  }

  renderErrorMessage(errorText) {
    this._hideEmptyState();
    const el = document.createElement("div");
    el.className = "message message--error fade-in";
    el.innerHTML = `
      <div class="message__content">
        <div class="message__text">${this._escapeHtml(errorText)}</div>
      </div>
    `;
    this.container.appendChild(el);
    this._scrollToBottom();
  }

  clear() {
    this.container.innerHTML = "";
    this._currentStreamEl = null;
    this._currentStreamText = "";
    this._showEmptyState();
  }

  _createMessageEl(role, text) {
    const el = document.createElement("div");
    el.className = `message message--${role} fade-in`;
    const avatar = role === "user" ? t("userAvatar") : "C";
    const renderedText = role === "user" ? this._escapeHtml(text) : markdownToHtml(text);

    el.innerHTML = `
      <div class="message__avatar">${avatar}</div>
      <div class="message__content">
        <div class="message__text">${renderedText}</div>
      </div>
    `;
    return el;
  }

  _escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  _setupScrollTracking() {
    const chatView = this.container.closest(".view");
    if (!chatView) return;
    chatView.addEventListener("scroll", () => {
      const threshold = 50;
      this._isUserAtBottom =
        chatView.scrollTop + chatView.clientHeight >= chatView.scrollHeight - threshold;
    });
  }

  _scrollToBottom() {
    if (!this._isUserAtBottom) return;
    const chatView = this.container.closest(".view");
    if (chatView) {
      chatView.scrollTop = chatView.scrollHeight;
    }
  }

  _hideEmptyState() {
    if (this.emptyState) {
      this.emptyState.style.display = "none";
    }
  }

  _showEmptyState() {
    if (this.emptyState) {
      this.emptyState.style.display = "";
    }
  }
}
