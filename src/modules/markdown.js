/**
 * Lightweight Markdown to HTML converter
 * Handles: bold, italic, inline code, code blocks, headers, lists, links, paragraphs
 */

import { sanitizeHtml } from "./utils.js";

export function markdownToHtml(text) {
  if (!text) return "";

  // Escape HTML first
  let html = sanitizeHtml(text);

  // Fenced code blocks (```...```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="lang-${lang || "text"}">${code.trim()}</code></pre>`;
  });

  // Inline code (`...`)
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Headers (### ## #)
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold (**text**)
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Italic (*text*)
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Links [text](url) - only allow safe protocols
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    const trimmedUrl = url.trim();
    // Allowlist: https, http, mailto, tel, ftp
    const safeProtocols = /^(https?|mailto|tel|ftp):\/?\/?/i;
    const isRelative = !trimmedUrl.includes("://") && !trimmedUrl.startsWith("mailto:") && !trimmedUrl.startsWith("tel:");

    if (safeProtocols.test(trimmedUrl) || isRelative) {
      return `<a href="${trimmedUrl}" target="_blank" rel="noopener">${text}</a>`;
    } else {
      // Strip unsafe protocols, return text only
      return text;
    }
  });

  // Ordered lists (1. item, 2. item, etc.) - mark with data attr
  html = html.replace(/^\d+\. (.+)$/gm, '<li data-ordered="1">$1</li>');

  // Unordered lists (- item or * item)
  html = html.replace(/^[\-\*] (.+)$/gm, '<li data-ordered="0">$1</li>');

  // Wrap consecutive <li> - check if ordered or unordered
  html = html.replace(/((?:<li[^>]*>.*?<\/li>\n?)+)/g, (match) => {
    const isOrdered = match.includes('data-ordered="1"');
    const tag = isOrdered ? "ol" : "ul";
    const cleaned = match.replace(/ data-ordered="[01]"/g, "");
    return `<${tag}>${cleaned}</${tag}>`;
  });

  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr>");

  // Paragraphs - wrap remaining text blocks
  html = html
    .split("\n\n")
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (
        block.startsWith("<h") ||
        block.startsWith("<pre") ||
        block.startsWith("<ul") ||
        block.startsWith("<ol") ||
        block.startsWith("<hr")
      ) {
        return block;
      }
      // Replace single newlines with <br> inside paragraphs
      return "<p>" + block.replace(/\n/g, "<br>") + "</p>";
    })
    .join("\n");

  return html;
}

/**
 * Strips all markdown formatting from text, returning plain text.
 * Used when inserting Claude's response into Word document.
 */
export function stripMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/```\w*\n[\s\S]*?```/g, (match) =>
      match.replace(/```\w*\n/, "").replace(/```$/, "")
    )
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,3} /gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[\-\*] /gm, "- ")
    .replace(/^---$/gm, "")
    // Remove leftover emphasis markers that can trigger Word auto-formatting
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/(^|\s)\*(\S)/g, "$1$2")
    .replace(/(\S)\*(\s|$)/g, "$1$2")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
