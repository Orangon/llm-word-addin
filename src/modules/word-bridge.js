/**
 * Word Bridge - All Office.js Word API interactions
 */

/* global Word, Office */

const WORD_API_1_4 = "WordApi";

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildPlainTextOoxml(text) {
  const paragraphs = text.replace(/\r\n/g, "\n").split("\n");
  const bodyXml = paragraphs.map((paragraph) => {
    const runXml = paragraph
      ? `<w:r><w:rPr><w:b w:val="0"/><w:bCs w:val="0"/></w:rPr><w:t xml:space="preserve">${escapeXml(paragraph)}</w:t></w:r>`
      : "";

    return `
      <w:p>
        <w:pPr>
          <w:pStyle w:val="Normal"/>
          <w:jc w:val="left"/>
        </w:pPr>
        ${runXml}
      </w:p>`;
  }).join("");

  return `<?xml version="1.0" standalone="yes"?>
<pkg:package xmlns:pkg="http://schemas.microsoft.com/office/2006/xmlPackage">
  <pkg:part pkg:name="/_rels/.rels" pkg:contentType="application/vnd.openxmlformats-package.relationships+xml">
    <pkg:xmlData>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
      </Relationships>
    </pkg:xmlData>
  </pkg:part>
  <pkg:part pkg:name="/word/document.xml" pkg:contentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml">
    <pkg:xmlData>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          ${bodyXml}
          <w:sectPr>
            <w:pgSz w:w="12240" w:h="15840"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
          </w:sectPr>
        </w:body>
      </w:document>
    </pkg:xmlData>
  </pkg:part>
</pkg:package>`;
}

export class WordBridge {
  constructor() {
    this._trackChangesSupported = null;
  }

  get trackChangesSupported() {
    if (this._trackChangesSupported === null) {
      try {
        this._trackChangesSupported = Office.context.requirements.isSetSupported(WORD_API_1_4, "1.4");
      } catch {
        this._trackChangesSupported = false;
      }
    }
    return this._trackChangesSupported;
  }

  async getFullDocumentText() {
    return Word.run(async (context) => {
      // Load all paragraphs to preserve structure
      const paragraphs = context.document.body.paragraphs;
      paragraphs.load("text");
      await context.sync();

      // Join paragraphs with newline
      const texts = [];
      for (let i = 0; i < paragraphs.items.length; i++) {
        const text = paragraphs.items[i].text.trim();
        if (text.length > 0) {
          texts.push(text);
        }
      }

      return texts.join("\n");
    });
  }

  async getSelectedText() {
    return Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.load("text");
      await context.sync();
      return selection.text || "";
    });
  }

  async insertAtCursor(text) {
    return Word.run(async (context) => {
      const selection = context.document.getSelection();

      // Insert the text
      selection.insertText(text, Word.InsertLocation.end);
      await context.sync();
    });
  }

  async replaceSelection(text) {
    return Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.insertOoxml(buildPlainTextOoxml(text), Word.InsertLocation.replace);
      await context.sync();
    });
  }

  async insertParagraphAfterSelection(text) {
    return Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.insertParagraph(text, Word.InsertLocation.after);
      await context.sync();
    });
  }

  async enableTrackChanges(enabled) {
    if (!this.trackChangesSupported) return false;
    return Word.run(async (context) => {
      context.document.changeTrackingMode = enabled
        ? Word.ChangeTrackingMode.trackAll
        : Word.ChangeTrackingMode.off;
      await context.sync();
      return true;
    });
  }

  async insertWithTrackChanges(text, mode = "end") {
    if (!this.trackChangesSupported) {
      if (mode === "replace") {
        return this.replaceSelection(text);
      }
      return this.insertAtCursor(text);
    }

    return Word.run(async (context) => {
      // Save current tracking mode
      const doc = context.document;
      doc.load("changeTrackingMode");
      await context.sync();
      const previousMode = doc.changeTrackingMode;

      // Enable track changes
      doc.changeTrackingMode = Word.ChangeTrackingMode.trackAll;

      const selection = doc.getSelection();
      if (mode === "replace") {
        selection.insertOoxml(buildPlainTextOoxml(text), Word.InsertLocation.replace);
      } else {
        selection.insertText(text, Word.InsertLocation.end);
      }
      await context.sync();

      // Restore previous mode
      doc.changeTrackingMode = previousMode;
      await context.sync();
    });
  }

  async getParagraphs() {
    return Word.run(async (context) => {
      const paragraphs = context.document.body.paragraphs;
      paragraphs.load("text");
      await context.sync();
      return paragraphs.items.map((p, i) => ({ index: i, text: p.text }));
    });
  }

  async getDocumentMetadata() {
    return Word.run(async (context) => {
      const properties = context.document.properties;
      properties.load("title,author,subject,lastAuthor");
      await context.sync();
      return {
        title: properties.title || "",
        author: properties.author || "",
        subject: properties.subject || "",
        lastAuthor: properties.lastAuthor || "",
      };
    });
  }
}

export const wordBridge = new WordBridge();
