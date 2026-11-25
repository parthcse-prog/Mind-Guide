const careerKnowledgeBase = require("../data/careerKnowledgeBase");

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "can", "to", "of", "in", "for", "on", "with",
  "at", "by", "from", "as", "into", "through", "during", "before", "after",
  "and", "but", "or", "if", "because", "what", "which", "who", "whom",
  "this", "that", "these", "those", "i", "me", "my", "you", "your", "we",
]);

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

// Build inverted document frequency (IDF) index once at startup
const docTokens = careerKnowledgeBase.map((doc) => {
  const combined = `${doc.title} ${doc.category} ${doc.tags.join(" ")} ${doc.content}`;
  return tokenize(combined);
});

const docFreq = new Map();
docTokens.forEach((tokens) => {
  const unique = new Set(tokens);
  unique.forEach((t) => docFreq.set(t, (docFreq.get(t) || 0) + 1));
});

const TOTAL_DOCS = careerKnowledgeBase.length;

function computeTfIdfVector(tokens) {
  const tf = new Map();
  tokens.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));

  const vec = new Map();
  let normSq = 0;
  tf.forEach((count, term) => {
    const df = docFreq.get(term) || 0;
    if (df === 0) return;
    const idf = Math.log((TOTAL_DOCS + 1) / (df + 1)) + 1;
    const weight = (1 + Math.log(count)) * idf;
    vec.set(term, weight);
    normSq += weight * weight;
  });

  const norm = Math.sqrt(normSq) || 1;
  vec.forEach((w, term) => vec.set(term, w / norm));
  return vec;
}

const indexedDocs = careerKnowledgeBase.map((doc, idx) => ({
  doc,
  vector: computeTfIdfVector(docTokens[idx]),
}));

function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  vecA.forEach((weight, term) => {
    if (vecB.has(term)) {
      dot += weight * vecB.get(term);
    }
  });
  return dot;
}

/**
 * Lightweight tree/feature-based career fit scorer (0 to 1) inspired by GBDT/XGBoost
 * tabular scoring, using structured student profile + career/college metadata.
 */
function computeCareerFitScore(doc, academicRecords) {
  if (!academicRecords) return 0.5;

  const twelfthPct = parseFloat(academicRecords?.twelfth?.percentage) || 60;
  const stream = String(academicRecords?.twelfth?.stream || "").toLowerCase();
  const subjects = Array.isArray(academicRecords?.twelfth?.subjects)
    ? academicRecords.twelfth.subjects
    : [];

  const getSubjScore = (keyword) => {
    const found = subjects.find((s) =>
      String(s?.name || "").toLowerCase().includes(keyword)
    );
    return found ? Number(found.marks) || 0 : 0;
  };

  const shorthandScore = getSubjScore("shorthand");
  const englishScore = getSubjScore("english");
  const accountancyScore = getSubjScore("accountancy");

  let score = 0.5;

  // Stream alignment
  if (stream.includes("commerce") && doc.tags.some((t) => ["commerce", "bcom", "ca", "cs", "cma", "accounting", "tally"].includes(t))) {
    score += 0.18;
  }

  // Shorthand strength boost (e.g., SSC Stenographer)
  if (shorthandScore >= 70 && doc.tags.includes("shorthand")) {
    score += 0.25;
  }

  // English & Communication boost (Law, CS, Management, SSC)
  if (englishScore >= 70 && doc.tags.some((t) => ["cs", "law", "bba", "ssc", "shorthand"].includes(t))) {
    score += 0.1;
  }

  // Accountancy boost
  if (accountancyScore >= 60 && doc.tags.some((t) => ["ca", "cma", "accounting", "tally", "bcom"].includes(t))) {
    score += 0.1;
  }

  // J&K Domicile / Jammu boost
  const address = String(academicRecords?.aadhaar?.address || "").toLowerCase();
  if ((address.includes("jammu") || address.includes("j&k")) && doc.tags.some((t) => ["jammu", "jk", "jkbose", "pmsss"].includes(t))) {
    score += 0.12;
  }

  // Cutoff realism check
  if (twelfthPct >= 55 && twelfthPct < 75 && doc.tags.some((t) => ["cuet", "jammu", "ssc", "shorthand", "cs", "tally"].includes(t))) {
    score += 0.08;
  }

  return Math.min(1, Math.max(0, score));
}

/**
 * Retrieve top-K relevant career knowledge chunks for a user query,
 * re-ranked by combining semantic TF-IDF similarity with profile fit score.
 */
function retrieveCareerContext(query, topK = 3, academicRecords = null) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const queryVec = computeTfIdfVector(queryTokens);
  if (queryVec.size === 0) return [];

  const scored = indexedDocs
    .map(({ doc, vector }) => {
      const simScore = cosineSimilarity(queryVec, vector);
      const tagBoost = doc.tags.some((tag) => queryTokens.includes(tag)) ? 0.15 : 0;
      const semantic = simScore + tagBoost;
      const fit = computeCareerFitScore(doc, academicRecords);
      const combined = academicRecords ? 0.65 * semantic + 0.35 * fit : semantic;
      return { doc, semantic, fit, score: combined };
    })
    .filter((item) => item.semantic > 0.08)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored.map((item) => ({
    id: item.doc.id,
    title: item.doc.title,
    category: item.doc.category,
    content: item.doc.content,
    fitPercent: Math.round(item.fit * 100),
    score: Number(item.score.toFixed(3)),
  }));
}

/**
 * Format retrieved chunks into a concise prompt block for the avatar LLM.
 */
function formatRagContextForPrompt(chunks) {
  if (!chunks || chunks.length === 0) return "";
  const formatted = chunks
    .map((c, i) => `[Source ${i + 1}: ${c.title} (${c.category}) | Profile Fit: ${c.fitPercent}%]\n${c.content}`)
    .join("\n\n");
  return `\n\n[RETRIEVED CAREER KNOWLEDGE BASE (RAG + Fit-Ranked)]:\nUse the following verified career & admission references (ranked by relevance and student profile fit) when answering:\n${formatted}`;
}

module.exports = {
  retrieveCareerContext,
  formatRagContextForPrompt,
};
