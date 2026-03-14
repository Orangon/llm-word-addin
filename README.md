# Claude for Word 📝

Transform your Microsoft Word experience with **Claude AI**. This professional Add-in integrates Anthropic's Claude directly into your side panel, enabling powerful AI-assisted writing, document analysis, and specialized legal tools.

![Claude for Word](https://localhost:3000/assets/icon-80.png)

## ✨ Key Features

### 🚀 Document-First AI
- **Direct Insertion**: Claude writes directly into your document, formatted and ready to use.
- **Smart Context**: Automatically reads your full document or highlighted selection.
- **Track Changes Support**: All AI modifications appear as revisions (Redlines), perfect for professional reviews.
- **Real-time Streaming**: Watch Claude compose your content token by token.

### ⚖️ Legal & Professional Tools
- **Contract Review**: High-level analysis of clauses, risks, and obligations.
- **Formal Reframing**: Instantly rewrite text in a professional or legal tone.
- **Legal References**: Identify applicable laws and regulations (CC, D.Lgs., EU Regs).
- **Text Analysis**: Advanced readability metrics (Gulpease & Flesch-Kincaid) to ensure clarity.

### 🔒 Privacy & Security
- **Local Storage**: Your API Key is stored safely in your browser's local storage.
- **Direct Connection**: Calls go directly from Word to Anthropic's API—no middleman.
- **Open Source**: Fully inspectable code for complete transparency.

---

## 🛠️ Getting Started

### Prerequisites
- Microsoft Word (Windows, Mac, or Web)
- [Node.js](https://nodejs.org/) 18+ (for development)
- Anthropic API Key ([Get it here](https://console.anthropic.com/settings/keys))

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/claude-word-addin.git
   cd claude-word-addin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup development certificates** (Required for HTTPS)
   ```bash
   npm run dev-certs
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

### Sideloading in Word
1. Open **Word** (Desktop or Online).
2. Go to **Home > Add-ins** (or **Insert > My Add-ins**).
3. Click **Upload My Add-in**.
4. Select the `manifest.xml` file from your project local folder.

---

## 📖 Usage Guide

1. Click the **Claude** button in the Word Ribbon.
2. In the Sidebar, click the **Settings** (gear) icon and enter your API Key.
3. Select your preferred model (e.g., **Claude 3.5 Sonnet**).
4. Type an instruction (e.g., "Draft a non-disclosure clause") or use a **Quick Action** chip.
5. Choose your insertion mode: **Replace selection**, **Insert after**, or **Insert at end**.

---

## 🏗️ Technical Stack
- **Office.js**: Integration with Word's core engine.
- **Anthropic Messages API**: Powering the AI with SSE streaming.
- **Vanilla JavaScript/CSS**: Lightweight, zero-dependency runtime.
- **Webpack**: Modern bundling and development environment.

## 🤝 Contributing
Contributions are welcome! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get involved.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
