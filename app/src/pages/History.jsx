import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAttempts } from '../services/storage';
import Starfield from '../components/Starfield';

export default function History() {
  const navigate = useNavigate();
  const attempts = getAttempts().sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const [selectedId, setSelectedId] = useState(null);
  const selected = attempts.find((a) => a.id === selectedId);
  const letters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="min-h-screen relative">
      <Starfield />
      <div className="relative z-10 max-w-2xl mx-auto px-8 py-16">
        <button
          onClick={() => navigate('/psicotecnico')}
          className="text-bone/30 hover:text-bone/60 transition mb-16 bg-transparent border-0 cursor-pointer text-lg"
        >
          ←
        </button>

        <h1 className="text-center text-bone/80 text-xs tracking-[0.3em] font-light uppercase mb-12 anim-fade-down">
          HISTORIAL
        </h1>

        {attempts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-bone/20 text-xs tracking-[0.2em]">
              AUN NO HAS REALIZADO NINGUN EXAMEN
            </p>
            <button
              onClick={() => navigate('/psicotecnico/examen')}
              className="mt-8 text-bone/30 hover:text-bone/60 transition bg-transparent border border-bone/10 rounded-lg px-6 py-3 cursor-pointer text-[10px] tracking-[0.2em] uppercase"
            >
              INICIAR EXAMEN
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((a) => {
              const dateStr = new Date(a.date).toLocaleString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              });
              const gradeColor = a.grade >= 7 ? 'text-success' : a.grade >= 5 ? 'text-warning' : 'text-danger';
              const isOpen = selectedId === a.id;

              return (
                <div key={a.id}>
                  <button
                    onClick={() => setSelectedId(isOpen ? null : a.id)}
                    className={`card-dark w-full text-left rounded-lg px-6 py-5 cursor-pointer ${
                      isOpen ? 'border-bone/15' : ''
                    }`}
                    style={isOpen ? { borderColor: 'rgba(245,240,232,0.15)' } : {}}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-bone/20 text-[10px] tracking-wider">{dateStr}</p>
                        <div className="flex items-center gap-6 mt-2">
                          <span className={`text-xl font-extralight ${gradeColor}`}>
                            {a.grade.toFixed(2)}
                          </span>
                          <span className="text-bone/20 text-[10px] tracking-wider">
                            {a.correct}✓  {a.wrong}✗  {a.blank}○
                          </span>
                          {a.timedOut && (
                            <span className="text-warning/40 text-[9px] tracking-wider">
                              TIEMPO
                            </span>
                          )}
                          {a.isErrorExam && (
                            <span className="text-accent/40 text-[9px] tracking-wider">
                              ERRORES
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-bone/15 text-xs">
                        {isOpen ? '▲' : '▼'}
                      </span>
                    </div>
                  </button>

                  {isOpen && selected && (
                    <div className="border-l border-bone/5 ml-6 pl-6 py-4 space-y-4 mt-2">
                      <p className="text-bone/20 text-[10px] tracking-wider">
                        Duracion: {Math.floor(selected.duration / 60)}m {selected.duration % 60}s
                      </p>
                      {selected.details?.map((d, i) => (
                        <div
                          key={i}
                          className={`border-l pl-4 py-2 ${
                            d.isBlank
                              ? 'border-bone/10'
                              : d.isCorrect
                                ? 'border-success/30'
                                : 'border-danger/30'
                          }`}
                        >
                          <p className="text-bone/50 text-xs font-light mb-2">
                            <span className="text-bone/20 font-mono mr-2">{i + 1}.</span>
                            {d.question}
                          </p>
                          <div className="space-y-1">
                            {d.options.map((opt, j) => (
                              <p
                                key={j}
                                className={`text-[11px] font-light ${
                                  j === d.correctAnswer
                                    ? 'text-success/60'
                                    : j === d.userAnswer && !d.isCorrect
                                      ? 'text-danger/40 line-through'
                                      : 'text-bone/15'
                                }`}
                              >
                                <span className="font-mono text-[9px] mr-2">{letters[j]}</span>
                                {opt}
                              </p>
                            ))}
                          </div>
                          {d.isBlank && (
                            <p className="text-bone/10 text-[10px] mt-1 italic">Sin respuesta</p>
                          )}
                          {d.explanation && !d.isCorrect && (
                            <p className="text-bone/15 text-[10px] mt-2 font-light">
                              {d.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
