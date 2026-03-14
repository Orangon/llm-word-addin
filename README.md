<div align="center">

<img src="https://raw.githubusercontent.com/MorkMindy74/claude-word-addin/master/assets/icon-80.png" alt="Claude for Word Logo" width="80" height="80">

# Claude for Word

### The AI-powered Microsoft Word Add-in that brings Claude directly into your documents

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Office.js](https://img.shields.io/badge/Office.js-Compatible-blue.svg)](https://docs.microsoft.com/en-us/office/dev/add-ins/)
[![Anthropic](https://img.shields.io/badge/Powered%20by-Claude%20AI-orange.svg)](https://www.anthropic.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## ✨ Overview

**Claude for Word** is a professional Microsoft Word Add-in that integrates [Anthropic's Claude AI](https://www.anthropic.com/) directly into your writing workflow. Write smarter, faster, and more accurately — whether you're drafting contracts, polishing reports, or analyzing complex documents.

> 💡 Claude writes **directly into your document** — formatted, tracked as changes, and ready to use.

---

## 🚀 Features

### 📄 Document-First AI
| Feature | Description |
|---|---|
| **Direct Insertion** | Claude writes directly into your document, formatted and ready to use |
| **Smart Context** | Automatically reads your full document or highlighted selection |
| **Track Changes** | All AI modifications appear as Redlines — perfect for professional reviews |
| **Real-time Streaming** | Watch Claude compose your content token by token |

### ⚖️ Legal & Professional Tools
| Tool | Description |
|---|---|
| **Contract Review** | High-level analysis of clauses, risks, and obligations |
| **Formal Reframing** | Instantly rewrite text in a professional or legal tone |
| **Legal References** | Identify applicable laws and regulations (CC, D.Lgs., EU Regs) |
| **Text Analysis** | Readability metrics via Gulpease & Flesch-Kincaid indexes |

### 🔒 Privacy & Security
- **Local API Key Storage** — Your key never leaves your browser
- **Direct Connection** — Calls go straight from Word to Anthropic's API (no middleman)
- **Open Source** — Fully auditable codebase for complete transparency

---

## 🛠️ Installation

### Prerequisites

- ✅ Microsoft Word (Windows, Mac, or Web)
- ✅ [Node.js](https://nodejs.org/) 18+
- ✅ [Anthropic API Key](https://console.anthropic.com/settings/keys)

### Step 1 — Clone the repository

```bash
git clone https://github.com/MorkMindy74/claude-word-addin.git
cd claude-word-addin
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Setup development certificates (required for HTTPS)

```bash
npm run dev-certs
```

### Step 4 — Start the development server

```bash
npm start
```

### Step 5 — Sideload in Word

1. Open **Microsoft Word** (Desktop or Online)
2. Go to **Home → Add-ins** (or **Insert → My Add-ins**)
3. Click **Upload My Add-in**
4. Select the `manifest.xml` file from your project folder

---

## 📖 Usage

1. **Open the Sidebar** — Click the **Claude** button in the Word Ribbon
2. **Configure API Key** — Click the ⚙️ Settings icon and enter your Anthropic API Key
3. **Choose a Model** — Select your preferred Claude model (e.g., Claude 3.5 Sonnet)
4. **Give an Instruction** — Type a prompt (e.g., *"Draft a non-disclosure clause"*) or select a Quick Action chip
5. **Pick an Insertion Mode**:
   - 🔄 **Replace selection** — Overwrite the selected text
   - ➕ **Insert after** — Append after the selection
   - 📄 **Insert at end** — Add to the end of the document

---

## 🏗️ Tech Stack

| Technology | Role |
|---|---|
| [Office.js](https://docs.microsoft.com/en-us/office/dev/add-ins/) | Microsoft Word integration & document manipulation |
| [Anthropic Messages API](https://docs.anthropic.com/en/api/messages) | Claude AI with SSE streaming |
| Vanilla JavaScript / CSS | Lightweight, zero-dependency runtime |
| [Webpack 5](https://webpack.js.org/) | Bundling & development environment |

---

## 📁 Project Structure

```
claude-word-addin/
├── src/
│   ├── taskpane/          # Main sidebar UI (HTML, CSS, JS)
│   ├── modules/           # Core logic: AI client, document ops
│   └── commands/          # Ribbon button commands
├── assets/                # Icons and static files
├── catalog/               # Add-in catalog configuration
├── manifest.xml           # Office Add-in manifest
├── webpack.config.js      # Build configuration
└── .env.example           # Environment variable template
```

---

## 🤝 Contributing

Contributions are what make open source amazing! 🎉

Please read our [**CONTRIBUTING.md**](CONTRIBUTING.md) for guidelines on:
- Reporting bugs
- Suggesting features
- Submitting pull requests

```bash
# Fork the project, then:
git checkout -b feature/your-amazing-feature
git commit -m 'Add: your amazing feature'
git push origin feature/your-amazing-feature
# Open a Pull Request
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ for legal professionals and writers everywhere

**[⭐ Star this repo](https://github.com/MorkMindy74/claude-word-addin)** if you find it useful!

</div>
