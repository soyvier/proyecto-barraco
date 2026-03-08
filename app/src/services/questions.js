import { generateVisualQuestions, generateTextQuestions, generateFactorQuestions } from './visualQuestions';

let questionsCache = null;

export async function loadQuestions() {
  if (questionsCache) return questionsCache;
  const res = await fetch('/data/questions/psicotecnicos.json');
  questionsCache = await res.json();
  return questionsCache;
}

export function pickRandom(questions, count = 40) {
  const visualCount = Math.min(12, Math.floor(count * 0.3));
  const textCount = count - visualCount;

  const shuffledText = [...questions].sort(() => Math.random() - 0.5);
  const textQuestions = shuffledText.slice(0, Math.min(textCount, shuffledText.length));

  const visualQuestions = generateVisualQuestions(visualCount, Date.now());
  const generatedText = generateTextQuestions(4, Date.now());

  const combined = [...textQuestions.slice(0, textCount - generatedText.length), ...generatedText, ...visualQuestions];
  return combined.sort(() => Math.random() - 0.5);
}

export function pickErrorBased(questions, failedIds, count = 40) {
  const failed = questions.filter((q) => failedIds.includes(q.id));
  const rest = questions.filter((q) => !failedIds.includes(q.id));
  const shuffledFailed = [...failed].sort(() => Math.random() - 0.5);
  const shuffledRest = [...rest].sort(() => Math.random() - 0.5);

  const selected = shuffledFailed.slice(0, count);
  if (selected.length < count) {
    const remaining = count - selected.length;
    const visualCount = Math.min(6, Math.floor(remaining * 0.2));
    const textFill = shuffledRest.slice(0, remaining - visualCount);
    const visualFill = generateVisualQuestions(visualCount, Date.now());
    selected.push(...textFill, ...visualFill);
  }
  return selected.sort(() => Math.random() - 0.5);
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
  const filtered = questions.filter((q) => cats.includes(q.category));
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);

  const generatedCount = Math.min(5, Math.floor(count * 0.33));
  const generated = generateFactorQuestions(factor, generatedCount, Date.now());

  const textCount = count - generated.length;
  const combined = [...shuffled.slice(0, textCount), ...generated];
  return combined.sort(() => Math.random() - 0.5);
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
