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
 * Retrieve top-K relevant career knowledge chunks for a user query.
 * Returns [] if the query has no meaningful career/knowledge overlap.
 */
function retrieveCareerContext(query, topK = 3) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const queryVec = computeTfIdfVector(queryTokens);
  if (queryVec.size === 0) return [];

  const scored = indexedDocs
    .map(({ doc, vector }) => {
      let score = cosineSimilarity(queryVec, vector);
      // Slight boost if query directly mentions a tag
      const tagBoost = doc.tags.some((tag) => queryTokens.includes(tag)) ? 0.15 : 0;
      return { doc, score: score + tagBoost };
    })
    .filter((item) => item.score > 0.08)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored.map((item) => ({
    id: item.doc.id,
    title: item.doc.title,
    category: item.doc.category,
    content: item.doc.content,
    score: Number(item.score.toFixed(3)),
  }));
}

/**
 * Format retrieved chunks into a concise prompt block for the avatar LLM.
 */
function formatRagContextForPrompt(chunks) {
  if (!chunks || chunks.length === 0) return "";
  const formatted = chunks
    .map((c, i) => `[Source ${i + 1}: ${c.title} (${c.category})]\n${c.content}`)
    .join("\n\n");
  return `\n\n[RETRIEVED CAREER KNOWLEDGE BASE (RAG)]:\nUse the following verified career & admission references when relevant to answer the student's question accurately:\n${formatted}`;
}

module.exports = {
  retrieveCareerContext,
  formatRagContextForPrompt,
};
