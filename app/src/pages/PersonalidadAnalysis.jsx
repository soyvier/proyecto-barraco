import { useNavigate } from 'react-router-dom';
import {
  getPersonalidadAttempts,
  DIMENSION_LABELS,
  DIMENSION_ORDER,
} from '../services/personalidad';
import Starfield from '../components/Starfield';

export default function PersonalidadAnalysis() {
  const navigate = useNavigate();
  const attempts = getPersonalidadAttempts();

  const dimColor = (score) =>
    score >= 7 ? 'text-success' : score >= 5 ? 'text-warning' : 'text-danger';

  const barColor = (score) =>
    score >= 7
      ? 'bg-success/60'
      : score >= 5
        ? 'bg-warning/60'
        : 'bg-danger/60';

  if (attempts.length === 0) {
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
            ANALISIS DE PERSONALIDAD
          </h1>
          <p className="text-center text-bone/20 text-sm font-light anim-fade-up">
            Completa al menos un test para ver el analisis
          </p>
        </div>
      </div>
    );
  }

  // Average scores across all attempts per dimension
  const avgDims = {};
  for (const dim of DIMENSION_ORDER) {
    const scores = attempts.map((a) => a.dimensions[dim] || 0);
    avgDims[dim] = scores.reduce((s, v) => s + v, 0) / scores.length;
  }

  // Consistency trend
  const consistencyScores = attempts.map((a) => a.consistency.score);
  const avgConsistency =
    consistencyScores.reduce((s, v) => s + v, 0) / consistencyScores.length;

  // Evolution data (last 10 attempts)
  const recent = attempts.slice(-10);
  const dimsNoSinc = DIMENSION_ORDER.filter((d) => d !== 'sinceridad');

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

        <h1 className="text-center text-bone/80 text-xs tracking-[0.3em] font-light uppercase mb-4 anim-fade-down">
          ANALISIS DE PERSONALIDAD
        </h1>
        <p className="text-center text-bone/15 text-[10px] tracking-wider mb-12">
          {attempts.length} test{attempts.length !== 1 ? 's' : ''} realizados
        </p>

        {/* Average profile */}
        <div className="mb-12 anim-fade-up anim-delay-1">
          <h2 className="text-bone/40 text-[10px] tracking-[0.25em] uppercase mb-6">
            PERFIL PROMEDIO
          </h2>
          <div className="space-y-4">
            {DIMENSION_ORDER.map((dim) => {
              const score = avgDims[dim];
              return (
                <div key={dim}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-bone/50 text-[11px] tracking-wider font-light">
                      {DIMENSION_LABELS[dim]}
                      {dim === 'sinceridad' ? ' (control)' : ''}
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
        </div>

        {/* Consistency average */}
        <div className="mb-12 anim-fade-up anim-delay-2">
          <h2 className="text-bone/40 text-[10px] tracking-[0.25em] uppercase mb-4">
            CONSISTENCIA PROMEDIO
          </h2>
          <div className="flex items-baseline gap-3">
            <span
              className={`text-2xl font-extralight ${
                avgConsistency >= 80
                  ? 'text-success'
                  : avgConsistency >= 60
                    ? 'text-warning'
                    : 'text-danger'
              }`}
            >
              {Math.round(avgConsistency)}%
            </span>
            <span className="text-bone/15 text-[10px] tracking-wider">
              de respuestas coherentes en preguntas pareadas
            </span>
          </div>
        </div>

        {/* Evolution chart (simple bar chart) */}
        {recent.length >= 2 && (
          <div className="mb-12 anim-fade-up anim-delay-3">
            <h2 className="text-bone/40 text-[10px] tracking-[0.25em] uppercase mb-6">
              EVOLUCION (ultimos {recent.length} tests)
            </h2>
            <div className="space-y-6">
              {dimsNoSinc.map((dim) => (
                <div key={dim}>
                  <span className="text-bone/35 text-[10px] tracking-wider font-light block mb-2">
                    {DIMENSION_LABELS[dim]}
                  </span>
                  <div className="flex items-end gap-1 h-12">
                    {recent.map((a, i) => {
                      const score = a.dimensions[dim] || 0;
                      return (
                        <div
                          key={i}
                          className={`flex-1 rounded-t ${barColor(score)}`}
                          style={{ height: `${score * 10}%` }}
                          title={`${score.toFixed(1)} - ${new Date(a.date).toLocaleDateString('es-ES')}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-bone/10 text-[8px]">
                      {new Date(recent[0].date).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                    <span className="text-bone/10 text-[8px]">
                      {new Date(
                        recent[recent.length - 1].date
                      ).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="border-t border-bone/5 pt-8 mt-8">
          <h2 className="text-bone/40 text-[10px] tracking-[0.25em] uppercase mb-4">
            CONSEJOS
          </h2>
          <ul className="space-y-2 text-bone/25 text-xs font-light leading-relaxed">
            {avgDims['sinceridad'] > 9 && (
              <li className="text-warning/60">
                Tu sinceridad es demasiado alta. Nadie es perfecto — responder siempre
                de forma ideal puede invalidar el test en un examen real.
              </li>
            )}
            {avgConsistency < 70 && (
              <li className="text-warning/60">
                Tu consistencia es baja. Intenta responder de forma coherente a
                preguntas similares.
              </li>
            )}
            {dimsNoSinc.some((d) => avgDims[d] < 5) && (
              <li>
                Algunas dimensiones estan por debajo de 5. En un examen real, se
                busca un perfil equilibrado sin extremos bajos.
              </li>
            )}
            <li>
              La practica repetida ayuda a responder de forma mas consistente y
              natural. Realiza tests periodicamente.
            </li>
          </ul>
        </div>

        {/* Back */}
        <div className="flex justify-center mt-12">
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
