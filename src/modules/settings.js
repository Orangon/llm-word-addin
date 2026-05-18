/**
 * Settings module - API key, model selection, system prompt management
 */

import { store, DEFAULT_BASE_URL } from "./state.js";
import { AnthropicClient } from "./api-client.js";
import { getModelDisplayName, generateId } from "./utils.js";
import { t } from "./i18n.js";

export class Settings {
  constructor() {
    this.baseUrlInput = document.getElementById("base-url-input");
    this.apiKeyInput = document.getElementById("api-key-input");
    this.modelSelect = document.getElementById("model-select");
    this.systemPromptInput = document.getElementById("system-prompt-input");
    this.statusEl = document.getElementById("settings-status");
    this.modelIndicator = document.getElementById("model-indicator");

    this._loadFromStore();
    this._setupCustomModelListeners();
  }

  _loadFromStore() {
    const baseUrl = store.get("baseUrl");
    const apiKey = store.get("apiKey");
    const model = store.get("model");
    const systemPrompt = store.get("systemPrompt");

    if (baseUrl) this.baseUrlInput.value = baseUrl;
    if (apiKey) this.apiKeyInput.value = apiKey;
    if (systemPrompt) this.systemPromptInput.value = systemPrompt;

    // Populate custom model options, then set selected value
    this._populateCustomModelOptions();
    if (model) this.modelSelect.value = model;

    this._updateModelIndicator(model);
    this._renderCustomModelsList();
  }

  _setupCustomModelListeners() {
    const addBtn = document.getElementById("add-custom-model-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => this._addCustomModel());
    }
  }

  _addCustomModel() {
    const nameInput = document.getElementById("custom-model-name");
    const idInput = document.getElementById("custom-model-id");
    const name = nameInput.value.trim();
    const id = idInput.value.trim();

    if (!name || !id) {
      this._showStatus(t("customModelFieldsRequired"), "error");
      return;
    }

    const customModels = store.get("customModels") || [];

    // Check for duplicate id (against built-in and existing custom)
    const builtInIds = ["claude-sonnet-4-6", "claude-opus-4-6", "claude-haiku-4-5-20251001"];
    if (builtInIds.includes(id) || customModels.some((m) => m.id === id)) {
      this._showStatus(t("customModelIdExists"), "error");
      return;
    }

    customModels.push({ id, name });
    store.set("customModels", customModels);

    nameInput.value = "";
    idInput.value = "";

    this._populateCustomModelOptions();
    this._renderCustomModelsList();
    this._showStatus(t("customModelAdded"), "success");
  }

  _removeCustomModel(modelId) {
    let customModels = store.get("customModels") || [];
    customModels = customModels.filter((m) => m.id !== modelId);
    store.set("customModels", customModels);

    // If the removed model was selected, switch to default
    if (this.modelSelect.value === modelId) {
      this.modelSelect.value = "claude-sonnet-4-6";
    }

    this._populateCustomModelOptions();
    this._renderCustomModelsList();
    this._updateModelIndicator(this.modelSelect.value);
  }

  _populateCustomModelOptions() {
    const customModels = store.get("customModels") || [];

    // Remove existing custom options (keep built-in ones)
    this.modelSelect.querySelectorAll("option.custom-model-option").forEach((el) => el.remove());

    // Add separator if there are custom models
    if (customModels.length > 0) {
      const separator = document.createElement("option");
      separator.disabled = true;
      separator.className = "custom-model-option";
      separator.textContent = "--- Custom Models ---";
      this.modelSelect.appendChild(separator);
    }

    // Add custom model options
    for (const model of customModels) {
      const option = document.createElement("option");
      option.value = model.id;
      option.textContent = model.name;
      option.className = "custom-model-option";
      this.modelSelect.appendChild(option);
    }
  }

  _renderCustomModelsList() {
    const listEl = document.getElementById("custom-models-list");
    if (!listEl) return;

    const customModels = store.get("customModels") || [];
    if (customModels.length === 0) {
      listEl.innerHTML = `<div class="custom-models-empty">${t("noCustomModels")}</div>`;
      return;
    }

    listEl.innerHTML = customModels
      .map(
        (m) => `
        <div class="custom-model-item">
          <div class="custom-model-info">
            <span class="custom-model-name">${m.name}</span>
            <span class="custom-model-id">${m.id}</span>
          </div>
          <button class="btn btn--ghost btn--sm custom-model-remove-btn" data-remove-model-id="${m.id}" title="${t("remove")}">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>`
      )
      .join("");

    // Attach remove handlers
    listEl.querySelectorAll("[data-remove-model-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this._removeCustomModel(btn.dataset.removeModelId);
      });
    });
  }

  save() {
    const baseUrl = this.baseUrlInput.value.trim();
    const apiKey = this.apiKeyInput.value.trim();
    const model = this.modelSelect.value;
    const systemPrompt = this.systemPromptInput.value.trim();

    const baseUrlError = this._validateBaseUrl(baseUrl);
    if (baseUrlError) {
      this._showStatus(baseUrlError, "error");
      return;
    }

    store.set("baseUrl", baseUrl || DEFAULT_BASE_URL);
    store.set("apiKey", apiKey || null);
    store.set("model", model);
    store.set("systemPrompt", systemPrompt);

    this._updateModelIndicator(model);
    this._showStatus(t("savedOk"), "success");
  }

  async testConnection() {
    const apiKey = this.apiKeyInput.value.trim();
    if (!apiKey) {
      this._showStatus(t("insertApiKey"), "error");
      return;
    }

    this._showStatus(t("testingConnection"), "success");

    try {
      const baseUrl = this.baseUrlInput.value.trim() || DEFAULT_BASE_URL;
      const baseUrlError = this._validateBaseUrl(baseUrl);
      if (baseUrlError) {
        this._showStatus(baseUrlError, "error");
        return;
      }

      const client = new AnthropicClient(apiKey, this.modelSelect.value, baseUrl);
      const response = await client.testConnection();
      this._showStatus(`${t("connectionOk")} "${response}"`, "success");
    } catch (error) {
      this._showStatus(`Error: ${error.message}`, "error");
    }
  }

  toggleKeyVisibility() {
    const type = this.apiKeyInput.type;
    this.apiKeyInput.type = type === "password" ? "text" : "password";
  }

  _updateModelIndicator(model) {
    if (this.modelIndicator) {
      const customModels = store.get("customModels") || [];
      this.modelIndicator.textContent = getModelDisplayName(model, customModels);
    }
  }

  _showStatus(message, type) {
    this.statusEl.textContent = message;
    this.statusEl.className = "settings__status " + type;
    if (type === "success") {
      setTimeout(() => {
        this.statusEl.className = "settings__status";
      }, 3000);
    }
  }

  _validateBaseUrl(baseUrl) {
    if (!baseUrl) return null;

    try {
      const parsedUrl = new URL(baseUrl);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return "Base URL must start with http:// or https://.";
      }
    } catch {
      return "Invalid Base URL.";
    }

    return null;
  }
}
