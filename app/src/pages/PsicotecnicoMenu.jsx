import { useNavigate } from 'react-router-dom';
import Starfield from '../components/Starfield';

export default function PsicotecnicoMenu() {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'INICIAR EXAMEN',
      description: '40 preguntas · 20 minutos',
      path: '/psicotecnico/examen',
    },
    {
      title: 'PRACTICAR POR TEMAS',
      description: 'Elige una categoria para practicar',
      path: '/psicotecnico/temas',
    },
    {
      title: 'EXAMEN DE ERRORES',
      description: 'Preguntas falladas previamente',
      path: '/psicotecnico/examen-errores',
    },
    {
      title: 'HISTORIAL',
      description: 'Intentos anteriores',
      path: '/psicotecnico/historial',
    },
    {
      title: 'ANALISIS',
      description: 'Estadisticas y patrones',
      path: '/psicotecnico/analisis',
    },
  ];

  return (
    <div className="min-h-screen relative">
      <Starfield />

      <div className="relative z-10 max-w-2xl mx-auto px-8 py-16">
        {/* Back arrow */}
        <button
          onClick={() => navigate('/')}
          className="text-bone/30 hover:text-bone/60 transition mb-16 bg-transparent border-0 cursor-pointer text-lg"
        >
          ←
        </button>

        {/* Title */}
        <h1 className="text-center text-bone/80 text-xs tracking-[0.3em] font-light uppercase mb-16 anim-fade-down">
          PSICOTECNICO
        </h1>

        {/* Menu items */}
        <div className="space-y-4">
          {menuItems.map((item, i) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`card-dark w-full rounded-lg px-8 py-6 text-left cursor-pointer anim-fade-up anim-delay-${Math.min(i + 1, 3)}`}
            >
              <h2 className="text-bone/70 text-xs tracking-[0.2em] font-light">
                {item.title}
              </h2>
              <p className="text-bone/25 text-[11px] tracking-wider font-light mt-1">
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
