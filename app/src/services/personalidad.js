const STORAGE_KEY = 'proyecto-barraco-personalidad';

let cachedQuestions = null;

export async function loadPersonalidad() {
  if (cachedQuestions) return cachedQuestions;
  const res = await fetch('/data/questions/personalidad.json');
  cachedQuestions = await res.json();
  return cachedQuestions;
}

export function pickPersonalidad(all, count) {
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  if (count >= shuffled.length) return shuffled;

  // Ensure at least 1 sinceridad question per 20 statements
  const sinceridad = shuffled.filter((q) => q.dimension === 'sinceridad');
  const rest = shuffled.filter((q) => q.dimension !== 'sinceridad');

  const sincCount = Math.max(1, Math.round(count * (sinceridad.length / all.length)));
  const picked = [
    ...sinceridad.slice(0, sincCount),
    ...rest.slice(0, count - sincCount),
  ];

  return picked.sort(() => Math.random() - 0.5);
}

export const DIMENSION_LABELS = {
  'estabilidad-emocional': 'Estabilidad emocional',
  'autocontrol': 'Autocontrol',
  'sociabilidad': 'Sociabilidad',
  'responsabilidad': 'Responsabilidad',
  'liderazgo': 'Liderazgo',
  'tolerancia-estres': 'Tolerancia al estres',
  'adaptabilidad': 'Adaptabilidad',
  'sinceridad': 'Sinceridad',
};

export const DIMENSION_ORDER = [
  'estabilidad-emocional',
  'autocontrol',
  'sociabilidad',
  'responsabilidad',
  'liderazgo',
  'tolerancia-estres',
  'adaptabilidad',
  'sinceridad',
];

export function scorePersonalidad(questions, answers) {
  const dims = {};

  // Init accumulators
  for (const dim of DIMENSION_ORDER) {
    dims[dim] = { sum: 0, max: 0, count: 0 };
  }

  questions.forEach((q, i) => {
    const ans = answers[i];
    if (ans === null || ans === undefined) return;

    const dim = q.dimension;
    if (!dims[dim]) dims[dim] = { sum: 0, max: 0, count: 0 };

    dims[dim].max += 2;
    dims[dim].count += 1;

    if (q.direction === 'positive') {
      dims[dim].sum += ans; // 0=desacuerdo, 1=indiferente, 2=acuerdo
    } else {
      dims[dim].sum += (2 - ans); // reverse scored
    }
  });

  const dimensions = {};
  for (const [dim, data] of Object.entries(dims)) {
    dimensions[dim] = data.max > 0
      ? Math.round((data.sum / data.max) * 10 * 100) / 100
      : 0;
  }

  return dimensions;
}

export function checkConsistency(questions, answers) {
  const flags = [];
  const checked = new Set();

  questions.forEach((q, i) => {
    if (!q.pair || checked.has(q.id)) return;

    const pairIdx = questions.findIndex((p) => p.id === q.pair);
    if (pairIdx === -1) return;

    checked.add(q.id);
    checked.add(q.pair);

    const a1 = answers[i];
    const a2 = answers[pairIdx];
    if (a1 === null || a2 === null) return;

    const pair = questions[pairIdx];

    // Normalize both to same direction for comparison
    const norm1 = q.direction === 'positive' ? a1 : (2 - a1);
    const norm2 = pair.direction === 'positive' ? a2 : (2 - a2);

    const diff = Math.abs(norm1 - norm2);
    if (diff >= 2) {
      flags.push({
        q1: q.statement,
        q2: pair.statement,
        q1Answer: a1,
        q2Answer: a2,
      });
    }
  });

  const totalPairs = checked.size / 2;
  const consistent = totalPairs > 0
    ? Math.round(((totalPairs - flags.length) / totalPairs) * 100)
    : 100;

  return { score: consistent, flags, totalPairs };
}

export function savePersonalidadAttempt(attempt) {
  const store = getStore();
  store.attempts.push(attempt);
  saveStore(store);
}

export function getPersonalidadAttempts() {
  return getStore().attempts;
}

export function clearPersonalidadAttempts() {
  saveStore({ attempts: [] });
}

function getStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { attempts: [] };
  } catch {
    return { attempts: [] };
  }
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
