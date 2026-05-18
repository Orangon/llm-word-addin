/**
 * Anthropic Messages API client with SSE streaming
 */

import { DEFAULT_BASE_URL } from "./state.js";

function getI18nText(key) {
  const lang = localStorage.getItem("claude-word-lang") || "en";
  const dict = {
    it: {
      connectionFailed: "Impossibile connettersi al server Anthropic.",
      testPrompt: "Rispondi solo: OK",
      streamingError: "Errore streaming",
      httpError: "Errore HTTP",
    },
    en: {
      connectionFailed: "Unable to connect to the Anthropic server.",
      testPrompt: "Reply only: OK",
      streamingError: "Streaming error",
      httpError: "HTTP error",
    },
  };
  return (dict[lang] || dict.en)[key];
}

export class ApiError extends Error {
  constructor(message, type, status) {
    super(message);
    this.type = type;
    this.status = status;
  }
}

export class AnthropicClient {
  constructor(apiKey, model = "claude-sonnet-4-6", baseUrl = DEFAULT_BASE_URL) {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl;
  }

  _getHeaders() {
    return {
      "x-api-key": this.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    };
  }

  _buildBody(messages, systemPrompt, stream = true) {
    const body = {
      model: this.model,
      max_tokens: 4096,
      messages: messages,
      stream: stream,
    };
    if (systemPrompt) {
      body.system = systemPrompt;
    }
    return body;
  }

  async *streamMessage(messages, systemPrompt) {
    let response;
    try {
      response = await fetch(this.baseUrl, {
        method: "POST",
        headers: this._getHeaders(),
        body: JSON.stringify(this._buildBody(messages, systemPrompt, true)),
      });
    } catch (e) {
      throw new ApiError(getI18nText("connectionFailed"), "network", 0);
    }

    if (!response.ok) {
      await this._handleHttpError(response);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop(); // keep incomplete event in buffer

        for (const event of events) {
          const result = this._parseSSEEvent(event);
          if (result === null) continue;
          if (result === "DONE") return;
          yield result;
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        const result = this._parseSSEEvent(buffer);
        if (result && result !== "DONE") {
          yield result;
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async sendMessage(messages, systemPrompt) {
    let response;
    try {
      response = await fetch(this.baseUrl, {
        method: "POST",
        headers: this._getHeaders(),
        body: JSON.stringify(this._buildBody(messages, systemPrompt, false)),
      });
    } catch (e) {
      throw new ApiError(getI18nText("connectionFailed"), "network", 0);
    }

    if (!response.ok) {
      await this._handleHttpError(response);
    }

    const data = await response.json();
    const textBlocks = data.content.filter((b) => b.type === "text");
    return textBlocks.map((b) => b.text).join("");
  }

  async testConnection() {
    return this.sendMessage(
      [{ role: "user", content: getI18nText("testPrompt") }],
      null
    );
  }

  _parseSSEEvent(event) {
    const lines = event.split("\n");
    let eventType = null;
    let data = null;

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        eventType = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        data = line.slice(6);
      }
    }

    if (eventType === "message_stop" || eventType === "message_delta") {
      return "DONE";
    }

    if (eventType === "content_block_delta" && data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.delta && parsed.delta.text) {
          return parsed.delta.text;
        }
      } catch {
        // ignore malformed JSON
      }
    }

    if (eventType === "error" && data) {
      try {
        const parsed = JSON.parse(data);
        throw new ApiError(parsed.error?.message || getI18nText("streamingError"), "api_error", 0);
      } catch (e) {
        if (e instanceof ApiError) throw e;
      }
    }

    return null;
  }

  async _handleHttpError(response) {
    let errorBody;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { error: { message: `${getI18nText("httpError")} ${response.status}` } };
    }

    const message = errorBody?.error?.message || `${getI18nText("httpError")} ${response.status}`;

    switch (response.status) {
      case 401:
        throw new ApiError(message, "authentication", 401);
      case 429:
        throw new ApiError(message, "rate_limit", 429);
      case 529:
        throw new ApiError(message, "overloaded", 529);
      case 400:
        if (message.includes("too long") || message.includes("too many tokens")) {
          throw new ApiError(message, "context_too_large", 400);
        }
        throw new ApiError(message, "validation", 400);
      default:
        throw new ApiError(message, "api_error", response.status);
    }
  }
}
