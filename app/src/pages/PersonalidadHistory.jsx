import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPersonalidadAttempts,
  DIMENSION_LABELS,
  DIMENSION_ORDER,
} from '../services/personalidad';
import Starfield from '../components/Starfield';

export default function PersonalidadHistory() {
  const navigate = useNavigate();
  const attempts = getPersonalidadAttempts().slice().reverse();
  const [expandedId, setExpandedId] = useState(null);

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
        <button
          onClick={() => navigate('/personalidad')}
          className="text-bone/30 hover:text-bone/60 transition mb-16 bg-transparent border-0 cursor-pointer text-lg"
        >
          &larr;
        </button>

        <h1 className="text-center text-bone/80 text-xs tracking-[0.3em] font-light uppercase mb-12 anim-fade-down">
          HISTORIAL DE PERSONALIDAD
        </h1>

        {attempts.length === 0 ? (
          <p className="text-center text-bone/20 text-sm font-light anim-fade-up">
            No hay intentos registrados
          </p>
        ) : (
          <div className="space-y-3 anim-fade-up anim-delay-1">
            {attempts.map((a) => {
              const isExpanded = expandedId === a.id;
              const date = new Date(a.date);
              const dateStr = date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });
              const timeStr = date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              });

              // Average dimension score (excluding sinceridad)
              const dims = DIMENSION_ORDER.filter((d) => d !== 'sinceridad');
              const avg =
                dims.reduce((s, d) => s + (a.dimensions[d] || 0), 0) /
                dims.length;

              return (
                <div key={a.id}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : a.id)}
                    className="card-dark w-full rounded-lg px-6 py-5 text-left cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-bone/50 text-[11px] tracking-wider font-light">
                          {dateStr} {timeStr}
                        </span>
                        <span className="text-bone/20 text-[10px] tracking-wider ml-3">
                          {a.type === 'completo' ? 'Completo' : 'Rapido'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-bone/20 text-[10px] tracking-wider">
                          Consist. {a.consistency.score}%
                        </span>
                        <span className={`text-sm font-light ${dimColor(avg)}`}>
                          {avg.toFixed(1)}
                        </span>
                        <span className="text-bone/20 text-[10px]">
                          {isExpanded ? '−' : '+'}
                        </span>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 py-5 border-l border-bone/5 ml-3 mt-1 space-y-3">
                      {DIMENSION_ORDER.map((dim) => {
                        const score = a.dimensions[dim] || 0;
                        return (
                          <div key={dim}>
                            <div className="flex justify-between items-baseline mb-1">
                              <span className="text-bone/35 text-[10px] tracking-wider font-light">
                                {DIMENSION_LABELS[dim]}
                                {dim === 'sinceridad' ? ' (control)' : ''}
                              </span>
                              <span
                                className={`text-xs font-light ${dimColor(score)}`}
                              >
                                {score.toFixed(1)}
                              </span>
                            </div>
                            <div className="w-full h-[2px] bg-bone/5 rounded-full">
                              <div
                                className={`h-[2px] rounded-full ${barColor(score)}`}
                                style={{ width: `${score * 10}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {a.sinceridad?.warning && (
                        <p className="text-warning/60 text-[10px] tracking-wider mt-2">
                          Sinceridad excesiva detectada
                        </p>
                      )}
                      <p className="text-bone/15 text-[10px] tracking-wider mt-2">
                        {Math.floor(a.duration / 60)}m {a.duration % 60}s
                        {a.blanks > 0 && ` \u00b7 ${a.blanks} sin responder`}
                      </p>
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
