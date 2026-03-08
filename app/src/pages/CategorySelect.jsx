import { useNavigate } from 'react-router-dom';
import { FACTOR_LABELS, FACTOR_ORDER } from '../services/questions';
import Starfield from '../components/Starfield';

function formatTime(seconds) {
  return `${Math.floor(seconds / 60)} min`;
}

export default function CategorySelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      <Starfield />

      <div className="relative z-10 max-w-2xl mx-auto px-8 py-16">
        {/* Back arrow */}
        <button
          onClick={() => navigate('/psicotecnico')}
          className="text-bone/30 hover:text-bone/60 transition mb-16 bg-transparent border-0 cursor-pointer text-lg"
        >
          ←
        </button>

        {/* Title */}
        <h1 className="text-center text-bone/80 text-xs tracking-[0.3em] font-light uppercase mb-4 anim-fade-down">
          PRACTICAR POR TEMAS
        </h1>
        <p className="text-center text-bone/20 text-[10px] tracking-wider font-light mb-16">
          Estructura oficial UVE
        </p>

        {/* Factor cards */}
        <div className="space-y-4">
          {FACTOR_ORDER.map((factor, i) => {
            const f = FACTOR_LABELS[factor];
            return (
              <button
                key={factor}
                onClick={() => navigate(`/psicotecnico/factor/${factor}`)}
                className={`card-dark w-full rounded-lg px-8 py-6 text-left cursor-pointer anim-fade-up anim-delay-${Math.min(i + 1, 3)} flex items-center justify-between`}
              >
                <div>
                  <h2 className="text-bone/70 text-xs tracking-[0.2em] font-light">
                    {f.name.toUpperCase()}
                  </h2>
                  <p className="text-bone/20 text-[10px] tracking-wider font-light mt-1">
                    {f.desc}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-6">
                  <p className="text-bone/30 text-[10px] tracking-wider font-mono">
                    {f.questions}q
                  </p>
                  <p className="text-bone/15 text-[9px] tracking-wider mt-0.5">
                    {formatTime(f.time)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
