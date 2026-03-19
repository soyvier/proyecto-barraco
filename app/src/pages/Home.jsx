import { useNavigate } from 'react-router-dom';
import BackgroundSlideshow from '../components/BackgroundSlideshow';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      <BackgroundSlideshow />

      {/* Title */}
      <div className="z-10 text-center mb-20 anim-fade-down">
        <h1 className="text-bone tracking-[0.3em] font-extralight text-4xl">
          PROYECTO
        </h1>
        <p className="text-bone/60 tracking-[0.15em] font-light text-2xl italic mt-1">
          barraco
        </p>
      </div>

      {/* Cards */}
      <div className="z-10 flex gap-10 anim-fade-up anim-delay-1">
        {/* Psicotecnico */}
        <button
          onClick={() => navigate('/psicotecnico')}
          className="card-glass rounded-xl px-12 py-10 w-56 text-center"
        >
          <h2 className="text-bone/80 text-xs tracking-[0.25em] font-light uppercase">
            Psicotecnico
          </h2>
          <p className="card-subtitle text-bone/30 text-[11px] tracking-wider font-light">
            Examenes de aptitud
          </p>
        </button>

        {/* Personalidad */}
        <button
          onClick={() => navigate('/personalidad')}
          className="card-glass rounded-xl px-12 py-10 w-56 text-center"
        >
          <h2 className="text-bone/80 text-xs tracking-[0.25em] font-light uppercase">
            Personalidad
          </h2>
          <p className="card-subtitle text-bone/30 text-[11px] tracking-wider font-light">
            Test de perfil psicologico
          </p>
        </button>
      </div>
    </div>
  );
}
