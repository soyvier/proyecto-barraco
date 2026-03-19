import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  loadPersonalidad,
  pickPersonalidad,
  scorePersonalidad,
  checkConsistency,
  savePersonalidadAttempt,
  DIMENSION_LABELS,
  DIMENSION_ORDER,
} from '../services/personalidad';
import Starfield from '../components/Starfield';

const RESPONSE_LABELS = ['En desacuerdo', 'Indiferente', 'De acuerdo'];

export default function PersonalidadExam() {
  const navigate = useNavigate();
  const { mode } = useParams();
  const count = mode === 'completo' ? 100 : 40;

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Elapsed timer (counts up)
  useEffect(() => {
    if (finished || loading) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [finished, loading, startTime]);

  useEffect(() => {
    (async () => {
      try {
        const all = await loadPersonalidad();
        const selected = pickPersonalidad(all, count);
        setQuestions(selected);
        setAnswers(new Array(selected.length).fill(null));
        setLoading(false);
      } catch (err) {
        console.error('Error loading personalidad:', err);
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const finishTest = useCallback(() => {
    const dimensions = scorePersonalidad(questions, answers);
    const consistency = checkConsistency(questions, answers);
    const blanks = answers.filter((a) => a === null).length;
    const duration = Math.round((Date.now() - startTime) / 1000);

    const sincScore = dimensions['sinceridad'] || 0;

    const attempt = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: mode,
      questions,
      answers: [...answers],
      dimensions,
      consistency,
      sinceridad: { score: sincScore, warning: sincScore > 9 },
      blanks,
      duration,
    };

    savePersonalidadAttempt(attempt);
    setResult(attempt);
    setFinished(true);
  }, [questions, answers, startTime, mode]);

  const selectAnswer = (value) => {
    const newAnswers = [...answers];
    const wasSelected = newAnswers[currentIndex] === value;
    newAnswers[currentIndex] = wasSelected ? null : value;
    setAnswers(newAnswers);

    if (!wasSelected && currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
    }
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Starfield />
        <p className="text-bone/30 text-xs tracking-[0.2em] uppercase z-10">
          Preparando test...
        </p>
      </div>
    );
  }

  if (finished && result) {
    return <PersonalidadResults result={result} navigate={navigate} />;
  }

  const q = questions[currentIndex];

  return (
    <div className="min-h-screen relative">
      <Starfield />

      {/* Elapsed time */}
      <div className="fixed top-6 right-8 z-50 font-mono text-sm tracking-wider text-bone/25">
        {formatTime(elapsed)}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => {
              if (confirm('Salir del test? Se perdera el progreso.'))
                navigate('/personalidad');
            }}
            className="text-bone/20 hover:text-bone/50 transition bg-transparent border-0 cursor-pointer text-lg"
          >
            &larr;
          </button>
          <span className="text-bone/25 text-[10px] tracking-[0.2em] uppercase">
            TEST DE PERSONALIDAD
          </span>
          <span className="text-bone/25 text-[10px] tracking-[0.2em]">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>

        {/* Progress */}
        <div className="w-full h-[1px] bg-bone/5 mb-10">
          <div
            className="progress-bar h-[1px] bg-bone/20"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Statement */}
        <div className="mb-14 min-h-[80px] flex items-center">
          <p className="text-bone/80 text-lg font-light leading-relaxed">
            <span className="text-bone/30 font-mono text-sm mr-3">
              {currentIndex + 1}.
            </span>
            {q.statement}
          </p>
        </div>

        {/* Likert scale */}
        <div className="flex justify-center gap-3 mb-14">
          {RESPONSE_LABELS.map((label, value) => {
            const isSelected = answers[currentIndex] === value;
            return (
              <button
                key={value}
                onClick={() => selectAnswer(value)}
                className={`likert-option ${isSelected ? 'selected' : ''} px-6 py-4 rounded-lg cursor-pointer text-sm font-light tracking-wider`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="text-bone/20 hover:text-bone/50 disabled:opacity-10 disabled:cursor-not-allowed transition bg-transparent border-0 cursor-pointer text-sm tracking-wider"
          >
            &larr; ANTERIOR
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={finishTest}
              className="text-accent/70 hover:text-accent transition bg-transparent border-0 cursor-pointer text-sm tracking-wider"
            >
              FINALIZAR &rarr;
            </button>
          ) : (
            <button
              onClick={goNext}
              className="text-bone/20 hover:text-bone/50 transition bg-transparent border-0 cursor-pointer text-sm tracking-wider"
            >
              SIGUIENTE &rarr;
            </button>
          )}
        </div>

        {/* Question grid */}
        <div className="mt-16 pt-8 border-t border-bone/5">
          <div className="flex flex-wrap gap-[6px] justify-center">
            {questions.map((_, i) => {
              const isAnswered = answers[i] !== null;
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-7 h-7 rounded text-[9px] font-mono border-0 cursor-pointer transition ${
                    isCurrent
                      ? 'bg-bone/15 text-bone/80'
                      : isAnswered
                        ? 'bg-accent/10 text-accent/50'
                        : 'bg-bone/3 text-bone/15 hover:bg-bone/8'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonalidadResults({ result, navigate }) {
  const [showFlags, setShowFlags] = useState(false);

  const dimColor = (score) =>
    score >= 7 ? 'text-success' : score >= 5 ? 'text-warning' : 'text-danger';

  const barColor = (score) =>
    score >= 7
      ? 'bg-success/60'
      : score >= 5
        ? 'bg-warning/60'
        : 'bg-danger/60';

  return (
    <div className="min-h-screen relative">
      <Starfield />
      <div className="relative z-10 max-w-2xl mx-auto px-8 py-16">
        <h1 className="text-center text-bone/60 text-xs tracking-[0.3em] font-light uppercase mb-4 anim-fade-down">
          PERFIL DE PERSONALIDAD
        </h1>
        <p className="text-center text-bone/15 text-[10px] tracking-wider mb-12">
          {result.type === 'completo' ? 'Test completo' : 'Test rapido'} &middot;{' '}
          {Math.floor(result.duration / 60)}m {result.duration % 60}s
          {result.blanks > 0 && ` \u00b7 ${result.blanks} sin responder`}
        </p>

        {/* Sinceridad warning */}
        {result.sinceridad.warning && (
          <div className="mb-8 px-6 py-4 rounded-lg border border-warning/30 bg-warning/5 anim-fade-up">
            <p className="text-warning/80 text-xs font-light tracking-wider">
              ATENCION: Tu escala de sinceridad es muy alta ({result.sinceridad.score.toFixed(1)}/10).
              Esto puede indicar deseabilidad social. En un examen real,
              respuestas demasiado perfectas pueden invalidar el test.
            </p>
          </div>
        )}

        {/* Dimension bars */}
        <div className="space-y-4 mb-12 anim-fade-up anim-delay-1">
          {DIMENSION_ORDER.map((dim) => {
            const score = result.dimensions[dim] || 0;
            const isSinceridad = dim === 'sinceridad';
            return (
              <div key={dim}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-bone/50 text-[11px] tracking-wider font-light">
                    {DIMENSION_LABELS[dim]}
                    {isSinceridad && ' (control)'}
                  </span>
                  <span className={`text-sm font-light ${dimColor(score)}`}>
                    {score.toFixed(1)}
                  </span>
                </div>
                <div className="w-full h-[3px] bg-bone/5 rounded-full">
                  <div
                    className={`h-[3px] rounded-full transition-all duration-700 ${barColor(score)}`}
                    style={{ width: `${score * 10}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Consistency */}
        <div className="mb-10 anim-fade-up anim-delay-2">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-bone/40 text-[11px] tracking-wider font-light">
              Consistencia
            </span>
            <span
              className={`text-sm font-light ${
                result.consistency.score >= 80
                  ? 'text-success'
                  : result.consistency.score >= 60
                    ? 'text-warning'
                    : 'text-danger'
              }`}
            >
              {result.consistency.score}%
            </span>
          </div>
          {result.consistency.flags.length > 0 && (
            <button
              onClick={() => setShowFlags(!showFlags)}
              className="text-bone/20 hover:text-bone/40 transition bg-transparent border border-bone/10 rounded-lg px-4 py-2 cursor-pointer text-[10px] tracking-[0.2em] uppercase mt-2"
            >
              {showFlags
                ? 'OCULTAR'
                : `VER INCONSISTENCIAS (${result.consistency.flags.length})`}
            </button>
          )}
          {showFlags && (
            <div className="mt-4 space-y-4">
              {result.consistency.flags.map((f, i) => (
                <div key={i} className="border-l border-warning/30 pl-4 py-1">
                  <p className="text-bone/40 text-xs font-light leading-relaxed">
                    &ldquo;{f.q1}&rdquo;
                    <span className="text-bone/20"> &rarr; {RESPONSE_LABELS[f.q1Answer]}</span>
                  </p>
                  <p className="text-bone/40 text-xs font-light leading-relaxed mt-1">
                    &ldquo;{f.q2}&rdquo;
                    <span className="text-bone/20"> &rarr; {RESPONSE_LABELS[f.q2Answer]}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-8 anim-fade-up anim-delay-3">
          <button
            onClick={() => navigate('/personalidad/historial')}
            className="text-bone/30 hover:text-bone/60 transition bg-transparent border border-bone/10 rounded-lg px-6 py-3 cursor-pointer text-[10px] tracking-[0.2em] uppercase"
          >
            VER HISTORIAL
          </button>
          <button
            onClick={() => navigate('/personalidad')}
            className="text-bone/20 hover:text-bone/40 transition bg-transparent border-0 cursor-pointer text-[10px] tracking-[0.2em] uppercase"
          >
            VOLVER
          </button>
        </div>
      </div>
    </div>
  );
}
