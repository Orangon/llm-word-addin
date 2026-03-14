/**
 * Readability analysis module
 * Supports Gulpease (Italian) and Flesch-Kincaid (English)
 */

import { t, getLanguage } from "./i18n.js";

/**
 * Count syllables in an English word (approximation)
 */
function countSyllablesEN(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

/**
 * Count syllables in an Italian word (approximation)
 */
function countSyllablesIT(word) {
  word = word.toLowerCase().replace(/[^a-zaeiouàèéìòù]/g, "");
  if (word.length <= 2) return 1;

  const vowels = word.match(/[aeiouàèéìòù]/g);
  if (!vowels) return 1;

  // Italian diphthongs that count as one syllable
  let syllables = vowels.length;
  const diphthongs = /[aeiouàèéìòù]{2}/g;
  const dMatches = word.match(diphthongs);
  if (dMatches) syllables -= Math.floor(dMatches.length * 0.5);

  return Math.max(1, syllables);
}

/**
 * Split text into sentences
 */
function splitSentences(text) {
  // Split on sentence-ending punctuation followed by space or end
  const sentences = text
    .replace(/([.!?;])\s+/g, "$1\n")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
  return sentences.length > 0 ? sentences : [text];
}

/**
 * Split text into words
 */
function splitWords(text) {
  return text
    .replace(/[^\w\sàèéìòùäöüß'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

/**
 * Compute Gulpease Index (Italian readability)
 * Formula: 89 + (300 * sentences - 10 * letters) / words
 * Scale: 0-100 (higher = easier)
 */
function computeGulpease(text) {
  const words = splitWords(text);
  const sentences = splitSentences(text);
  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const letterCount = words.join("").length;

  if (wordCount === 0) return { score: 0, level: t("gulpVeryHard") };

  const score = Math.round(89 + (300 * sentenceCount - 10 * letterCount) / wordCount);
  const clamped = Math.max(0, Math.min(100, score));

  let level;
  if (clamped >= 80) level = t("gulpEasy");
  else if (clamped >= 60) level = t("gulpMedium");
  else if (clamped >= 40) level = t("gulpHard");
  else level = t("gulpVeryHard");

  return { score: clamped, level };
}

/**
 * Compute Flesch-Kincaid Reading Ease (English readability)
 * Formula: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
 * Scale: 0-100 (higher = easier)
 */
function computeFleschKincaid(text) {
  const words = splitWords(text);
  const sentences = splitSentences(text);
  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const totalSyllables = words.reduce((sum, w) => sum + countSyllablesEN(w), 0);

  if (wordCount === 0 || sentenceCount === 0) return { score: 0, level: t("fleschVeryDifficult") };

  const score = Math.round(
    206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (totalSyllables / wordCount)
  );
  const clamped = Math.max(0, Math.min(100, score));

  let level;
  if (clamped >= 90) level = t("fleschVeryEasy");
  else if (clamped >= 80) level = t("fleschEasy");
  else if (clamped >= 70) level = t("fleschFairlyEasy");
  else if (clamped >= 60) level = t("fleschStandard");
  else if (clamped >= 50) level = t("fleschFairlyDifficult");
  else if (clamped >= 30) level = t("fleschDifficult");
  else level = t("fleschVeryDifficult");

  return { score: clamped, level };
}

/**
 * Detect language of text (simple heuristic)
 */
function detectLanguage(text) {
  const italianWords = /\b(il|lo|la|le|gli|dei|del|della|delle|che|non|per|una|con|sono|questo|quella|anche|come|piu'|più|essere|avere|fare)\b/gi;
  const englishWords = /\b(the|is|are|was|were|have|has|had|been|this|that|with|from|they|their|would|could|should|about|which)\b/gi;

  const itMatches = (text.match(italianWords) || []).length;
  const enMatches = (text.match(englishWords) || []).length;

  return itMatches > enMatches ? "it" : "en";
}

/**
 * Generate comprehensibility comments
 */
function getComprehensibilityComments(avgSentenceLen, avgWordLen, sentenceLens) {
  const comments = [];

  // Sentence length
  if (avgSentenceLen <= 15) comments.push({ type: "good", text: t("shortSentences") });
  else if (avgSentenceLen <= 25) comments.push({ type: "ok", text: t("mediumSentences") });
  else comments.push({ type: "warning", text: t("longSentences") });

  // Word length
  if (avgWordLen <= 5) comments.push({ type: "good", text: t("simpleWords") });
  else if (avgWordLen <= 7) comments.push({ type: "ok", text: t("complexWords") });
  else comments.push({ type: "warning", text: t("veryComplexWords") });

  // Sentence variety (standard deviation of sentence lengths)
  if (sentenceLens.length > 2) {
    const mean = sentenceLens.reduce((a, b) => a + b, 0) / sentenceLens.length;
    const variance = sentenceLens.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / sentenceLens.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev > 5) comments.push({ type: "good", text: t("goodVariety") });
    else comments.push({ type: "ok", text: t("lowVariety") });
  }

  return comments;
}

/**
 * Full text analysis
 */
export function analyzeText(text) {
  if (!text || !text.trim()) return null;

  const words = splitWords(text);
  const sentences = splitSentences(text);
  // Word returns \r, \r\n, or \n for each paragraph break
  // Count each line as a paragraph (single newline = new paragraph in Word)
  const paragraphs = text.split(/\r?\n/).filter((p) => p.trim().length > 0);

  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const paragraphCount = paragraphs.length;
  const charCount = text.length;
  const charNoSpaces = text.replace(/\s/g, "").length;

  const avgSentenceLen = wordCount > 0 && sentenceCount > 0
    ? Math.round((wordCount / sentenceCount) * 10) / 10
    : 0;
  const avgWordLen = wordCount > 0
    ? Math.round((charNoSpaces / wordCount) * 10) / 10
    : 0;

  // Sentence length distribution for chart
  const sentenceLens = sentences.map((s) => splitWords(s).length);

  // Reading time (200 words/min average)
  const readingTimeSeconds = Math.round((wordCount / 200) * 60);
  const readingTimeMin = Math.floor(readingTimeSeconds / 60);
  const readingTimeSec = readingTimeSeconds % 60;

  // Detect language and compute appropriate index
  const textLang = detectLanguage(text);
  const gulpease = computeGulpease(text);
  const fleschKincaid = computeFleschKincaid(text);

  // Comprehensibility
  const comments = getComprehensibilityComments(avgSentenceLen, avgWordLen, sentenceLens);

  return {
    wordCount,
    sentenceCount,
    paragraphCount,
    charCount,
    charNoSpaces,
    avgSentenceLen,
    avgWordLen,
    readingTimeMin,
    readingTimeSec,
    textLang,
    gulpease,
    fleschKincaid,
    comments,
    sentenceLens,
  };
}

/**
 * Get color for readability score (0-100)
 */
export function getScoreColor(score) {
  if (score >= 70) return "#2E7D32"; // green
  if (score >= 40) return "#E6A817"; // amber
  return "#C62828"; // red
}

/**
 * Get bar width percentage for a score (0-100)
 */
export function getBarWidth(score) {
  return Math.max(2, Math.min(100, score));
}
