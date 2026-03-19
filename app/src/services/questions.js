import { generateVisualQuestions, generateTextQuestions, generateFactorQuestions } from './visualQuestions';

let questionsCache = null;

export async function loadQuestions() {
  if (questionsCache) return questionsCache;
  const res = await fetch('/data/questions/psicotecnicos.json');
  questionsCache = await res.json();
  return questionsCache;
}

// ============================================================
// Anti-repetition system: track recently used question IDs
// ============================================================
const RECENT_KEY = 'proyecto-barraco-recent';
const MAX_RECENT = 400; // Track last ~10 exams worth of questions

function getRecentIds() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveRecentIds(ids) {
  // Keep only the last MAX_RECENT entries
  const trimmed = ids.slice(-MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(trimmed));
}

function markUsed(questions) {
  const recent = getRecentIds();
  const newIds = questions.map(q => q.id).filter(Boolean);
  saveRecentIds([...recent, ...newIds]);
}

function filterRecent(questions) {
  const recentSet = new Set(getRecentIds());
  const fresh = questions.filter(q => !recentSet.has(q.id));
  // If filtering removes too many, fall back to full pool
  return fresh.length >= 20 ? fresh : questions;
}

// Unique seed that changes every exam
function examSeed() {
  return Date.now() ^ (Math.random() * 0xFFFFFF | 0);
}

// Ensure no duplicate questions within a single exam
function dedup(questions) {
  const seen = new Set();
  return questions.filter(q => {
    const key = q.question || q.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function pickRandom(questions, count = 40) {
  const visualCount = Math.min(12, Math.floor(count * 0.3));
  const textCount = count - visualCount;
  const seed = examSeed();

  // Filter out recently used JSON questions
  const fresh = filterRecent(questions);
  const shuffledText = [...fresh].sort(() => Math.random() - 0.5);
  const textQuestions = shuffledText.slice(0, Math.min(textCount, shuffledText.length));

  const visualQuestions = generateVisualQuestions(visualCount, seed);
  const generatedText = generateTextQuestions(4, seed);

  const combined = dedup([
    ...textQuestions.slice(0, textCount - generatedText.length),
    ...generatedText,
    ...visualQuestions,
  ]).sort(() => Math.random() - 0.5);

  markUsed(combined);
  return combined;
}

export function pickErrorBased(questions, failedIds, count = 40) {
  const failed = questions.filter((q) => failedIds.includes(q.id));
  const rest = filterRecent(questions.filter((q) => !failedIds.includes(q.id)));
  const shuffledFailed = [...failed].sort(() => Math.random() - 0.5);
  const shuffledRest = [...rest].sort(() => Math.random() - 0.5);
  const seed = examSeed();

  const selected = shuffledFailed.slice(0, count);
  if (selected.length < count) {
    const remaining = count - selected.length;
    const visualCount = Math.min(6, Math.floor(remaining * 0.2));
    const textFill = shuffledRest.slice(0, remaining - visualCount);
    const visualFill = generateVisualQuestions(visualCount, seed);
    selected.push(...textFill, ...visualFill);
  }
  const result = dedup(selected).sort(() => Math.random() - 0.5);
  markUsed(result);
  return result;
}

// Maps JSON categories → factors
const FACTOR_CATEGORIES = {
  'factor-verbal': ['sinonimos-antonimos', 'analogias-verbales', 'ortografia'],
  'factor-razonamiento': ['razonamiento-logico', 'series-letras'],
  'factor-numerico': ['aptitud-numerica', 'series-numericas'],
  'factor-espacial': ['atencion-percepcion'],
};

export function pickByFactor(questions, factor, count = 15) {
  const cats = FACTOR_CATEGORIES[factor] || [];
  const filtered = filterRecent(questions.filter((q) => cats.includes(q.category)));
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  const seed = examSeed();

  const generatedCount = Math.min(5, Math.floor(count * 0.33));
  const generated = generateFactorQuestions(factor, generatedCount, seed);

  const textCount = count - generated.length;
  const result = dedup([...shuffled.slice(0, textCount), ...generated]).sort(() => Math.random() - 0.5);
  markUsed(result);
  return result;
}

export function getCategories(questions) {
  const cats = new Set(questions.map((q) => q.category));
  return [...cats];
}

export function getQuestionsByCategory(questions, category) {
  return questions.filter((q) => q.category === category);
}

export const FACTOR_LABELS = {
  'factor-verbal': { name: 'Factor Verbal', questions: 15, time: 300, desc: 'Vocabulario, definiciones, frases' },
  'factor-razonamiento': { name: 'Factor de Razonamiento', questions: 15, time: 480, desc: 'Series visuales, silogismos, logica' },
  'factor-numerico': { name: 'Factor Numerico', questions: 15, time: 480, desc: 'Problemas, graficos, operaciones' },
  'factor-espacial': { name: 'Factor Espacial', questions: 15, time: 240, desc: 'Rotaciones, cubos, patrones visuales' },
};

export const FACTOR_ORDER = ['factor-verbal', 'factor-razonamiento', 'factor-numerico', 'factor-espacial'];
