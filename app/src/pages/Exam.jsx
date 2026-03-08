import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { loadQuestions, pickRandom, pickErrorBased, pickByFactor, FACTOR_LABELS } from '../services/questions';
import { calculateScore } from '../services/scoring';
import { saveAttempt, getAttempts } from '../services/storage';
import { useTimer } from '../hooks/useTimer';
import Starfield from '../components/Starfield';
import VisualQuestion, { isVisualQuestion } from '../components/VisualQuestion';

export default function Exam() {
  const navigate = useNavigate();
  const location = useLocation();
  const { factor } = useParams();
  const isErrorExam = location.pathname.includes('errores');
  const isFactorExam = !!factor;

  const factorConfig = isFactorExam ? FACTOR_LABELS[factor] : null;
  const examTime = factorConfig ? factorConfig.time : 1200;
  const examCount = factorConfig ? factorConfig.questions : 40;

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(Date.now());

  const timer = useTimer(examTime);

  const finishExam = useCallback(
    (timedOut = false) => {
      timer.stop();
      const score = calculateScore(questions, answers);
      const attempt = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        questionIds: questions.map((q) => q.id),
        questions: questions,
        answers: [...answers],
        ...score,
        duration: Math.round((Date.now() - startTime) / 1000),
        timedOut,
        isErrorExam,
        factor: factor || null,
      };
      saveAttempt(attempt);
      setResult(attempt);
      setFinished(true);
    },
    [questions, answers, timer, startTime, isErrorExam, factor]
  );

  useEffect(() => {
    timer.setOnTimeUp(() => finishExam(true));
  }, [timer, finishExam]);

  useEffect(() => {
    (async () => {
      try {
        const allQuestions = await loadQuestions();
        let selected;
        if (isFactorExam) {
          selected = pickByFactor(allQuestions, factor, examCount);
        } else if (isErrorExam) {
          const attempts = getAttempts();
          const failedIds = new Set();
          attempts.forEach((a) => {
            a.details?.forEach((d) => {
              if (!d.isCorrect && !d.isBlank) failedIds.add(d.questionId);
            });
          });
          selected = pickErrorBased(allQuestions, [...failedIds], 40);
        } else {
          selected = pickRandom(allQuestions, 40);
        }
        setQuestions(selected);
        setAnswers(new Array(selected.length).fill(null));
        setLoading(false);
        timer.start();
      } catch (err) {
        console.error('Error generating exam:', err);
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectAnswer = (optionIndex) => {
    const newAnswers = [...answers];
    const wasSelected = newAnswers[currentIndex] === optionIndex;
    newAnswers[currentIndex] = wasSelected ? null : optionIndex;
    setAnswers(newAnswers);

    // Auto-advance after selecting (not deselecting)
    if (!wasSelected && currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    }
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const skipQuestion = () => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = null;
    setAnswers(newAnswers);
    goNext();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Starfield />
        <p className="text-bone/30 text-xs tracking-[0.2em] uppercase z-10">
          Generando examen...
        </p>
      </div>
    );
  }

  if (finished && result) {
    return <ExamResults result={result} navigate={navigate} />;
  }

  const q = questions[currentIndex];
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const catLabel = q.category.replace(/-/g, ' ').toUpperCase();
  const headerLabel = isFactorExam && factorConfig ? factorConfig.name.toUpperCase() : isErrorExam ? 'EXAMEN DE ERRORES' : 'EXAMEN';

  return (
    <div className="min-h-screen relative">
      <Starfield />

      {/* Timer */}
      <div
        className={`fixed top-6 right-8 z-50 font-mono text-sm tracking-wider ${
          timer.isCritical
            ? 'text-danger timer-warning'
            : timer.isWarning
              ? 'text-warning'
              : 'text-bone/40'
        }`}
      >
        {timer.formatted}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => {
              if (confirm('Salir del examen? Se perdera el progreso.')) navigate(isFactorExam ? '/psicotecnico/temas' : '/psicotecnico');
            }}
            className="text-bone/20 hover:text-bone/50 transition bg-transparent border-0 cursor-pointer text-lg"
          >
            ←
          </button>
          <span className="text-bone/25 text-[10px] tracking-[0.2em] uppercase">
            {headerLabel}
          </span>
          <span className="text-bone/25 text-[10px] tracking-[0.2em]">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-[1px] bg-bone/5 mb-10">
          <div
            className="progress-bar h-[1px] bg-bone/20"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Category label */}
        <p className="text-bone/15 text-[9px] tracking-[0.3em] uppercase mb-6">
          {catLabel}
        </p>

        {/* Question */}
        <div className="mb-10">
          <p className="text-bone/80 text-base font-light leading-relaxed">
            <span className="text-bone/30 font-mono text-sm mr-3">
              {currentIndex + 1}.
            </span>
            {q.question}
          </p>
        </div>

        {/* Options */}
        {isVisualQuestion(q) ? (
          <div className="mb-10">
            <VisualQuestion
              question={q}
              selectedAnswer={answers[currentIndex]}
              onSelect={selectAnswer}
            />
          </div>
        ) : (
          <div className="space-y-3 mb-10">
            {q.options.map((opt, i) => {
              const isSelected = answers[currentIndex] === i;
              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  className={`exam-option ${isSelected ? 'selected' : ''} w-full text-left px-6 py-4 rounded-lg cursor-pointer flex items-center gap-4`}
                >
                  <span
                    className={`font-mono text-xs tracking-wider ${
                      isSelected ? 'text-accent' : 'text-bone/25'
                    }`}
                  >
                    {letters[i]}
                  </span>
                  <span
                    className={`text-sm font-light ${
                      isSelected ? 'text-bone/90' : 'text-bone/55'
                    }`}
                  >
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="text-bone/20 hover:text-bone/50 disabled:opacity-10 disabled:cursor-not-allowed transition bg-transparent border-0 cursor-pointer text-sm tracking-wider"
          >
            ←  ANTERIOR
          </button>

          <button
            onClick={skipQuestion}
            className="text-bone/15 hover:text-bone/30 transition bg-transparent border-0 cursor-pointer text-[10px] tracking-[0.2em] uppercase"
          >
            PASAR
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={() => finishExam(false)}
              className="text-accent/70 hover:text-accent transition bg-transparent border-0 cursor-pointer text-sm tracking-wider"
            >
              FINALIZAR  →
            </button>
          ) : (
            <button
              onClick={goNext}
              className="text-bone/20 hover:text-bone/50 transition bg-transparent border-0 cursor-pointer text-sm tracking-wider"
            >
              SIGUIENTE  →
            </button>
          )}
        </div>

        {/* Question grid navigator */}
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

function ExamResults({ result, navigate }) {
  const [showReview, setShowReview] = useState(false);
  const gradeColor = result.grade >= 7 ? 'text-success' : result.grade >= 5 ? 'text-warning' : 'text-danger';
  const failedDetails = result.details.filter((d) => !d.isCorrect && !d.isBlank);
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const factorName = result.factor && FACTOR_LABELS[result.factor] ? FACTOR_LABELS[result.factor].name : null;

  return (
    <div className="min-h-screen relative">
      <Starfield />
      <div className="relative z-10 max-w-2xl mx-auto px-8 py-16">
        <h1 className="text-center text-bone/60 text-xs tracking-[0.3em] font-light uppercase mb-12 anim-fade-down">
          RESULTADO
        </h1>

        {result.timedOut && (
          <p className="text-center text-warning/60 text-[10px] tracking-[0.2em] uppercase mb-8">
            TIEMPO AGOTADO
          </p>
        )}

        {/* Grade */}
        <div className="text-center mb-12 anim-fade-up anim-delay-1">
          <p className={`text-6xl font-extralight ${gradeColor}`}>
            {result.grade.toFixed(2)}
          </p>
          <p className="text-bone/20 text-[10px] tracking-[0.2em] mt-2">SOBRE 10</p>
          <p className="text-bone/15 text-[10px] tracking-wider mt-1">
            Puntuacion bruta: {result.rawScore} / {result.totalQuestions}
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-12 mb-12 anim-fade-up anim-delay-2">
          <div className="text-center">
            <p className="text-2xl font-extralight text-success">{result.correct}</p>
            <p className="text-bone/20 text-[9px] tracking-[0.2em] mt-1">ACIERTOS</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extralight text-danger">{result.wrong}</p>
            <p className="text-bone/20 text-[9px] tracking-[0.2em] mt-1">FALLOS</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extralight text-bone/30">{result.blank}</p>
            <p className="text-bone/20 text-[9px] tracking-[0.2em] mt-1">EN BLANCO</p>
          </div>
        </div>

        <p className="text-center text-bone/15 text-[10px] tracking-wider mb-10">
          {Math.floor(result.duration / 60)}m {result.duration % 60}s
          {result.isErrorExam && ' · Examen de errores'}
          {factorName && ` · ${factorName}`}
        </p>

        {/* Actions */}
        <div className="flex justify-center gap-8 mb-12 anim-fade-up anim-delay-3">
          <button
            onClick={() => setShowReview(!showReview)}
            className="text-bone/30 hover:text-bone/60 transition bg-transparent border border-bone/10 rounded-lg px-6 py-3 cursor-pointer text-[10px] tracking-[0.2em] uppercase"
          >
            {showReview ? 'OCULTAR' : `REPASAR FALLOS (${failedDetails.length})`}
          </button>
          <button
            onClick={() => navigate(result.factor ? '/psicotecnico/temas' : '/psicotecnico')}
            className="text-bone/20 hover:text-bone/40 transition bg-transparent border-0 cursor-pointer text-[10px] tracking-[0.2em] uppercase"
          >
            VOLVER
          </button>
        </div>

        {/* Review */}
        {showReview && (
          <div className="space-y-6">
            {failedDetails.length === 0 ? (
              <p className="text-bone/20 text-center text-sm">
                No has fallado ninguna pregunta
              </p>
            ) : (
              failedDetails.map((d, i) => (
                <div
                  key={i}
                  className="border-l border-danger/30 pl-6 py-2"
                >
                  <p className="text-bone/60 text-sm font-light mb-4 leading-relaxed">
                    {d.question}
                  </p>
                  {!d.visualType ? (
                    <div className="space-y-2">
                      {d.options.map((opt, j) => (
                        <p
                          key={j}
                          className={`text-xs font-light flex items-center gap-3 ${
                            j === d.correctAnswer
                              ? 'text-success/70'
                              : j === d.userAnswer
                                ? 'text-danger/50 line-through'
                                : 'text-bone/15'
                          }`}
                        >
                          <span className="font-mono text-[10px]">{letters[j]}</span>
                          {opt}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-bone/25 text-xs italic">
                      Respuesta correcta: {letters[d.correctAnswer]}
                      {d.userAnswer !== null && ` · Tu respuesta: ${letters[d.userAnswer]}`}
                    </p>
                  )}
                  {d.explanation && (
                    <p className="text-bone/20 text-[11px] mt-3 font-light leading-relaxed">
                      {d.explanation}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
