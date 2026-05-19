/**
 * Internationalization module - Italian & English
 */

const translations = {
  it: {
    // Header
    headerTitle: "Claude",
    settings: "Impostazioni",
    menu: "Menu",
    send: "Invia",
    showHide: "Mostra/Nascondi",
    trackChangesTitle: "Revisioni",
    newConversation: "Nuova conversazione",
    conversationCleared: "Conversazione cancellata",

    // Settings
    settingsTitle: "Impostazioni",
    apiKeyLabel: "API Key Anthropic",
    apiKeyPlaceholder: "sk-ant-...",
    apiKeyHint: "Ottieni la tua key da",
    apiKeySecurityNote: "La API key viene salvata localmente su questo dispositivo finche' non la cambi o la cancelli.",
    baseUrlLabel: "URL base API",
    baseUrlHint: "Endpoint API personalizzato. Lascia vuoto per l'API Anthropic predefinita.",
    modelLabel: "Modello",
    modelRecommended: "consigliato",
    modelCapable: "piu' capace",
    modelEconomic: "economico",
    systemPromptLabel: "Istruzioni di Sistema",
    systemPromptPlaceholder: "Es: Rispondi sempre in italiano. Usa un tono formale e professionale.",
    languageLabel: "Lingua interfaccia",
    save: "Salva",
    testConnection: "Testa Connessione",
    savedOk: "Impostazioni salvate.",
    insertApiKey: "Inserisci una API key.",
    testingConnection: "Test connessione in corso...",
    connectionOk: "Connessione riuscita! Risposta:",
    back: "Indietro",

    // Main view
    emptyTitle: "Claude scrive direttamente nel documento",
    emptySubtitle: "Seleziona del testo o scrivi un'istruzione",
    chipRewrite: "Riscrivi",
    chipSummarize: "Riassumi",
    chipTranslateEN: "Traduci EN",
    chipFormal: "Tono formale",
    chipContract: "Revisione contratto",
    chipNormative: "Rif. normativi",
    chipAnalyze: "Analisi testo",

    // Input area
    selection: "Selezione",
    document: "Documento",
    trackChanges: "Revisioni",
    inputPlaceholder: "Istruzione per Claude...",
    replaceSelection: "Sostituisci selezione",
    insertAfter: "Inserisci dopo",
    insertEnd: "Inserisci alla fine",
    chatOnly: "Solo chat",

    // Status
    processing: "Claude sta elaborando...",
    writing: "Claude sta scrivendo...",
    insertedOk: "Testo inserito nel documento.",
    chatRedirect: "Risposta mostrata nella chat (non inseribile nel documento).",
    selectTextFirst: "Seleziona del testo nel documento prima di usare questa azione.",
    configureApiKey: "Configura la tua API key nelle impostazioni.",
    replaced: "Sostituito",
    inserted: "Inserito",

    // Readability
    readabilityTitle: "Analisi del Testo",
    readabilitySubtitle: "Metriche di leggibilita' e comprensibilita'",
    noTextSelected: "Seleziona del testo nel documento o scegli 'Documento' per analizzare l'intero contenuto.",
    words: "Parole",
    sentences: "Frasi",
    paragraphs: "Paragrafi",
    characters: "Caratteri",
    avgSentenceLen: "Lunghezza media frase",
    avgWordLen: "Lunghezza media parola",
    readingTime: "Tempo di lettura",
    minutes: "min",
    seconds: "sec",
    readabilityIndex: "Indice di Leggibilita'",
    gulpease: "Indice Gulpease",
    gulpeaseDesc: "L'indice Gulpease misura la leggibilita' dei testi italiani su una scala da 0 a 100.",
    fleschKincaid: "Flesch-Kincaid Reading Ease",
    fleschKincaidDesc: "The Flesch-Kincaid index measures English text readability on a 0-100 scale.",
    readabilityVerdict: "Giudizio",
    textMetrics: "Metriche del testo",
    comprehensibility: "Comprensibilita'",
    backToMain: "Torna alla vista principale",

    // Gulpease levels
    gulpEasy: "Molto facile - comprensibile da chi ha la licenza elementare",
    gulpMedium: "Facile - comprensibile da chi ha la licenza media",
    gulpHard: "Difficile - comprensibile da chi ha un diploma superiore",
    gulpVeryHard: "Molto difficile - comprensibile solo da laureati",

    // Flesch levels
    fleschVeryEasy: "Very easy - understood by 5th graders",
    fleschEasy: "Easy - conversational English",
    fleschFairlyEasy: "Fairly easy - understood by most adults",
    fleschStandard: "Standard - understood by 13-15 year olds",
    fleschFairlyDifficult: "Fairly difficult - some college level",
    fleschDifficult: "Difficult - college graduate level",
    fleschVeryDifficult: "Very difficult - professional/academic",

    // Comprehensibility comments
    shortSentences: "Le frasi sono brevi e facili da seguire.",
    mediumSentences: "La lunghezza delle frasi e' nella media.",
    longSentences: "Le frasi sono lunghe e complesse. Considera di spezzarle.",
    simpleWords: "Il vocabolario e' semplice e accessibile.",
    complexWords: "Il vocabolario e' moderatamente complesso.",
    veryComplexWords: "Il vocabolario e' molto complesso. Considera di semplificarlo.",
    goodVariety: "Buona varieta' nella struttura delle frasi.",
    lowVariety: "Poca varieta' nella struttura delle frasi.",

    // Chart labels
    chartReadability: "Leggibilita'",
    chartSentenceLen: "Lungh. frasi",
    chartWordLen: "Lungh. parole",

    // Chat message actions
    insertAtCursor: "Inserisci al cursore",
    replaceSelectionAction: "Sostituisci selezione",
    copy: "Copia",

    // Custom models
    customModelsTitle: "Modelli personalizzati",
    customModelNameLabel: "Nome visualizzato",
    customModelNamePlaceholder: "Es: Il mio modello",
    customModelIdLabel: "ID modello",
    customModelIdPlaceholder: "Es: my-custom-model-v1",
    addCustomModel: "Aggiungi modello",
    noCustomModels: "Nessun modello personalizzato aggiunto.",
    remove: "Rimuovi",
    customModelAdded: "Modello personalizzato aggiunto.",
    customModelFieldsRequired: "Inserisci sia il nome che l'ID del modello.",
    customModelIdExists: "Esiste gia' un modello con questo ID.",

    // Quick actions prompt labels
    quickRewritePrompt: "Riscrivi questo testo in modo piu' chiaro, professionale e fluido:",
    quickSummarizePrompt: "Riassumi questo testo in modo conciso:",
    quickTranslatePrompt: "Traduci in inglese:",
    quickFormalPrompt: "Riscrivi con tono formale e professionale, adatto alla corrispondenza legale:",
    quickLabelRewriting: "Riscrittura",
    quickLabelSummary: "Riassunto",
    quickLabelTranslationEn: "Traduzione EN",
    quickLabelFormalTone: "Tono formale",
    quickLabelContractReview: "Revisione Contratto",
    quickLabelLegalReferences: "Riferimenti Normativi",

    // Generic/system
    contextDocumentLabel: "Contesto del documento",
    requestLabel: "Richiesta",
    userAvatar: "Tu",
    customModelsSeparator: "--- Modelli personalizzati ---",
    errorPrefix: "Errore:",
    errorUnknown: "Errore sconosciuto. Riprova.",
    errorInvalidApiKey: "API key non valida. Controlla le impostazioni.",
    errorRateLimit: "Limite di richieste raggiunto. Riprova tra qualche secondo.",
    errorOverloaded: "Claude e' momentaneamente sovraccarico. Riprova tra poco.",
    errorNetwork: "Errore di rete. Controlla la connessione internet.",
    errorContextTooLarge: "Il documento e' troppo lungo. Prova a selezionare solo una parte del testo.",
    errorConnectionFailed: "Impossibile connettersi al server Anthropic.",
    errorStreaming: "Errore streaming",
    errorHttp: "Errore HTTP",
    errorNotConfigured: "API Key non configurata",
    errorSelectTextFirst: "Seleziona prima del testo nel documento.",
    errorBaseUrlProtocol: "La Base URL deve iniziare con http:// o https://.",
    errorInvalidBaseUrl: "Base URL non valida.",
    truncationNotice: "[... testo troncato per limiti di contesto ...]",
  },

  en: {
    // Header
    headerTitle: "Claude",
    settings: "Settings",
    menu: "Menu",
    send: "Send",
    showHide: "Show/Hide",
    trackChangesTitle: "Track Changes",
    newConversation: "New conversation",
    conversationCleared: "Conversation cleared",

    // Settings
    settingsTitle: "Settings",
    apiKeyLabel: "Anthropic API Key",
    apiKeyPlaceholder: "sk-ant-...",
    apiKeyHint: "Get your key from",
    apiKeySecurityNote: "Your API key is stored locally on this device until you change or clear it.",
    baseUrlLabel: "API Base URL",
    baseUrlHint: "Custom API endpoint URL. Leave empty for the default Anthropic API.",
    modelLabel: "Model",
    modelRecommended: "recommended",
    modelCapable: "most capable",
    modelEconomic: "economical",
    systemPromptLabel: "System Instructions",
    systemPromptPlaceholder: "E.g.: Always reply in English. Use a formal and professional tone.",
    languageLabel: "Interface language",
    save: "Save",
    testConnection: "Test Connection",
    savedOk: "Settings saved.",
    insertApiKey: "Enter an API key.",
    testingConnection: "Testing connection...",
    connectionOk: "Connection successful! Response:",
    back: "Back",

    // Main view
    emptyTitle: "Claude writes directly into your document",
    emptySubtitle: "Select text or type an instruction",
    chipRewrite: "Rewrite",
    chipSummarize: "Summarize",
    chipTranslateEN: "Translate EN",
    chipFormal: "Formal tone",
    chipContract: "Contract review",
    chipNormative: "Legal refs",
    chipAnalyze: "Text analysis",

    // Input area
    selection: "Selection",
    document: "Document",
    trackChanges: "Track Changes",
    inputPlaceholder: "Instruction for Claude...",
    replaceSelection: "Replace selection",
    insertAfter: "Insert after",
    insertEnd: "Insert at end",
    chatOnly: "Chat only",

    // Status
    processing: "Claude is processing...",
    writing: "Claude is writing...",
    insertedOk: "Text inserted into document.",
    chatRedirect: "Response shown in chat (cannot be inserted into document).",
    selectTextFirst: "Select text in the document before using this action.",
    configureApiKey: "Configure your API key in settings.",
    replaced: "Replaced",
    inserted: "Inserted",

    // Readability
    readabilityTitle: "Text Analysis",
    readabilitySubtitle: "Readability and comprehensibility metrics",
    noTextSelected: "Select text in the document or choose 'Document' to analyze the full content.",
    words: "Words",
    sentences: "Sentences",
    paragraphs: "Paragraphs",
    characters: "Characters",
    avgSentenceLen: "Average sentence length",
    avgWordLen: "Average word length",
    readingTime: "Reading time",
    minutes: "min",
    seconds: "sec",
    readabilityIndex: "Readability Index",
    gulpease: "Gulpease Index",
    gulpeaseDesc: "The Gulpease index measures Italian text readability on a 0-100 scale.",
    fleschKincaid: "Flesch-Kincaid Reading Ease",
    fleschKincaidDesc: "The Flesch-Kincaid index measures English text readability on a 0-100 scale.",
    readabilityVerdict: "Verdict",
    textMetrics: "Text metrics",
    comprehensibility: "Comprehensibility",
    backToMain: "Back to main view",

    // Gulpease levels
    gulpEasy: "Very easy - readable by elementary school students",
    gulpMedium: "Easy - readable by middle school students",
    gulpHard: "Difficult - readable by high school graduates",
    gulpVeryHard: "Very difficult - readable only by college graduates",

    // Flesch levels
    fleschVeryEasy: "Very easy - understood by 5th graders",
    fleschEasy: "Easy - conversational English",
    fleschFairlyEasy: "Fairly easy - understood by most adults",
    fleschStandard: "Standard - understood by 13-15 year olds",
    fleschFairlyDifficult: "Fairly difficult - some college level",
    fleschDifficult: "Difficult - college graduate level",
    fleschVeryDifficult: "Very difficult - professional/academic",

    // Comprehensibility comments
    shortSentences: "Sentences are short and easy to follow.",
    mediumSentences: "Sentence length is average.",
    longSentences: "Sentences are long and complex. Consider breaking them up.",
    simpleWords: "Vocabulary is simple and accessible.",
    complexWords: "Vocabulary is moderately complex.",
    veryComplexWords: "Vocabulary is very complex. Consider simplifying.",
    goodVariety: "Good variety in sentence structure.",
    lowVariety: "Low variety in sentence structure.",

    // Chart labels
    chartReadability: "Readability",
    chartSentenceLen: "Sentence len.",
    chartWordLen: "Word len.",

    // Chat message actions
    insertAtCursor: "Insert at cursor",
    replaceSelectionAction: "Replace selection",
    copy: "Copy",

    // Custom models
    customModelsTitle: "Custom Models",
    customModelNameLabel: "Display name",
    customModelNamePlaceholder: "e.g. My Custom Model",
    customModelIdLabel: "Model ID",
    customModelIdPlaceholder: "e.g. my-custom-model-v1",
    addCustomModel: "Add model",
    noCustomModels: "No custom models added yet.",
    remove: "Remove",
    customModelAdded: "Custom model added.",
    customModelFieldsRequired: "Enter both a display name and a model ID.",
    customModelIdExists: "A model with this ID already exists.",

    // Quick actions prompt labels
    quickRewritePrompt: "Rewrite this text to be clearer, more professional and fluent:",
    quickSummarizePrompt: "Summarize this text concisely:",
    quickTranslatePrompt: "Translate to English:",
    quickFormalPrompt: "Rewrite in a formal and professional tone, suitable for legal correspondence:",
    quickLabelRewriting: "Rewriting",
    quickLabelSummary: "Summary",
    quickLabelTranslationEn: "Translation EN",
    quickLabelFormalTone: "Formal tone",
    quickLabelContractReview: "Contract Review",
    quickLabelLegalReferences: "Legal References",

    // Generic/system
    contextDocumentLabel: "Document context",
    requestLabel: "Request",
    userAvatar: "You",
    customModelsSeparator: "--- Custom Models ---",
    errorPrefix: "Error:",
    errorUnknown: "Unknown error. Please try again.",
    errorInvalidApiKey: "Invalid API key. Check your settings.",
    errorRateLimit: "Rate limit reached. Please try again in a few seconds.",
    errorOverloaded: "Claude is temporarily overloaded. Please try again shortly.",
    errorNetwork: "Network error. Check your internet connection.",
    errorContextTooLarge: "The document is too long. Try selecting only part of the text.",
    errorConnectionFailed: "Unable to connect to the Anthropic server.",
    errorStreaming: "Streaming error",
    errorHttp: "HTTP error",
    errorNotConfigured: "API key not configured",
    errorSelectTextFirst: "Please select text in the document first.",
    errorBaseUrlProtocol: "Base URL must start with http:// or https://.",
    errorInvalidBaseUrl: "Invalid Base URL.",
    truncationNotice: "[... text truncated due to context limits ...]",
  },
};

let currentLang = "en";

export function setLanguage(lang) {
  currentLang = lang;
}

export function getLanguage() {
  return currentLang;
}

export function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) || translations.it[key] || key;
}
