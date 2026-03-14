/**
 * Settings module - API key, model selection, system prompt management
 */

import { store } from "./state.js";
import { AnthropicClient } from "./api-client.js";
import { getModelDisplayName } from "./utils.js";

export class Settings {
  constructor() {
    this.apiKeyInput = document.getElementById("api-key-input");
    this.modelSelect = document.getElementById("model-select");
    this.systemPromptInput = document.getElementById("system-prompt-input");
    this.statusEl = document.getElementById("settings-status");
    this.modelIndicator = document.getElementById("model-indicator");

    this._loadFromStore();
  }

  _loadFromStore() {
    const apiKey = store.get("apiKey");
    const model = store.get("model");
    const systemPrompt = store.get("systemPrompt");

    if (apiKey) this.apiKeyInput.value = apiKey;
    if (model) this.modelSelect.value = model;
    if (systemPrompt) this.systemPromptInput.value = systemPrompt;

    this._updateModelIndicator(model);
  }

  save() {
    const apiKey = this.apiKeyInput.value.trim();
    const model = this.modelSelect.value;
    const systemPrompt = this.systemPromptInput.value.trim();

    store.set("apiKey", apiKey || null);
    store.set("model", model);
    store.set("systemPrompt", systemPrompt);

    this._updateModelIndicator(model);
    this._showStatus("Impostazioni salvate.", "success");
  }

  async testConnection() {
    const apiKey = this.apiKeyInput.value.trim();
    if (!apiKey) {
      this._showStatus("Inserisci una API key.", "error");
      return;
    }

    this._showStatus("Test connessione in corso...", "success");

    try {
      const client = new AnthropicClient(apiKey, this.modelSelect.value);
      const response = await client.testConnection();
      this._showStatus(`Connessione riuscita! Risposta: "${response}"`, "success");
    } catch (error) {
      this._showStatus(`Errore: ${error.message}`, "error");
    }
  }

  toggleKeyVisibility() {
    const type = this.apiKeyInput.type;
    this.apiKeyInput.type = type === "password" ? "text" : "password";
  }

  _updateModelIndicator(model) {
    if (this.modelIndicator) {
      this.modelIndicator.textContent = getModelDisplayName(model);
    }
  }

  _showStatus(message, type) {
    this.statusEl.textContent = message;
    this.statusEl.className = "settings__status " + type;
    if (type === "success" && !message.includes("corso")) {
      setTimeout(() => {
        this.statusEl.className = "settings__status";
      }, 3000);
    }
  }
}
