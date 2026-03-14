/**
 * Document Logic - Handles document-first interactions and RAW system prompts
 */

import { wordBridge } from "./word-bridge.js";
import { stripMarkdown } from "./markdown.js";
import { store } from "./state.js";
import { AnthropicClient } from "./api-client.js";
import { legalTools } from "./legal.js";
import { truncateText } from "./utils.js";

// System prompt that forces raw output (no headers, no comments)
export const RAW_OUTPUT_SYSTEM = `You are an assistant integrated into Microsoft Word. Your output will be inserted DIRECTLY into the user's Word document.

ABSOLUTE RULES:
- Respond ONLY with the requested text, ready to be pasted into the document
- NEVER add titles, headers, or labels (e.g.: "Translation:", "Summary:", "Rewritten version:")
- NEVER add comments, explanations, notes, prefaces or postfaces
- NEVER add extra empty lines at the beginning or end
- NEVER use markdown formatting (no **, no #, no -)
- Maintain EXACTLY the same paragraph structure as the original text
- Your output must be IDENTICAL to what the user wants to see in their Word document, nothing else

EXCEPTION - If the user's request does NOT produce text to be inserted in the document (e.g.: general questions, requests to insert images, impossible requests, explanations), start your response with the exact prefix [CHAT] followed by the response. Example: "[CHAT] I cannot insert images into the document..."`;

/**
 * Detects if Claude's response is meta/instructional and should go to chat
 */
export function isMetaResponse(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("[CHAT]")) return true;

  const metaPatterns = [
    /^[0-9]+\.\s+(search|go|open|click|select|download|visit|navigate)/i,
    /^(unfortunately|i'm sorry),?.{0,20}(i cannot|i am not able|it is not possible|i can't help)/i,
    /^(i recommend|to (insert|add|create)|here (is how|are the steps|are the instructions|is what you will need))/i,
    /^```[\s\S]+```$/m,
  ];

  if (trimmed.length < 30) return false;
  return metaPatterns.some((pattern) => pattern.test(trimmed));
}

export async function executeDocumentAction({ 
  userPrompt, 
  insertMode, 
  systemPrompt = null, 
  onStatusUpdate 
}) {
  const apiKey = store.get("apiKey");
  if (!apiKey) throw new Error("API Key not configured");

  // Read document context
  let documentText = "";
  try {
    const contextMode = store.get("contextMode");
    documentText = contextMode === "full" 
      ? await wordBridge.getFullDocumentText() 
      : await wordBridge.getSelectedText();
  } catch (e) {
    // Continue without context
  }

  if (!documentText.trim() && insertMode === "replace") {
    throw new Error("Please select text in the document first.");
  }

  // Build message
  let messageContent = userPrompt;
  if (documentText) {
    const { text: truncated } = truncateText(documentText);
    messageContent = `${userPrompt}\n\n---\n\n${truncated}`;
  }

  const messages = [{ role: "user", content: messageContent }];
  const system = systemPrompt || RAW_OUTPUT_SYSTEM;

  const client = new AnthropicClient(apiKey, store.get("model"));
  let fullResponse = "";

  for await (const chunk of client.streamMessage(messages, system)) {
    fullResponse += chunk;
    if (onStatusUpdate) onStatusUpdate(fullResponse.length);
  }

  const plainText = stripMarkdown(fullResponse);
  
  return {
    fullResponse,
    plainText,
    isMeta: isMetaResponse(plainText)
  };
}
