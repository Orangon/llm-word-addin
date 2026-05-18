# Claude for Word — User Manual

> A comprehensive guide to all features, modes, and controls of the Claude for Word add-in.

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Interface Layout](#interface-layout)
4. [Context Modes](#context-modes)
   - [Document Mode](#document-mode)
   - [Selection Mode](#selection-mode)
5. [Edit Modes (Action Modes)](#edit-modes-action-modes)
   - [Replace Selection](#replace-selection)
   - [Insert After](#insert-after)
   - [Insert at End](#insert-at-end)
   - [Chat Only](#chat-only)
6. [Track Changes](#track-changes)
7. [Quick Action Chips](#quick-action-chips)
   - [Rewrite](#rewrite)
   - [Summarize](#summarize)
   - [Translate EN](#translate-en)
   - [Formal Tone](#formal-tone)
   - [Contract Review](#contract-review)
   - [Legal References](#legal-references)
   - [Text Analysis](#text-analysis)
8. [Custom Instructions](#custom-instructions)
9. [Settings](#settings)
   - [API Key](#api-key)
   - [API Base URL](#api-base-url)
   - [Model Selection](#model-selection)
   - [Custom Models](#custom-models)
   - [System Instructions](#system-instructions)
10. [Chat Mode Details](#chat-mode-details)
11. [Error Handling](#error-handling)
12. [Keyboard Shortcuts](#keyboard-shortcuts)
13. [Architecture Overview](#architecture-overview)

---

## Overview

**Claude for Word** is a Microsoft Word add-in that integrates Claude AI directly into your document editing workflow. Instead of copying text to a separate chat window, Claude writes output **directly into your Word document**.

**Key concept:** The add-in has two distinct operating modes:
- **Document Mode** (default): Claude's output is inserted directly into your Word document
- **Chat Mode**: A traditional chat interface in the sidebar (fallback for non-insertable responses)

---

## Getting Started

1. **Install the add-in** in Microsoft Word
2. **Configure your API key** — click the ⋮ menu → Settings → enter your Anthropic API key
3. **Select text** in your document (or leave empty to work with the full document)
4. **Type an instruction** or click a Quick Action chip
5. **Click Send** (→) or press Enter

---

## Interface Layout

The add-in sidebar is organized into these areas:

```
┌─────────────────────────────────────┐
│  Claude                    [EN] [⋮] │  ← Header: title, language toggle, settings
├─────────────────────────────────────┤
│                                     │
│  Status Area / Empty State          │  ← Shows what Claude is doing
│                                     │
│  Chat Messages (if in Chat mode)    │  ← Conversation history
│                                     │
│  ┌─ Quick Action Chips ────────────┐│
│  │ Rewrite | Summarize | Translate ││  ← One-click actions
│  │ Formal | Contract | Legal | ... ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  ○ Selection  ● Document  ☐ Track  │  ← Context mode + Track Changes
│  ┌─────────────────────────────────┐│
│  │ Type an instruction for Claude..││  ← Text input
│  ├─────────────────────────────────┤│
│  │ [Replace selection ▼]  Sonnet → ││  ← Edit mode selector + Send
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## Context Modes

Context modes control **what document content** Claude sees when generating a response. These are the two radio buttons at the bottom of the sidebar.

### Document Mode

**Radio button:** `● Document` (default)

| Aspect | Description |
|--------|-------------|
| **What Claude sees** | The entire Word document text |
| **When to use** | When your instruction relates to the whole document (e.g., "Summarize this document", "Check the overall structure") |
| **How it works** | Reads all paragraphs from the Word document body via Office.js API |
| **Limitations** | Very long documents are truncated at ~100,000 characters (~25K tokens) |

**Example workflow:**
1. Select `● Document`
2. Type: "Summarize the key points of this document"
3. Click Send
4. Claude reads the full document and generates a summary

### Selection Mode

**Radio button:** `○ Selection`

| Aspect | Description |
|--------|-------------|
| **What Claude sees** | Only the text you have selected (highlighted) in Word |
| **When to use** | When your instruction targets a specific paragraph, sentence, or section |
| **How it works** | Reads the current selection via `document.getSelection()` |
| **Requirement** | You must select text first, otherwise some actions will show an error |

**Example workflow:**
1. Select/highlight a paragraph in Word
2. Select `○ Selection`
3. Type: "Rewrite this more concisely"
4. Click Send
5. Claude rewrites only the selected text

### How Context is Sent to Claude

The context is **injected into the user message** (not as a system prompt):

```
[Document Context]
{your document or selection text}

[Request]
{your instruction}
```

For Document Mode in direct-write actions, the format is:
```
{your instruction}

---

{document text}
```

---

## Edit Modes (Action Modes)

Edit modes control **where Claude's output goes** in your Word document. These are the dropdown options at the bottom-left of the input area.

### Replace Selection

**Dropdown:** `Replace selection`

| Aspect | Description |
|--------|-------------|
| **What it does** | Replaces the currently selected text with Claude's output |
| **When to use** | Rewriting, translating, or reformatting existing text |
| **Requirement** | You must have text selected in the document |
| **Error if no selection** | "Select text in the document before using this action" |

**Use cases:**
- Rewrite a paragraph
- Translate selected text
- Change tone of a sentence
- Reformat a section

### Insert After

**Dropdown:** `Insert after`

| Aspect | Description |
|--------|-------------|
| **What it does** | Inserts Claude's output as a new paragraph **after** the current selection |
| **When to use** | Adding commentary, summaries, or supplementary content below existing text |
| **Requirement** | Place your cursor or select text where you want the insertion point |

**Use cases:**
- Add a summary after a section
- Insert commentary after a quote
- Add a translation below the original text

### Insert at End

**Dropdown:** `Insert at end`

| Aspect | Description |
|--------|-------------|
| **What it does** | Inserts Claude's output at the **end of the document** |
| **When to use** | Adding appendices, conclusions, or new sections |
| **Requirement** | None — works regardless of cursor position |

**Use cases:**
- Add a conclusion or summary at the end
- Append an appendix
- Add a bibliography or references section

### Chat Only

**Dropdown:** `Chat only`

| Aspect | Description |
|--------|-------------|
| **What it does** | Shows Claude's response in the sidebar chat, **not in the document** |
| **When to use** | Asking questions, getting explanations, or when you don't want to modify the document |
| **Behavior** | Multi-turn conversation — Claude remembers previous messages in the chat |

**Use cases:**
- "What does this clause mean?"
- "Can you explain the legal implications?"
- "How should I structure this document?"
- General Q&A about the document content

**Note:** When using Chat Only mode, Claude can see your document context (based on the context mode setting), so you can ask questions about your document.

---

## Track Changes

**Toggle:** `☐ Track Changes` (checkbox in the mode bar)

| Aspect | Description |
|--------|-------------|
| **What it does** | When enabled, all text insertions/replacements are recorded as Word Track Changes |
| **When to use** | When you need to review Claude's edits before accepting them |
| **How it works** | Temporarily enables Word's Track Changes mode, inserts text, then restores the previous mode |
| **Requirement** | Word API 1.4+ (available in recent versions of Word) |

### How Track Changes Works

1. **Before insertion:** The add-in saves the current Track Changes mode
2. **During insertion:** Track Changes is enabled (`Word.ChangeTrackingMode.trackAll`)
3. **Text is inserted** with Track Changes recording
4. **After insertion:** The previous Track Changes mode is restored

### Visual Example

With Track Changes **off**:
```
Original text here.
```
→ After rewrite:
```
Rewritten text here.
```

With Track Changes **on**:
```
Original text here.    ← shown as deleted (strikethrough, red)
Rewritten text here.   ← shown as inserted (underline, colored)
```

### When to Use Track Changes

| Scenario | Track Changes |
|----------|---------------|
| Quick draft generation | Off |
| Legal document review | **On** |
| Collaborative editing | **On** |
| Translation verification | **On** |
| Personal note-taking | Off |

---

## Quick Action Chips

Quick actions are one-click buttons that execute predefined instructions. They bypass the text input and use built-in prompts.

### Rewrite

**Chip:** `✏️ Rewrite`

| Aspect | Description |
|--------|-------------|
| **Built-in prompt** | "Rewrite this text to be clearer, more professional and fluent" |
| **Default edit mode** | Replace selection |
| **Context mode** | Uses current context mode setting |
| **System prompt** | RAW_OUTPUT_SYSTEM (direct document insertion) |

**How it works:**
1. Select text in your document
2. Click "Rewrite"
3. Claude rewrites the selected text and replaces it in the document

### Summarize

**Chip:** `📝 Summarize`

| Aspect | Description |
|--------|-------------|
| **Built-in prompt** | "Summarize this text concisely" |
| **Default edit mode** | Insert after |
| **Context mode** | Uses current context mode setting |

**How it works:**
1. Select text or use Document mode
2. Click "Summarize"
3. Claude generates a summary and inserts it after the selection

### Translate EN

**Chip:** `🌐 Translate EN`

| Aspect | Description |
|--------|-------------|
| **Built-in prompt** | "Translate to English" |
| **Default edit mode** | Replace selection |
| **Context mode** | Uses current context mode setting |

**How it works:**
1. Select non-English text
2. Click "Translate EN"
3. Claude translates and replaces the selection with English text

### Formal Tone

**Chip:** `🛡️ Formal tone`

| Aspect | Description |
|--------|-------------|
| **Built-in prompt** | "Rewrite in a formal and professional tone, suitable for legal correspondence" |
| **Default edit mode** | Replace selection |
| **Context mode** | Uses current context mode setting |

**How it works:**
1. Select informal text
2. Click "Formal tone"
3. Claude rewrites with formal, professional language

### Contract Review

**Chip:** `📄 Contract review`

| Aspect | Description |
|--------|-------------|
| **Built-in prompt** | Specialized legal analysis prompt (see below) |
| **Default edit mode** | Insert after |
| **System prompt** | Specialized contract review system prompt |
| **Target audience** | Legal professionals |

**Analysis includes:**
- **Contracting Parties** — identifies all parties, roles, and obligations
- **Contract Object** — describes the subject matter
- **Critical Clauses** — lists risky/ambiguous clauses with severity and suggestions
- **Missing Clauses** — identifies typical clauses that should be included
- **Regulatory Compliance** — checks against Italian Civil Code, Consumer Code, GDPR
- **Overall Assessment** — provides legal soundness judgment

**How it works:**
1. Select the contract text (or use Document mode)
2. Click "Contract review"
3. Claude performs a detailed legal analysis and inserts it after the text

### Legal References

**Chip:** `📖 Legal refs`

| Aspect | Description |
|--------|-------------|
| **Built-in prompt** | Specialized legal reference identification prompt |
| **Default edit mode** | Insert after |
| **System prompt** | Specialized normative analysis system prompt |

**Analysis includes:**
- **National Law** — Italian Civil Code, Code of Civil Procedure, special laws
- **European Law** — EU Regulations, Directives, decisions
- **Relevant Case Law** — Corte di Cassazione, Constitutional Court, CJEU

**How it works:**
1. Select legal text
2. Click "Legal refs"
3. Claude identifies all applicable legal references and inserts them

### Text Analysis

**Chip:** `💬 Text analysis`

| Aspect | Description |
|--------|-------------|
| **What it does** | Analyzes text readability and comprehensibility |
| **Output** | Displayed in a dedicated Readability view (not inserted into document) |
| **Metrics** | Word count, sentence count, paragraph count, character count, reading time |
| **Readability indices** | Gulpease (Italian), Flesch-Kincaid (English) |

**Metrics provided:**

| Metric | Description |
|--------|-------------|
| Words | Total word count |
| Sentences | Total sentence count |
| Paragraphs | Total paragraph count |
| Characters | Total character count |
| Average sentence length | Words per sentence |
| Average word length | Characters per word |
| Reading time | Estimated time to read |
| Gulpease Index | Italian readability score (0-100) |
| Flesch-Kincaid | English readability score (0-100) |

**Gulpease Score Levels:**
| Score | Level |
|-------|-------|
| 80-100 | Very easy — readable by elementary school students |
| 60-79 | Easy — readable by middle school students |
| 40-59 | Difficult — readable by high school graduates |
| 0-39 | Very difficult — readable only by college graduates |

**Flesch-Kincaid Score Levels:**
| Score | Level |
|-------|-------|
| 90-100 | Very easy — understood by 5th graders |
| 80-89 | Easy — conversational English |
| 70-79 | Fairly easy — understood by most adults |
| 60-69 | Standard — understood by 13-15 year olds |
| 50-59 | Fairly difficult — some college level |
| 30-49 | Difficult — college graduate level |
| 0-29 | Very difficult — professional/academic |

---

## Custom Instructions

You can type **any instruction** in the text input field. Claude will follow your custom prompt.

**Examples:**
- "Convert this paragraph to bullet points"
- "Add a transition sentence between these two sections"
- "Check this text for grammar errors"
- "Rewrite this in the style of a legal brief"
- "Explain what this clause means in simple terms"

**How custom instructions work:**
1. Type your instruction in the input field
2. The instruction is combined with document context (based on context mode)
3. Claude processes and generates a response
4. The response is handled according to the selected edit mode

---

## Settings

Access settings via the ⋮ menu button in the header.

### API Key

| Setting | Description |
|---------|-------------|
| **Field** | `Anthropic API Key` |
| **Format** | `sk-ant-...` |
| **Storage** | Saved locally in browser localStorage |
| **Security** | Never sent to any server except Anthropic's API |
| **Get your key** | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |

**Note:** The API key is stored locally on your device. It is only sent directly to the Anthropic API endpoint. The add-in does not send your key to any other server.

### API Base URL

| Setting | Description |
|---------|-------------|
| **Field** | `API Base URL` |
| **Default** | `https://api.anthropic.com/v1/messages` |
| **When to change** | Using a proxy, enterprise endpoint, or compatible API |
| **Format** | Must start with `http://` or `https://` |

**Use cases for custom Base URL:**
- Enterprise proxy servers
- API gateways
- Compatible third-party services
- Local development/testing

### Model Selection

| Setting | Description |
|---------|-------------|
| **Field** | `Model` |
| **Default** | `Claude Sonnet 4.6` |
| **Options** | Sonnet 4.6 (recommended), Opus 4.6 (most capable), Haiku 4.5 (economical) |

**Model comparison:**

| Model | Speed | Capability | Cost | Best for |
|-------|-------|------------|------|----------|
| Sonnet 4.6 | Fast | High | Medium | Daily use, balanced performance |
| Opus 4.6 | Slower | Highest | High | Complex analysis, critical documents |
| Haiku 4.5 | Fastest | Good | Low | Quick edits, simple tasks |

### Custom Models

You can add custom model IDs if you have access to specialized Claude models.

**How to add a custom model:**
1. In Settings, find the "Custom Models" section
2. Enter a **Display Name** (e.g., "My Custom Model")
3. Enter the **Model ID** (e.g., `my-custom-model-v1`)
4. Click "Add model"
5. The model appears in the model dropdown

**Managing custom models:**
- Custom models appear below the built-in models in the dropdown
- Click the ✕ button next to a custom model to remove it
- Custom models are saved in localStorage

### System Instructions

| Setting | Description |
|---------|-------------|
| **Field** | `System Instructions` |
| **Purpose** | Persistent instructions that apply to all Chat Only conversations |
| **Example** | "Always reply in English. Use a formal and professional tone." |

**Note:** System instructions are only used in Chat Only mode. Document mode uses a special system prompt (`RAW_OUTPUT_SYSTEM`) that forces Claude to output text directly insertable into the document.

**Example system instructions:**
- "Always respond in Italian"
- "Use formal legal language"
- "Keep responses concise"
- "Include citations when possible"

---

## Chat Mode Details

When using **Chat Only** mode, the add-in operates as a traditional chat interface.

### Multi-turn Conversation

- Claude remembers previous messages in the chat session
- Each message includes the full conversation history
- The conversation resets when you reload the add-in

### Message Actions

After Claude responds in Chat mode, three action buttons appear:

| Button | Description |
|--------|-------------|
| **Insert at cursor** | Inserts the response text at your cursor position in Word |
| **Replace selection** | Replaces your current selection with the response text |
| **Copy** | Copies the response text to clipboard |

### Context in Chat Mode

In Chat mode, document context is injected into the **last user message**:

```
[Document Context]
{your document or selection text}

[Request]
{your question}
```

This means Claude always has access to your document content when answering questions.

---

## Error Handling

The add-in handles various error scenarios gracefully:

| Error Type | Message | Solution |
|------------|---------|----------|
| **Authentication** | "Invalid API key. Check your settings." | Verify your API key in Settings |
| **Rate Limit** | "Rate limit reached. Please try again in a few seconds." | Wait a moment and try again |
| **Overloaded** | "Claude is temporarily overloaded. Please try again shortly." | Wait and retry |
| **Network** | "Network error. Check your internet connection." | Check your internet connection |
| **Context Too Large** | "The document is too long. Try selecting only part of the text." | Use Selection mode or select less text |
| **No Selection** | "Select text in the document before using this action." | Select text first, or change edit mode |
| **No API Key** | "Configure your API key in settings." | Add your API key in Settings |

### Meta Response Detection

Sometimes Claude's response cannot be directly inserted into a document (e.g., it's a question, explanation, or instructions). The add-in detects these "meta responses" and automatically redirects them to the chat sidebar.

**Detection patterns:**
- Responses starting with `[CHAT]`
- Step-by-step instructions
- Apologetic responses ("I'm sorry, I cannot...")
- Recommendations ("I recommend...")
- Code blocks

When a meta response is detected, you'll see: "Response shown in chat (cannot be inserted into document)."

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Enter** | Send message |
| **Shift + Enter** | New line in input |
| **Escape** | Clear input (if focused) |

---

## Architecture Overview

For technical understanding, here's how the add-in processes a request:

```
┌─────────────────────────────────────────────────────────────┐
│                        User Action                          │
│  (Type instruction + Click Send, or Click Quick Action)     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Context Assembly                          │
│  ┌───────────────┐    ┌──────────────────┐                  │
│  │ Full Document  │ OR │ Selected Text    │                  │
│  │ (Document mode)│    │ (Selection mode) │                  │
│  └───────┬───────┘    └────────┬─────────┘                  │
│          └──────────┬──────────┘                            │
│                     ▼                                       │
│           ┌────────────────┐                                │
│           │ truncateText() │  Max 100,000 chars             │
│           └───────┬────────┘                                │
└───────────────────┼─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Message Construction                      │
│                                                              │
│  Document Mode:                                              │
│    Single message: {instruction} + {context}                 │
│    System: RAW_OUTPUT_SYSTEM                                 │
│                                                              │
│  Chat Mode:                                                  │
│    Full message history from store.messages                  │
│    Last message: {context} + {instruction}                   │
│    System: user-configured systemPrompt                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Call (SSE Streaming)                   │
│  AnthropicClient.streamMessage(messages, systemPrompt)       │
│  → Real-time token streaming                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Response Handling                          │
│                                                              │
│  ┌─────────────────┐    ┌─────────────────────┐             │
│  │ Document Mode   │    │ Chat Mode            │             │
│  │                 │    │                      │             │
│  │ Check if meta   │    │ Show in chat sidebar │             │
│  │ response        │    │ with action buttons: │             │
│  │    │            │    │ - Insert at cursor   │             │
│  │    ├─Yes→ Chat  │    │ - Replace selection  │             │
│  │    └─No→ Insert │    │ - Copy               │             │
│  │       into Word │    │                      │             │
│  └─────────────────┘    └─────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### Data Storage

| Data | Storage | Persistence |
|------|---------|-------------|
| API Key | localStorage | Survives browser restart |
| Model selection | localStorage | Survives browser restart |
| System prompt | localStorage | Survives browser restart |
| Base URL | localStorage | Survives browser restart |
| Custom models | localStorage | Survives browser restart |
| Chat messages | In-memory only | Resets on page reload |
| Interface language | localStorage | Survives browser restart |

---

## Quick Reference Card

### Context Modes
| Mode | What Claude Sees | Best For |
|------|------------------|----------|
| **Document** | Full document | Whole-document operations |
| **Selection** | Selected text only | Targeted edits |

### Edit Modes
| Mode | Where Output Goes | Best For |
|------|-------------------|----------|
| **Replace selection** | Replaces selected text | Rewriting, translating |
| **Insert after** | After selection | Summaries, commentary |
| **Insert at end** | End of document | Appendices, conclusions |
| **Chat only** | Sidebar chat | Questions, explanations |

### Quick Actions
| Action | What It Does | Default Edit Mode |
|--------|--------------|-------------------|
| **Rewrite** | Clearer, more professional text | Replace selection |
| **Summarize** | Concise summary | Insert after |
| **Translate EN** | English translation | Replace selection |
| **Formal tone** | Professional/formal language | Replace selection |
| **Contract review** | Legal analysis | Insert after |
| **Legal refs** | Applicable laws/regulations | Insert after |
| **Text analysis** | Readability metrics | Readability view |

### Track Changes
| Setting | Effect |
|---------|--------|
| **Off** | Direct text insertion |
| **On** | Insertions recorded as Word Track Changes |

---

*Last updated: 2025*
*Version: Beta*
